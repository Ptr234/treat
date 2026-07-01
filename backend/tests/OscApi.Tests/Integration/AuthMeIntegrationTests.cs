using System.Net;
using System.Net.Http.Json;

namespace OscApi.Tests.Integration;

public class AuthMeIntegrationTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    public AuthMeIntegrationTests(ApiFactory factory) => _factory = factory;

    private static string NewEmail(string p) => $"{p}-{Guid.NewGuid():N}@example.com";

    [Fact]
    public async Task Signup_SetsSession_And_MeReturnsSubmissions()
    {
        var client = _factory.CreateClient();
        var email = NewEmail("user");

        var signup = await client.PostAsJsonAsync("/api/auth/signup",
            new { name = "Test User", email, password = "Passw0rd1" });
        Assert.Equal(HttpStatusCode.OK, signup.StatusCode);

        var me = await client.GetAsync("/api/me/submissions");
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
        var body = await me.Content.ReadAsStringAsync();
        Assert.Contains("\"tickets\"", body);
        Assert.Contains("\"inquiries\"", body);
    }

    [Fact]
    public async Task Signup_WeakPassword_Rejected()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/auth/signup",
            new { name = "Weak", email = NewEmail("weak"), password = "short" });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Signup_DuplicateEmail_Conflicts()
    {
        var client = _factory.CreateClient();
        var email = NewEmail("dup");
        var first = await client.PostAsJsonAsync("/api/auth/signup",
            new { name = "Dup", email, password = "Passw0rd1" });
        Assert.Equal(HttpStatusCode.OK, first.StatusCode);

        var second = await client.PostAsJsonAsync("/api/auth/signup",
            new { name = "Dup2", email, password = "Passw0rd1" });
        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
    }

    [Fact]
    public async Task Me_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();
        var res = await client.GetAsync("/api/me/submissions");
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task AdminLogin_GrantsDashboardAccess()
    {
        var client = _factory.CreateClient();

        var login = await client.PostAsJsonAsync("/api/auth/login",
            new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        var dash = await client.GetAsync("/api/dashboard");
        Assert.Equal(HttpStatusCode.OK, dash.StatusCode);
    }

    [Fact]
    public async Task AdminLogin_WrongPassword_Unauthorized()
    {
        var client = _factory.CreateClient();
        var login = await client.PostAsJsonAsync("/api/auth/login",
            new { email = ApiFactory.AdminEmail, password = "wrong" });
        Assert.Equal(HttpStatusCode.Unauthorized, login.StatusCode);
    }

    [Fact]
    public async Task Dashboard_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();
        var res = await client.GetAsync("/api/dashboard");
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task Draft_SaveThenGet_RoundTrips()
    {
        var client = _factory.CreateClient();
        await client.PostAsJsonAsync("/api/auth/signup",
            new { name = "D", email = NewEmail("draft"), password = "Passw0rd1" });

        var put = await client.PutAsJsonAsync("/api/me/drafts/investor_onboarding",
            new { step = 2, investorType = "foreign" });
        Assert.Equal(HttpStatusCode.OK, put.StatusCode);

        var get = await client.GetAsync("/api/me/drafts/investor_onboarding");
        Assert.Equal(HttpStatusCode.OK, get.StatusCode);
        Assert.Contains("foreign", await get.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Ticket_Submission_AppearsIn_UsersSubmissions()
    {
        var client = _factory.CreateClient();
        var email = NewEmail("owner");

        var ticket = await client.PostAsJsonAsync("/api/tickets", new
        {
            title = "Integration ticket",
            description = "created during an integration test",
            category = "general_inquiry",
            priority = "low",
            contactEmail = email,
            contactName = "Owner",
        });
        Assert.Equal(HttpStatusCode.Created, ticket.StatusCode);

        await client.PostAsJsonAsync("/api/auth/signup",
            new { name = "Owner", email, password = "Passw0rd1" });

        var me = await client.GetAsync("/api/me/submissions");
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
        Assert.Contains("Integration ticket", await me.Content.ReadAsStringAsync());
    }
}
