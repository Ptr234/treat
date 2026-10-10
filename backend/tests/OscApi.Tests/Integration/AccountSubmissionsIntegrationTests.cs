using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using OscApi.Data;
using OscApi.Tests.Helpers;
using OtpNet;

namespace OscApi.Tests.Integration;

/// <summary>
/// A signed-in investor's submissions must appear under "My submissions" and
/// carry staff replies back to them — even if they typed a different email into
/// the form. Production showed every submission filed under a mistyped/other
/// address, so investors saw "no submissions" while staff saw (and answered) them.
/// </summary>
public class AccountSubmissionsIntegrationTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    public AccountSubmissionsIntegrationTests(ApiFactory factory) => _factory = factory;

    private static JsonElement Data(string json) => JsonDocument.Parse(json).RootElement.GetProperty("data");
    private static string NewEmail(string p) => $"{p}-{Guid.NewGuid():N}@example.com";

    private async Task<(HttpClient Client, string Email)> SignedInInvestor()
    {
        var client = _factory.CreateClient();
        var email = NewEmail("investor");
        await TestUsers.SignUpVerifiedAsync(_factory, client, "Account Owner", email, "Passw0rd123");
        return (client, email);
    }

    [Fact]
    public async Task Ticket_FiledWhileSignedIn_UnderAnotherEmail_ShowsInMySubmissions_WithStaffReply()
    {
        var (investor, accountEmail) = await SignedInInvestor();

        var created = await investor.PostAsJsonAsync("/api/v1/tickets", new
        {
            title = "I need more about land", description = "Land acquisition for a factory",
            category = "procedure_query", contactName = "Account Owner",
            contactEmail = "typo.address@example.com", // not the account's address
        });
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var reference = Data(await created.Content.ReadAsStringAsync()).GetProperty("referenceNumber").GetString()!;

        // Filed under the account, not the typed address.
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<OscDbContext>();
            Assert.Equal(accountEmail, db.Tickets.Single(t => t.ReferenceNumber == reference).ContactEmail);
        }

        var mine = await (await investor.GetAsync("/api/v1/me/submissions")).Content.ReadAsStringAsync();
        Assert.Contains(reference, mine);

        // A staff reply reaches the investor through their own session (no token needed).
        var staff = await StaffClient();
        Assert.Equal(HttpStatusCode.Created, (await staff.PostAsJsonAsync($"/api/v1/tickets/{reference}/messages",
            new { content = "Here is the land acquisition process." })).StatusCode);
        var ticket = await (await investor.GetAsync($"/api/v1/tickets/{reference}")).Content.ReadAsStringAsync();
        Assert.Contains("Here is the land acquisition process.", ticket);
    }

    [Fact]
    public async Task Enquiry_And_Chat_WhileSignedIn_ShowInMySubmissions()
    {
        var (investor, _) = await SignedInInvestor();

        var inquiry = await investor.PostAsJsonAsync("/api/v1/contact/inquiries", new
        {
            agencyCode = "UIA", agencyName = "Uganda Investment Authority", name = "Account Owner",
            email = "someone.else@example.com", serviceType = "Tourism", subject = "Tourism licence",
            message = "Which licence do I need for a lodge?", urgency = "normal",
        });
        Assert.Equal(HttpStatusCode.Created, inquiry.StatusCode);
        var inquiryRef = Data(await inquiry.Content.ReadAsStringAsync()).GetProperty("referenceNumber").GetString()!;

        var sessionId = "chat-" + Guid.NewGuid();
        Assert.Equal(HttpStatusCode.OK, (await investor.PostAsJsonAsync("/api/v1/chatbot/log", new
        {
            sessionId, userEmail = "typed@example.com", userMessage = "What permits do I need?",
            botResponse = "Here is the checklist", language = "en", tier = "ai",
        })).StatusCode);

        var mine = await (await investor.GetAsync("/api/v1/me/submissions")).Content.ReadAsStringAsync();
        Assert.Contains(inquiryRef, mine);
        Assert.Contains(sessionId, mine);
    }

    [Fact]
    public async Task SignedOutVisitors_And_Staff_KeepTheEmailTheyType()
    {
        var anonymous = await _factory.CreateClient().PostAsJsonAsync("/api/v1/tickets", new
        {
            title = "Visitor question", description = "d", category = "general_inquiry",
            contactName = "Visitor", contactEmail = "visitor@example.com",
        });
        var anonRef = Data(await anonymous.Content.ReadAsStringAsync()).GetProperty("referenceNumber").GetString()!;

        var staff = await StaffClient();
        var onBehalf = await staff.PostAsJsonAsync("/api/v1/tickets", new
        {
            title = "Filed for an investor by phone", description = "d", category = "general_inquiry",
            contactName = "Phoned-in Investor", contactEmail = "phoned.in@example.com",
        });
        var staffRef = Data(await onBehalf.Content.ReadAsStringAsync()).GetProperty("referenceNumber").GetString()!;

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<OscDbContext>();
        Assert.Equal("visitor@example.com", db.Tickets.Single(t => t.ReferenceNumber == anonRef).ContactEmail);
        Assert.Equal("phoned.in@example.com", db.Tickets.Single(t => t.ReferenceNumber == staffRef).ContactEmail);
    }

    private static string? _adminSecret;

    private async Task<HttpClient> StaffClient()
    {
        static string Code(string s) => new Totp(Base32Encoding.ToBytes(s)).ComputeTotp();
        var c = _factory.CreateClient();
        object body = _adminSecret is null
            ? new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword }
            : new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword, mfaCode = Code(_adminSecret) };
        Assert.Equal(HttpStatusCode.OK, (await c.PostAsJsonAsync("/api/v1/auth/login", body)).StatusCode);
        if (_adminSecret is null)
        {
            var enroll = await c.PostAsync("/api/v1/auth/mfa/enroll", null);
            _adminSecret = Data(await enroll.Content.ReadAsStringAsync()).GetProperty("secret").GetString()!;
            await c.PostAsJsonAsync("/api/v1/auth/mfa/verify", new { code = Code(_adminSecret) });
        }
        return c;
    }
}
