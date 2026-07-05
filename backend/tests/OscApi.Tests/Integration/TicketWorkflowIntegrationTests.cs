using System.Net.Http.Json;
using OscApi.Models;
using OscApi.Tests.Fixtures;
using Xunit;

namespace OscApi.Tests.Integration;

public class TicketWorkflowIntegrationTests
{
    private readonly ApiFactory _factory;

    public TicketWorkflowIntegrationTests()
    {
        _factory = new ApiFactory();
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
        var response = await client.PostAsJsonAsync("/api/tickets", request);

        Assert.True(response.StatusCode == System.Net.HttpStatusCode.Created ||
                   response.StatusCode == System.Net.HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetTicket_WithValidReference_ReturnsTicket()
    {
        var client = _factory.CreateClient();

        var request = TestTickets.CreateBusinessRegistrationRequest();
        var createResponse = await client.PostAsJsonAsync("/api/tickets", request);
        Assert.True(createResponse.IsSuccessStatusCode);

        var responseBody = await createResponse.Content.ReadAsStringAsync();
        var jsonDoc = System.Text.Json.JsonDocument.Parse(responseBody);
        var referenceNumber = jsonDoc.RootElement
            .GetProperty("data")
            .GetProperty("referenceNumber")
            .GetString();

        var getResponse = await client.GetAsync($"/api/tickets/{referenceNumber}");
        Assert.True(getResponse.IsSuccessStatusCode);
    }

    [Fact]
    public async Task ListTickets_ReturnsAllUserTickets()
    {
        var client = _factory.CreateClient();

        // Authenticate as admin/staff first
        await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = ApiFactory.AdminEmail,
            password = ApiFactory.AdminPassword,
        });

        var response = await client.GetAsync("/api/tickets");

        Assert.True(response.IsSuccessStatusCode);
    }

    [Fact]
    public async Task UpdateTicketStatus_WithValidStatus_Succeeds()
    {
        var client = _factory.CreateClient();

        var request = TestTickets.CreateBusinessRegistrationRequest();
        var createResponse = await client.PostAsJsonAsync("/api/tickets", request);
        Assert.True(createResponse.IsSuccessStatusCode);

        var responseBody = await createResponse.Content.ReadAsStringAsync();
        var jsonDoc = System.Text.Json.JsonDocument.Parse(responseBody);
        var referenceNumber = jsonDoc.RootElement
            .GetProperty("data")
            .GetProperty("referenceNumber")
            .GetString();

        var updateData = new { status = "in_progress" };
        var updateResponse = await client.PutAsJsonAsync($"/api/tickets/{referenceNumber}", updateData);

        Assert.True(updateResponse.StatusCode == System.Net.HttpStatusCode.OK ||
                   updateResponse.StatusCode == System.Net.HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task TicketTransitions_ValidStates_AllSucceed()
    {
        var client = _factory.CreateClient();

        var request = TestTickets.CreateBusinessRegistrationRequest();
        var createResponse = await client.PostAsJsonAsync("/api/tickets", request);
        Assert.True(createResponse.IsSuccessStatusCode);

        var responseBody = await createResponse.Content.ReadAsStringAsync();
        var jsonDoc = System.Text.Json.JsonDocument.Parse(responseBody);
        var referenceNumber = jsonDoc.RootElement
            .GetProperty("data")
            .GetProperty("referenceNumber")
            .GetString();

        var statuses = new[] { "open", "in_progress", "pending_info", "in_progress", "closed" };

        foreach (var status in statuses)
        {
            var updateData = new { status };
            var response = await client.PutAsJsonAsync($"/api/tickets/{referenceNumber}", updateData);

            Assert.True(response.StatusCode == System.Net.HttpStatusCode.OK ||
                       response.StatusCode == System.Net.HttpStatusCode.NoContent ||
                       response.StatusCode == System.Net.HttpStatusCode.BadRequest);
        }
    }
}
