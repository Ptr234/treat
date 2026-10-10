using Microsoft.EntityFrameworkCore;
using Npgsql;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.Tickets;
using OscApi.Models;
using OscApi.Services;
using OscApi.Tests.Helpers;

namespace OscApi.Tests.Services;

/// <summary>
/// Several SLA workers running at once (more than one API instance) must flag
/// and alert on a breached ticket exactly once. The in-memory test database has
/// no row locking, so this runs against a real PostgreSQL server, given by
/// OSC_TEST_POSTGRES (e.g. "Host=localhost;Username=postgres;Password=postgres").
/// Without it the test returns early and passes.
/// </summary>
public class SlaBreachConcurrencyPostgresTests
{
    private static readonly string? Server = Environment.GetEnvironmentVariable("OSC_TEST_POSTGRES");

    private static OscDbContext Context(string connectionString) =>
        new(new DbContextOptionsBuilder<OscDbContext>()
            .UseNpgsql(connectionString, o => o.EnableRetryOnFailure(3))
            .Options);

    [Fact]
    public async Task ConcurrentWorkers_FlagEachBreachOnce()
    {
        if (string.IsNullOrWhiteSpace(Server)) return;

        var database = $"osc_sla_test_{Guid.NewGuid():N}";
        var connectionString = new NpgsqlConnectionStringBuilder(Server) { Database = database }.ConnectionString;
        await using (var setup = Context(connectionString))
            await setup.Database.EnsureCreatedAsync();

        try
        {
            // File two tickets, then put their deadlines in the past.
            string[] references;
            await using (var db = Context(connectionString))
            {
                var svc = new TicketService(db, MockEmailService.Create(), new ReferenceNumberGenerator(db), new MockSettingsService());
                references = new string[2];
                for (var i = 0; i < references.Length; i++)
                {
                    var created = await svc.CreateAsync(new CreateTicketRequest(
                        "Trading licence", "Waiting three weeks", "general_inquiry", null,
                        "investor@example.com", "Investor", null, null, null, null), isStaff: false);
                    references[i] = created.GetType().GetProperty("ReferenceNumber")!.GetValue(created)!.ToString()!;
                }
                await db.Tickets.ExecuteUpdateAsync(set => set.SetProperty(t => t.SlaDeadlineAt, DateTimeOffset.UtcNow.AddHours(-1)));
            }

            // Four workers, each with its own connection, all at once.
            using var start = new ManualResetEventSlim(false);
            var workers = Enumerable.Range(0, 4).Select(_ => Task.Run(async () =>
            {
                await using var db = Context(connectionString);
                var svc = new TicketService(db, MockEmailService.Create(), new ReferenceNumberGenerator(db), new MockSettingsService());
                start.Wait();
                return await svc.ProcessSlaBreachesAsync();
            })).ToArray();
            start.Set();
            var processed = await Task.WhenAll(workers);

            // Every breach handled exactly once across all workers (and so alerted once).
            Assert.Equal(references.Length, processed.Sum());

            await using var check = Context(connectionString);
            Assert.Equal(references.Length, await check.Tickets.CountAsync(t => t.SlaBreachedAt != null));
            Assert.Equal(references.Length, await check.TicketEvents.CountAsync(e => e.Type == TicketEventType.SlaBreached));
            Assert.Equal(references.Length, await check.TicketEvents.CountAsync(e => e.Type == TicketEventType.Escalated));
        }
        finally
        {
            await using var cleanup = Context(connectionString);
            await cleanup.Database.EnsureDeletedAsync();
        }
    }
}
