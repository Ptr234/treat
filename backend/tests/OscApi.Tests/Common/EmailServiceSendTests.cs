using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using OscApi.Common;

namespace OscApi.Tests.Common;

/// <summary>
/// Exercises EmailService's Resend HTTP path against a scripted handler:
/// what is sent, which failures are retried, and which are not.
/// </summary>
public class EmailServiceSendTests
{
    private sealed class ScriptedHandler(params Func<HttpResponseMessage>[] script) : HttpMessageHandler
    {
        public List<(HttpRequestMessage Request, string Body)> Calls { get; } = [];

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            var body = request.Content is null ? "" : await request.Content.ReadAsStringAsync(ct);
            Calls.Add((request, body));
            var step = script[Math.Min(Calls.Count - 1, script.Length - 1)];
            return step();
        }
    }

    private static HttpResponseMessage Ok() =>
        new(HttpStatusCode.OK) { Content = new StringContent("{\"id\":\"re_123\"}") };

    private static HttpResponseMessage Status(HttpStatusCode code) =>
        new(code) { Content = new StringContent("{\"message\":\"nope\"}") };

    private static Func<HttpResponseMessage> Throws() => () => throw new HttpRequestException("connection reset");

    private static (EmailService Service, ScriptedHandler Handler) Build(string? apiKey = "re_test_key", params Func<HttpResponseMessage>[] script)
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Resend:ApiKey"] = apiKey,
            ["Resend:FromAddress"] = "OneStop Centre <notifications@oscdigitaltool.com>",
            ["Resend:AdminEmail"] = "admin@uia.go.ug",
        }).Build();
        var handler = new ScriptedHandler(script.Length == 0 ? [Ok] : script);
        var service = new EmailService(config, NullLogger<EmailService>.Instance, new HttpClient(handler),
            minInterval: TimeSpan.Zero, retryBaseDelay: TimeSpan.FromMilliseconds(1));
        return (service, handler);
    }

    [Fact]
    public async Task Sends_ExpectedResendRequest()
    {
        var (svc, handler) = Build();

        await svc.SendContactConfirmationAsync("investor@gmail.com", "Amina", "INQ-1", "URSB", "Name search");

        var (request, body) = Assert.Single(handler.Calls);
        Assert.Equal(HttpMethod.Post, request.Method);
        Assert.Equal("https://api.resend.com/emails", request.RequestUri!.ToString());
        Assert.Equal("Bearer", request.Headers.Authorization!.Scheme);
        Assert.Equal("re_test_key", request.Headers.Authorization.Parameter);
        Assert.True(request.Headers.Contains("Idempotency-Key"));

        using var json = JsonDocument.Parse(body);
        Assert.Equal("OneStop Centre <notifications@oscdigitaltool.com>", json.RootElement.GetProperty("from").GetString());
        Assert.Equal("investor@gmail.com", json.RootElement.GetProperty("to")[0].GetString());
        Assert.Contains("INQ-1", json.RootElement.GetProperty("subject").GetString());
        Assert.True(json.RootElement.TryGetProperty("html", out _));
        Assert.True(json.RootElement.TryGetProperty("text", out _));
    }

    [Fact]
    public async Task AgencyNotification_RepliesGoToTheInvestor()
    {
        var (svc, handler) = Build();

        await svc.SendContactNotificationToAgencyAsync("URSB", "URSB", "INQ-2", "Amina", "amina@gmail.com",
            "Name search", "Hello", agencyEmail: "info@ursb.go.ug");

        Assert.Equal(2, handler.Calls.Count); // admin + agency
        foreach (var (_, body) in handler.Calls)
        {
            using var json = JsonDocument.Parse(body);
            Assert.Equal("amina@gmail.com", json.RootElement.GetProperty("reply_to")[0].GetString());
        }
    }

    [Fact]
    public async Task RateLimited_IsRetried_WithTheSameIdempotencyKey()
    {
        var (svc, handler) = Build(script: [() => Status(HttpStatusCode.TooManyRequests), Ok]);

        await svc.SendInvestorWelcomeAsync("investor@gmail.com", "Amina", "INV-1");

        Assert.Equal(2, handler.Calls.Count);
        var keys = handler.Calls.Select(c => c.Request.Headers.GetValues("Idempotency-Key").Single()).Distinct();
        Assert.Single(keys);
    }

    [Fact]
    public async Task ServerError_IsRetried()
    {
        var (svc, handler) = Build(script: [() => Status(HttpStatusCode.BadGateway), Ok]);

        await svc.SendInvestorWelcomeAsync("investor@gmail.com", "Amina", "INV-1");

        Assert.Equal(2, handler.Calls.Count);
    }

    [Fact]
    public async Task NetworkFailure_IsRetried()
    {
        var (svc, handler) = Build(script: [Throws(), Ok]);

        await svc.SendInvestorWelcomeAsync("investor@gmail.com", "Amina", "INV-1");

        Assert.Equal(2, handler.Calls.Count);
    }

    [Theory]
    [InlineData(HttpStatusCode.Unauthorized)]   // bad API key
    [InlineData(HttpStatusCode.Forbidden)]      // sending domain not verified
    [InlineData(HttpStatusCode.UnprocessableEntity)] // invalid address
    public async Task PermanentErrors_AreNotRetried(HttpStatusCode code)
    {
        var (svc, handler) = Build(script: [() => Status(code), Ok]);

        await svc.SendInvestorWelcomeAsync("investor@gmail.com", "Amina", "INV-1");

        Assert.Single(handler.Calls);
    }

    [Fact]
    public async Task GivesUp_AfterThreeAttempts_WithoutThrowing()
    {
        var (svc, handler) = Build(script: [() => Status(HttpStatusCode.ServiceUnavailable)]);

        await svc.SendInvestorWelcomeAsync("investor@gmail.com", "Amina", "INV-1");

        Assert.Equal(3, handler.Calls.Count);
    }

    [Fact]
    public async Task MissingApiKey_SendsNothing()
    {
        var (svc, handler) = Build(apiKey: "");

        await svc.SendInvestorWelcomeAsync("investor@gmail.com", "Amina", "INV-1");

        Assert.Empty(handler.Calls);
    }

    [Fact]
    public async Task ReservedDomain_IsSkipped()
    {
        var (svc, handler) = Build();

        await svc.SendInvestorWelcomeAsync("anonymous@feedback.invalid", "Anon", "INV-1");

        Assert.Empty(handler.Calls);
    }

    [Fact]
    public async Task ConcurrentSends_AreSpacedByTheMinimumInterval()
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Resend:ApiKey"] = "re_test_key",
        }).Build();
        var stamps = new List<DateTime>();
        var handler = new ScriptedHandler(() => { lock (stamps) stamps.Add(DateTime.UtcNow); return Ok(); });
        var svc = new EmailService(config, NullLogger<EmailService>.Instance, new HttpClient(handler),
            minInterval: TimeSpan.FromMilliseconds(150), retryBaseDelay: TimeSpan.FromMilliseconds(1));

        await Task.WhenAll(
            svc.SendInvestorWelcomeAsync("a@gmail.com", "A", "1"),
            svc.SendInvestorWelcomeAsync("b@gmail.com", "B", "2"),
            svc.SendInvestorWelcomeAsync("c@gmail.com", "C", "3"));

        Assert.Equal(3, stamps.Count);
        var ordered = stamps.OrderBy(s => s).ToList();
        for (var i = 1; i < ordered.Count; i++)
            Assert.True(ordered[i] - ordered[i - 1] >= TimeSpan.FromMilliseconds(130), $"gap {ordered[i] - ordered[i - 1]}");
    }
}
