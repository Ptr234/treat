using System.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using OscApi.Common;
using OscApi.Data;
using OscApi.Models;

namespace OscApi.Tests.Common;

/// <summary>
/// Emails are written to a durable outbox and delivered by a background worker,
/// so a restart or deploy can't drop them, and transient failures are retried
/// across restarts with the same idempotency key.
/// </summary>
public class EmailOutboxTests
{
    private sealed class ScriptedHandler(params Func<HttpResponseMessage>[] script) : HttpMessageHandler
    {
        public List<string?> IdempotencyKeys { get; } = [];

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            IdempotencyKeys.Add(request.Headers.TryGetValues("Idempotency-Key", out var v) ? v.Single() : null);
            var step = script[Math.Min(IdempotencyKeys.Count - 1, script.Length - 1)];
            return Task.FromResult(step());
        }
    }

    private static HttpResponseMessage Ok() => new(HttpStatusCode.OK) { Content = new StringContent("{\"id\":\"re_42\"}") };
    private static HttpResponseMessage Status(HttpStatusCode c) => new(c) { Content = new StringContent("{\"message\":\"nope\"}") };

    private sealed record Rig(ServiceProvider Services, EmailService Email, EmailOutboxWorker Worker, ScriptedHandler Handler)
    {
        public OscDbContext Db() => Services.CreateScope().ServiceProvider.GetRequiredService<OscDbContext>();

        /// <summary>A brand-new worker over the same database — what a process restart looks like.</summary>
        public EmailOutboxWorker Restart() => new(Services.GetRequiredService<IServiceScopeFactory>(), Email,
            Services.GetRequiredService<EmailOutboxSignal>(), NullLogger<EmailOutboxWorker>.Instance);
    }

    private static Rig Build(string? apiKey = "re_test", params Func<HttpResponseMessage>[] script)
    {
        var root = new InMemoryDatabaseRoot();
        var dbName = Guid.NewGuid().ToString();
        var services = new ServiceCollection();
        services.AddDbContext<OscDbContext>(o => o.UseInMemoryDatabase(dbName, root));
        services.AddSingleton<EmailOutboxSignal>();
        services.AddSingleton<IEmailOutbox, EmailOutbox>();
        var sp = services.BuildServiceProvider();
        using (var scope = sp.CreateScope()) scope.ServiceProvider.GetRequiredService<OscDbContext>().Database.EnsureCreated();

        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Resend:ApiKey"] = apiKey,
            ["Resend:AdminEmail"] = "admin@uia.go.ug",
        }).Build();
        var handler = new ScriptedHandler(script.Length == 0 ? [Ok] : script);
        var email = new EmailService(config, NullLogger<EmailService>.Instance, new HttpClient(handler),
            TimeSpan.Zero, TimeSpan.Zero, sp.GetRequiredService<IEmailOutbox>());
        var worker = new EmailOutboxWorker(sp.GetRequiredService<IServiceScopeFactory>(), email,
            sp.GetRequiredService<EmailOutboxSignal>(), NullLogger<EmailOutboxWorker>.Instance);
        return new Rig(sp, email, worker, handler);
    }

    private static Task Send(EmailService email) =>
        email.SendTicketReplyAsync("investor@gmail.com", "Amina", "UIA-2026-0001", "Land", "Here is the process.", "tok");

    [Fact]
    public async Task Sending_QueuesInTheOutbox_WithoutCallingTheProvider()
    {
        var rig = Build();
        await Send(rig.Email);

        var row = Assert.Single(rig.Db().EmailOutbox);
        Assert.Equal(EmailOutboxStatus.Pending, row.Status);
        Assert.Equal("investor@gmail.com", row.To);
        Assert.Contains("UIA-2026-0001", row.PayloadJson);
        Assert.Empty(rig.Handler.IdempotencyKeys); // nothing sent inline
    }

    [Fact]
    public async Task Worker_DeliversAndRecordsTheProviderId()
    {
        var rig = Build();
        await Send(rig.Email);

        Assert.Equal(1, await rig.Worker.ProcessDueAsync());

        var row = Assert.Single(rig.Db().EmailOutbox);
        Assert.Equal(EmailOutboxStatus.Sent, row.Status);
        Assert.Equal("re_42", row.ProviderMessageId);
        Assert.NotNull(row.SentAt);
    }

    [Fact]
    public async Task TransientFailure_IsRetriedLater_AcrossARestart_WithTheSameIdempotencyKey()
    {
        var rig = Build("re_test", () => Status(HttpStatusCode.ServiceUnavailable), Ok);
        await Send(rig.Email);

        await rig.Worker.ProcessDueAsync();
        var afterFailure = Assert.Single(rig.Db().EmailOutbox);
        Assert.Equal(EmailOutboxStatus.Pending, afterFailure.Status);
        Assert.Equal(1, afterFailure.Attempts);
        Assert.True(afterFailure.NextAttemptAt > DateTimeOffset.UtcNow.AddSeconds(30)); // backed off (1 min)

        // Not due yet: nothing happens.
        Assert.Equal(0, await rig.Worker.ProcessDueAsync());

        // Time passes and the process restarts (e.g. a deploy) — the new worker still sends it.
        using (var db = rig.Db())
        {
            db.EmailOutbox.Single().NextAttemptAt = DateTimeOffset.UtcNow.AddSeconds(-1);
            db.SaveChanges();
        }
        await rig.Restart().ProcessDueAsync();

        var sent = Assert.Single(rig.Db().EmailOutbox);
        Assert.Equal(EmailOutboxStatus.Sent, sent.Status);
        Assert.Equal(2, sent.Attempts);
        Assert.Equal(2, rig.Handler.IdempotencyKeys.Count);
        Assert.Equal(rig.Handler.IdempotencyKeys[0], rig.Handler.IdempotencyKeys[1]);
    }

    [Fact]
    public async Task PermanentRejection_IsNotRetried()
    {
        var rig = Build("re_test", () => Status(HttpStatusCode.UnprocessableEntity));
        await Send(rig.Email);
        await rig.Worker.ProcessDueAsync();

        var row = Assert.Single(rig.Db().EmailOutbox);
        Assert.Equal(EmailOutboxStatus.Failed, row.Status);
        Assert.Contains("422", row.LastError);
    }

    [Fact]
    public async Task WithoutAnApiKey_NothingIsQueuedOrSent()
    {
        // Local development: no Resend key, so emails are dropped up front
        // (logged) rather than piling up as unsendable outbox rows.
        var rig = Build(apiKey: null);
        await Send(rig.Email);
        await rig.Worker.ProcessDueAsync();

        Assert.Empty(rig.Db().EmailOutbox);
        Assert.Empty(rig.Handler.IdempotencyKeys);
    }

    [Fact]
    public async Task KeyRemovedAfterQueueing_RowIsMarkedSkipped_NotRetriedForever()
    {
        var rig = Build();
        await Send(rig.Email);
        var noKey = new EmailService(new ConfigurationBuilder().Build(), NullLogger<EmailService>.Instance);
        var worker = new EmailOutboxWorker(rig.Services.GetRequiredService<IServiceScopeFactory>(), noKey,
            rig.Services.GetRequiredService<EmailOutboxSignal>(), NullLogger<EmailOutboxWorker>.Instance);

        await worker.ProcessDueAsync();

        Assert.Equal(EmailOutboxStatus.Skipped, Assert.Single(rig.Db().EmailOutbox).Status);
    }

    [Fact]
    public async Task GivesUp_AfterMaxAttempts()
    {
        var rig = Build("re_test", () => Status(HttpStatusCode.InternalServerError));
        await Send(rig.Email);

        for (var i = 0; i < EmailOutboxWorker.MaxAttempts; i++)
        {
            using (var db = rig.Db())
            {
                db.EmailOutbox.Single().NextAttemptAt = DateTimeOffset.UtcNow.AddSeconds(-1);
                db.SaveChanges();
            }
            await rig.Worker.ProcessDueAsync();
        }

        var row = Assert.Single(rig.Db().EmailOutbox);
        Assert.Equal(EmailOutboxStatus.Failed, row.Status);
        Assert.Equal(EmailOutboxWorker.MaxAttempts, row.Attempts);
    }

    [Fact]
    public async Task ReservedDomains_AreNeverQueued()
    {
        var rig = Build();
        await rig.Email.SendTicketReplyAsync("anonymous@feedback.invalid", "Anon", "UIA-1", "t", "r", "tok");
        Assert.Empty(rig.Db().EmailOutbox);
    }

    [Fact]
    public async Task SentRows_ArePurgedAfter30Days()
    {
        var rig = Build();
        using (var db = rig.Db())
        {
            db.EmailOutbox.Add(new EmailOutboxMessage
            {
                To = "old@example.com", Subject = "old", PayloadJson = "{}", Status = EmailOutboxStatus.Sent,
                CreatedAt = DateTimeOffset.UtcNow.AddDays(-31),
            });
            db.EmailOutbox.Add(new EmailOutboxMessage
            {
                To = "recent@example.com", Subject = "recent", PayloadJson = "{}", Status = EmailOutboxStatus.Sent,
            });
            db.SaveChanges();
        }

        await rig.Worker.ProcessDueAsync();

        Assert.Equal("recent@example.com", Assert.Single(rig.Db().EmailOutbox).To);
    }

    [Theory]
    [InlineData(1, 1)]
    [InlineData(4, 30)]
    [InlineData(8, 480)]
    public void Backoff_Grows(int attempts, int minutes) =>
        Assert.Equal(TimeSpan.FromMinutes(minutes), EmailOutboxWorker.BackoffAfter(attempts));
}
