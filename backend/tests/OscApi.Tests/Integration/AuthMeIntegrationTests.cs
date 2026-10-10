using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using OtpNet;

using OscApi.Tests.Helpers;

namespace OscApi.Tests.Integration;

public class AuthMeIntegrationTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    public AuthMeIntegrationTests(ApiFactory factory) => _factory = factory;

    private static string NewEmail(string p) => $"{p}-{Guid.NewGuid():N}@example.com";

    // Shared admin account across every test in this class (IClassFixture) —
    // AdminOnly endpoints now require completed TOTP enrolment (see
    // MfaCompleteRequirement), so cache the secret once enrolled.
    private static string? _adminMfaSecret;

    private static async Task LoginAdminWithMfaAsync(HttpClient client)
    {
        object body = _adminMfaSecret is null
            ? new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword }
            : new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword, mfaCode = new Totp(Base32Encoding.ToBytes(_adminMfaSecret)).ComputeTotp() };
        var login = await client.PostAsJsonAsync("/api/v1/auth/login", body);
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        if (_adminMfaSecret is null)
        {
            var enroll = await client.PostAsync("/api/v1/auth/mfa/enroll", null);
            _adminMfaSecret = JsonDocument.Parse(await enroll.Content.ReadAsStringAsync())
                .RootElement.GetProperty("data").GetProperty("secret").GetString()!;
            var code = new Totp(Base32Encoding.ToBytes(_adminMfaSecret)).ComputeTotp();
            await client.PostAsJsonAsync("/api/v1/auth/mfa/verify", new { code });
        }
    }

    [Fact]
    public async Task Signup_RequiresEmailVerification_ThenMeReturnsSubmissions()
    {
        var client = _factory.CreateClient();
        var email = NewEmail("user");

        var signup = await client.PostAsJsonAsync("/api/v1/auth/signup",
            new { name = "Test User", email, password = "Passw0rd1" });
        Assert.Equal(HttpStatusCode.OK, signup.StatusCode);

        // No session until the address is verified, and password login is refused.
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/me/submissions")).StatusCode);
        var early = await client.PostAsJsonAsync("/api/v1/auth/login", new { email, password = "Passw0rd1" });
        Assert.Equal(HttpStatusCode.Forbidden, early.StatusCode);

        // After verification (what the emailed link does) sign-in works.
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<OscApi.Data.OscDbContext>();
            db.Users.Single(u => u.Email == email).EmailVerified = true;
            db.SaveChanges();
        }
        var login = await client.PostAsJsonAsync("/api/v1/auth/login", new { email, password = "Passw0rd1" });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        var me = await client.GetAsync("/api/v1/me/submissions");
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
        var body = await me.Content.ReadAsStringAsync();
        Assert.Contains("\"tickets\"", body);
        Assert.Contains("\"inquiries\"", body);
    }

    [Fact]
    public async Task Signup_WeakPassword_Rejected()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/v1/auth/signup",
            new { name = "Weak", email = NewEmail("weak"), password = "short" });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Signup_DuplicateEmail_Conflicts()
    {
        var client = _factory.CreateClient();
        var email = NewEmail("dup");
        var first = await client.PostAsJsonAsync("/api/v1/auth/signup",
            new { name = "Dup", email, password = "Passw0rd1" });
        Assert.Equal(HttpStatusCode.OK, first.StatusCode);

        var second = await client.PostAsJsonAsync("/api/v1/auth/signup",
            new { name = "Dup2", email, password = "Passw0rd1" });
        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
    }

    [Fact]
    public async Task Me_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();
        var res = await client.GetAsync("/api/v1/me/submissions");
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task AdminLogin_GrantsDashboardAccess()
    {
        var client = _factory.CreateClient();
        await LoginAdminWithMfaAsync(client);

        var dash = await client.GetAsync("/api/v1/dashboard");
        Assert.Equal(HttpStatusCode.OK, dash.StatusCode);
    }

    [Fact]
    public async Task AdminLogin_WrongPassword_Unauthorized()
    {
        var client = _factory.CreateClient();
        var login = await client.PostAsJsonAsync("/api/v1/auth/login",
            new { email = ApiFactory.AdminEmail, password = "wrong" });
        Assert.Equal(HttpStatusCode.Unauthorized, login.StatusCode);
    }

    [Fact]
    public async Task Dashboard_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();
        var res = await client.GetAsync("/api/v1/dashboard");
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task Draft_SaveThenGet_RoundTrips()
    {
        var client = _factory.CreateClient();
        await TestUsers.SignUpVerifiedAsync(_factory, client, "D", NewEmail("draft"), "Passw0rd1");

        var put = await client.PutAsJsonAsync("/api/v1/me/drafts/investor_onboarding",
            new { step = 2, investorType = "foreign" });
        Assert.Equal(HttpStatusCode.OK, put.StatusCode);

        var get = await client.GetAsync("/api/v1/me/drafts/investor_onboarding");
        Assert.Equal(HttpStatusCode.OK, get.StatusCode);
        Assert.Contains("foreign", await get.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Ticket_Submission_AppearsIn_UsersSubmissions()
    {
        var client = _factory.CreateClient();
        var email = NewEmail("owner");

        var ticket = await client.PostAsJsonAsync("/api/v1/tickets", new
        {
            title = "Integration ticket",
            description = "created during an integration test",
            category = "general_inquiry",
            priority = "low",
            contactEmail = email,
            contactName = "Owner",
        });
        Assert.Equal(HttpStatusCode.Created, ticket.StatusCode);

        await TestUsers.SignUpVerifiedAsync(_factory, client, "Owner", email, "Passw0rd1");

        var me = await client.GetAsync("/api/v1/me/submissions");
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
        Assert.Contains("Integration ticket", await me.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task ChatbotConversation_AppearsIn_UsersSubmissions()
    {
        // Regression test: /api/v1/me/submissions previously never queried
        // ChatEnquiries at all, so a signed-in investor's own AI-assistant
        // conversations — correctly tagged with their email by the widget —
        // were invisible on their own "My Submissions" page.
        var client = _factory.CreateClient();
        var email = NewEmail("chatuser");

        await TestUsers.SignUpVerifiedAsync(_factory, client, "Chat User", email, "Passw0rd1");

        var log = await client.PostAsJsonAsync("/api/v1/chatbot/log", new
        {
            sessionId = "sess-integration-1",
            userEmail = email,
            userMessage = "What permits do I need for a factory?",
            botResponse = "Here is the permit checklist...",
            language = "en",
            tier = "ai",
        });
        Assert.Equal(HttpStatusCode.OK, log.StatusCode);

        var me = await client.GetAsync("/api/v1/me/submissions");
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
        var body = await me.Content.ReadAsStringAsync();
        Assert.Contains("chatEnquiries", body);
        Assert.Contains("sess-integration-1", body);
    }
}
