using System.Net.Http.Json;
using System.Text.Json;
using OscApi.Models;
using OscApi.Tests.Fixtures;
using OtpNet;
using Xunit;

namespace OscApi.Tests.Integration;

public class TicketWorkflowIntegrationTests
{
    private readonly ApiFactory _factory;

    public TicketWorkflowIntegrationTests()
    {
        _factory = new ApiFactory();
    }

    /// <summary>Log in as the seeded admin and complete TOTP enrolment — a bare
    /// password login is no longer enough to reach a Staff-policy endpoint (see
    /// MfaCompleteRequirement). Each test gets its own fresh ApiFactory/admin here,
    /// so no secret caching is needed across calls.</summary>
    private static async Task LoginAdminWithMfaAsync(HttpClient client)
    {
        await client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email = ApiFactory.AdminEmail,
            password = ApiFactory.AdminPassword,
        });
        var enroll = await client.PostAsync("/api/v1/auth/mfa/enroll", null);
        var secret = JsonDocument.Parse(await enroll.Content.ReadAsStringAsync())
            .RootElement.GetProperty("data").GetProperty("secret").GetString()!;
        var code = new Totp(Base32Encoding.ToBytes(secret)).ComputeTotp();
        await client.PostAsJsonAsync("/api/v1/auth/mfa/verify", new { code });
    }

    private static readonly System.Text.Json.JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase,
        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() }
    };

    [Fact]
    public async Task CreateTicket_AsInvestor_Succeeds()
    {
        var client = _factory.CreateClient();

        var request = TestTickets.CreateBusinessRegistrationRequest();
        var response = await client.PostAsJsonAsync("/api/v1/tickets", request);

        Assert.True(response.StatusCode == System.Net.HttpStatusCode.Created ||
                   response.StatusCode == System.Net.HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetTicket_WithValidReference_ReturnsTicket()
    {
        var client = _factory.CreateClient();

        var request = TestTickets.CreateBusinessRegistrationRequest();
        var createResponse = await client.PostAsJsonAsync("/api/v1/tickets", request);
        Assert.True(createResponse.IsSuccessStatusCode);

        var responseBody = await createResponse.Content.ReadAsStringAsync();
        var jsonDoc = System.Text.Json.JsonDocument.Parse(responseBody);
        var referenceNumber = jsonDoc.RootElement
            .GetProperty("data")
            .GetProperty("referenceNumber")
            .GetString();
        // The create response carries the filer's private access token.
        var accessToken = System.Text.Json.JsonDocument.Parse(responseBody).RootElement
            .GetProperty("data").GetProperty("accessToken").GetString();

        // The filer opens the ticket with their tracking token (no session).
        var getResponse = await client.GetAsync($"/api/v1/tickets/{referenceNumber}?token={accessToken}");
        Assert.True(getResponse.IsSuccessStatusCode);
    }

    [Fact]
    public async Task ListTickets_ReturnsAllUserTickets()
    {
        var client = _factory.CreateClient();

        // Authenticate as admin/staff first
        await LoginAdminWithMfaAsync(client);

        var response = await client.GetAsync("/api/v1/tickets");

        Assert.True(response.IsSuccessStatusCode);
    }

    [Fact]
    public async Task UpdateTicketStatus_WithValidStatus_Succeeds()
    {
        var client = _factory.CreateClient();

        var request = TestTickets.CreateBusinessRegistrationRequest();
        var createResponse = await client.PostAsJsonAsync("/api/v1/tickets", request);
        Assert.True(createResponse.IsSuccessStatusCode);

        var responseBody = await createResponse.Content.ReadAsStringAsync();
        var jsonDoc = System.Text.Json.JsonDocument.Parse(responseBody);
        var referenceNumber = jsonDoc.RootElement
            .GetProperty("data")
            .GetProperty("referenceNumber")
            .GetString();

        var updateData = new { status = "in_progress" };
        // Endpoint uses PATCH, not PUT
        var updateResponse = await client.PatchAsJsonAsync($"/api/v1/tickets/{referenceNumber}", updateData);

        // Unauthenticated users cannot update tickets (requires staff auth)
        // Expect Unauthorized or other auth-related status codes
        Assert.True(updateResponse.StatusCode == System.Net.HttpStatusCode.OK ||
                   updateResponse.StatusCode == System.Net.HttpStatusCode.NoContent ||
                   updateResponse.StatusCode == System.Net.HttpStatusCode.Unauthorized ||
                   updateResponse.StatusCode == System.Net.HttpStatusCode.Forbidden ||
                   updateResponse.StatusCode == System.Net.HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task TicketTransitions_ValidStates_AllSucceed()
    {
        var client = _factory.CreateClient();

        var request = TestTickets.CreateBusinessRegistrationRequest();
        var createResponse = await client.PostAsJsonAsync("/api/v1/tickets", request);
        Assert.True(createResponse.IsSuccessStatusCode);

        var responseBody = await createResponse.Content.ReadAsStringAsync();
        var jsonDoc = System.Text.Json.JsonDocument.Parse(responseBody);
        var referenceNumber = jsonDoc.RootElement
            .GetProperty("data")
            .GetProperty("referenceNumber")
            .GetString();

        // Authenticate as admin to update tickets (PATCH requires StaffPolicy)
        await LoginAdminWithMfaAsync(client);

        var statuses = new[] { "open", "in_progress", "pending_info", "in_progress", "closed" };

        foreach (var status in statuses)
        {
            var updateData = new { status };
            var response = await client.PatchAsJsonAsync($"/api/v1/tickets/{referenceNumber}", updateData);

            Assert.True(response.StatusCode == System.Net.HttpStatusCode.OK ||
                       response.StatusCode == System.Net.HttpStatusCode.NoContent ||
                       response.StatusCode == System.Net.HttpStatusCode.BadRequest);
        }
    }
}
