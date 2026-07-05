using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace OscApi.Tests.Integration;

public class ApiEndpointTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    public ApiEndpointTests(ApiFactory factory) => _factory = factory;

    private static string NewEmail(string p) => $"{p}-{Guid.NewGuid():N}@example.com";

    [Fact]
    public async Task HealthCheck_ReturnsOk()
    {
        var client = _factory.CreateClient();
        var res = await client.GetAsync("/api/health");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    }

    [Fact]
    public async Task InvalidRoute_Returns404()
    {
        var client = _factory.CreateClient();
        var res = await client.GetAsync("/api/nonexistent");
        Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
    }

    [Fact]
    public async Task GetTickets_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();
        var res = await client.GetAsync("/api/tickets");
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task CreateTicket_WithoutAuth_CanSubmit()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/tickets", new
        {
            title = "Test ticket",
            description = "A test ticket",
            category = "general_inquiry",
            priority = "medium",
            contactEmail = "test@example.com",
            contactName = "Test User",
        });
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
    }

    [Fact]
    public async Task CreateTicket_InvalidCategory_BadRequest()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/tickets", new
        {
            title = "Test",
            description = "Test",
            category = "invalid_category",
            priority = "low",
            contactEmail = "test@example.com",
            contactName = "Test",
        });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task CreateTicket_MissingRequired_BadRequest()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/tickets", new
        {
            title = "", // Missing required field
            description = "Test",
            category = "general_inquiry",
        });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Login_InvalidCredentials_Returns401()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "nonexistent@example.com",
            password = "password",
        });
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task Signup_ValidData_ReturnsOk()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/auth/signup", new
        {
            name = "Test User",
            email = NewEmail("signup"),
            password = "ValidPassword123!",
        });
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    }

    [Fact]
    public async Task Signup_InvalidEmail_BadRequest()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/auth/signup", new
        {
            name = "Test",
            email = "invalid-email",
            password = "ValidPassword123!",
        });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Signup_WeakPassword_BadRequest()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/auth/signup", new
        {
            name = "Test",
            email = NewEmail("weak"),
            password = "weak",
        });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Me_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();
        var res = await client.GetAsync("/api/me/profile");
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task UpdateProfile_WithValidData_Returns200()
    {
        var client = _factory.CreateClient();
        var email = NewEmail("profile");

        // Signup
        await client.PostAsJsonAsync("/api/auth/signup", new
        {
            name = "Test",
            email,
            password = "ValidPassword123!",
        });

        // Update profile
        var res = await client.PutAsJsonAsync("/api/me/profile", new
        {
            name = "Updated Name",
            phone = "+256701234567",
        });

        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    }

    [Fact]
    public async Task DeleteAccount_Authenticated_Returns200()
    {
        var client = _factory.CreateClient();
        var email = NewEmail("delete");

        await client.PostAsJsonAsync("/api/auth/signup", new
        {
            name = "Test",
            email,
            password = "ValidPassword123!",
        });

        var res = await client.PostAsync("/api/me/delete-account", null);
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);

        // Verify user can't login
        var loginRes = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password = "ValidPassword123!",
        });
        Assert.Equal(HttpStatusCode.Unauthorized, loginRes.StatusCode);
    }

    [Fact]
    public async Task Logout_RemovesSession()
    {
        var client = _factory.CreateClient();
        var email = NewEmail("logout");

        await client.PostAsJsonAsync("/api/auth/signup", new
        {
            name = "Test",
            email,
            password = "ValidPassword123!",
        });

        var logoutRes = await client.PostAsync("/api/auth/logout", null);
        Assert.Equal(HttpStatusCode.OK, logoutRes.StatusCode);

        // Verify session is cleared
        var meRes = await client.GetAsync("/api/me/profile");
        Assert.Equal(HttpStatusCode.Unauthorized, meRes.StatusCode);
    }

    [Fact]
    public async Task Pagination_ValidParams_Returns200()
    {
        var client = _factory.CreateClient();
        await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = ApiFactory.AdminEmail,
            password = ApiFactory.AdminPassword,
        });

        var res = await client.GetAsync("/api/tickets?page=1&pageSize=10");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    }

    [Fact]
    public async Task Pagination_InvalidPageSize_BadRequest()
    {
        var client = _factory.CreateClient();
        await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = ApiFactory.AdminEmail,
            password = ApiFactory.AdminPassword,
        });

        var res = await client.GetAsync("/api/tickets?page=1&pageSize=5000");
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task ConcurrentRequests_BothSucceed()
    {
        var client = _factory.CreateClient();
        var email1 = NewEmail("concurrent1");
        var email2 = NewEmail("concurrent2");

        var task1 = client.PostAsJsonAsync("/api/auth/signup", new
        {
            name = "User1",
            email = email1,
            password = "ValidPassword123!",
        });

        var task2 = client.PostAsJsonAsync("/api/auth/signup", new
        {
            name = "User2",
            email = email2,
            password = "ValidPassword123!",
        });

        await Task.WhenAll(task1, task2);

        Assert.Equal(HttpStatusCode.OK, (await task1).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await task2).StatusCode);
    }

    [Fact]
    public async Task LargePayload_IsRejected()
    {
        var client = _factory.CreateClient();
        var largeDescription = new string('x', 100000);

        var res = await client.PostAsJsonAsync("/api/tickets", new
        {
            title = "Test",
            description = largeDescription,
            category = "general_inquiry",
            priority = "low",
            contactEmail = "test@example.com",
            contactName = "Test",
        });

        Assert.True(res.StatusCode == HttpStatusCode.BadRequest ||
                   res.StatusCode == HttpStatusCode.RequestEntityTooLarge);
    }
}
