using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using OtpNet;
using Microsoft.Extensions.DependencyInjection;
using OscApi.Data;
using OscApi.Models;
using Xunit;

using OscApi.Tests.Helpers;

namespace OscApi.Tests.Integration;

public class ApiEndpointTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    public ApiEndpointTests(ApiFactory factory) => _factory = factory;

    private static string NewEmail(string p) => $"{p}-{Guid.NewGuid():N}@example.com";

    // Shared admin account across every test in this class (IClassFixture) —
    // Staff-policy endpoints now require completed TOTP enrolment
    // (MfaCompleteRequirement), so cache the secret once enrolled.
    private static string? _adminMfaSecret;

    private static async Task LoginAdminWithMfaAsync(HttpClient client)
    {
        object body = _adminMfaSecret is null
            ? new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword }
            : new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword, mfaCode = new Totp(Base32Encoding.ToBytes(_adminMfaSecret)).ComputeTotp() };
        await client.PostAsJsonAsync("/api/v1/auth/login", body);

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
        var res = await client.GetAsync("/api/v1/nonexistent");
        Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
    }

    [Fact]
    public async Task GetTickets_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();
        var res = await client.GetAsync("/api/v1/tickets");
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task CreateTicket_WithoutAuth_CanSubmit()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/v1/tickets", new
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
        var res = await client.PostAsJsonAsync("/api/v1/tickets", new
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
        var res = await client.PostAsJsonAsync("/api/v1/tickets", new
        {
            title = "", // Missing required field
            description = "Test",
            category = "general_inquiry",
        });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task PaymentEndpoints_RejectRequestsWithoutMatchingApplicantEmail()
    {
        const string reference = "REG-2026-PAYSEC";
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<OscDbContext>();
            db.BusinessRegistrations.Add(new BusinessRegistration
            {
                ReferenceNumber = reference,
                BusinessName = "Payment Access Test",
                BusinessType = "limited-company",
                BusinessStructure = "private",
                Sector = "ICT",
                Location = "Kampala",
                ContactName = "Test Applicant",
                ContactEmail = "pay-owner@example.com",
            });
            await db.SaveChangesAsync();
        }

        var client = _factory.CreateClient();
        var status = await client.GetAsync($"/api/v1/business-registrations/{reference}/payment?email=wrong@example.com");
        var initiate = await client.PostAsync($"/api/v1/business-registrations/{reference}/payment/initiate?email=wrong@example.com", null);

        Assert.Equal(HttpStatusCode.NotFound, status.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, initiate.StatusCode);
    }

    [Fact]
    public async Task Login_InvalidCredentials_Returns401()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/v1/auth/login", new
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
        var res = await client.PostAsJsonAsync("/api/v1/auth/signup", new
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
        var res = await client.PostAsJsonAsync("/api/v1/auth/signup", new
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
        var res = await client.PostAsJsonAsync("/api/v1/auth/signup", new
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
        var res = await client.GetAsync("/api/v1/me/profile");
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task UpdateProfile_WithValidData_Returns200()
    {
        var client = _factory.CreateClient();
        var email = NewEmail("profile");

        // Signup
        await TestUsers.SignUpVerifiedAsync(_factory, client, "Test", email, "ValidPassword123!");

        // Update profile
        var res = await client.PutAsJsonAsync("/api/v1/me/profile", new
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

        await TestUsers.SignUpVerifiedAsync(_factory, client, "Test", email, "ValidPassword123!");

        var res = await client.PostAsync("/api/v1/me/delete-account", null);
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);

        // Verify user can't login
        var loginRes = await client.PostAsJsonAsync("/api/v1/auth/login", new
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

        await client.PostAsJsonAsync("/api/v1/auth/signup", new
        {
            name = "Test",
            email,
            password = "ValidPassword123!",
        });

        var logoutRes = await client.PostAsync("/api/v1/auth/logout", null);
        Assert.Equal(HttpStatusCode.OK, logoutRes.StatusCode);

        // Verify session is cleared
        var meRes = await client.GetAsync("/api/v1/me/profile");
        Assert.Equal(HttpStatusCode.Unauthorized, meRes.StatusCode);
    }

    [Fact]
    public async Task Pagination_ValidParams_Returns200()
    {
        var client = _factory.CreateClient();
        await LoginAdminWithMfaAsync(client);

        var res = await client.GetAsync("/api/v1/tickets?page=1&pageSize=10");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    }

    [Fact]
    public async Task Pagination_InvalidPageSize_BadRequest()
    {
        var client = _factory.CreateClient();
        await LoginAdminWithMfaAsync(client);

        var res = await client.GetAsync("/api/v1/tickets?page=1&pageSize=5000");
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task ConcurrentRequests_BothSucceed()
    {
        var client = _factory.CreateClient();
        var email1 = NewEmail("concurrent1");
        var email2 = NewEmail("concurrent2");

        var task1 = client.PostAsJsonAsync("/api/v1/auth/signup", new
        {
            name = "User1",
            email = email1,
            password = "ValidPassword123!",
        });

        var task2 = client.PostAsJsonAsync("/api/v1/auth/signup", new
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

        var res = await client.PostAsJsonAsync("/api/v1/tickets", new
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
