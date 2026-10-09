using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using OtpNet;

namespace OscApi.Tests.Integration;

/// <summary>
/// The public rate-limit buckets are separate: analytics beacons and lookups
/// must not consume the budget real form submissions depend on, and signed-in
/// staff are limited per user rather than sharing the office's IP bucket.
/// </summary>
public class RateLimitPartitionTests : IClassFixture<ApiFactory>
{
    private const int FormLimit = 3;
    private readonly WebApplicationFactory<Program> _factory;

    public RateLimitPartitionTests(ApiFactory factory)
    {
        _factory = factory.WithWebHostBuilder(b => b.ConfigureAppConfiguration((_, config) =>
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["RateLimits:PublicFormPermitLimit"] = FormLimit.ToString(),
                ["RateLimits:PublicReadPermitLimit"] = FormLimit.ToString(),
                ["RateLimits:AnalyticsPermitLimit"] = "1000",
                ["RateLimits:StaffPermitLimit"] = "1000",
            })));
    }

    private static object Inquiry(int i) => new
    {
        agencyCode = "UIA", agencyName = "Uganda Investment Authority",
        name = "Rate Test", email = $"rate{i}@example.com", phone = (string?)null,
        serviceType = "General Inquiry", subject = "General Inquiry", message = "Hello", urgency = "normal",
    };

    [Fact]
    public async Task Buckets_AreSeparated_AndStaffAreLimitedPerUser()
    {
        var anon = _factory.CreateClient();

        // Analytics traffic well past the form limit must not count against forms.
        for (var i = 0; i < FormLimit * 3; i++)
        {
            var evt = await anon.PostAsJsonAsync("/api/v1/analytics/event",
                new { eventType = "tool_usage", eventName = "calculator" });
            Assert.NotEqual(HttpStatusCode.TooManyRequests, evt.StatusCode);
        }

        // The anonymous client still gets its full form budget, then is throttled.
        for (var i = 0; i < FormLimit; i++)
            Assert.Equal(HttpStatusCode.Created, (await anon.PostAsJsonAsync("/api/v1/contact/inquiries", Inquiry(i))).StatusCode);
        Assert.Equal(HttpStatusCode.TooManyRequests, (await anon.PostAsJsonAsync("/api/v1/contact/inquiries", Inquiry(99))).StatusCode);

        // A signed-in staff member from the same (exhausted) IP is unaffected:
        // staff are partitioned by user id with their own, larger allowance.
        var staff = _factory.CreateClient();
        var login = await staff.PostAsJsonAsync("/api/v1/auth/login",
            new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        var enroll = await staff.PostAsync("/api/v1/auth/mfa/enroll", null);
        var secret = JsonDocument.Parse(await enroll.Content.ReadAsStringAsync())
            .RootElement.GetProperty("data").GetProperty("secret").GetString()!;
        await staff.PostAsJsonAsync("/api/v1/auth/mfa/verify",
            new { code = new Totp(Base32Encoding.ToBytes(secret)).ComputeTotp() });

        for (var i = 0; i < FormLimit * 2; i++)
            Assert.Equal(HttpStatusCode.Created, (await staff.PostAsJsonAsync("/api/v1/contact/inquiries", Inquiry(100 + i))).StatusCode);
    }
}
