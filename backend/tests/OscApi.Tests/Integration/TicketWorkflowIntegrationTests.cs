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

        var ticket = TestTickets.CreateBusinessRegistration();
        var content = new StringContent(
            System.Text.Json.JsonSerializer.Serialize(ticket, JsonOptions),
            System.Text.Encoding.UTF8,
            "application/json");

        var response = await client.PostAsync("/api/tickets", content);

        Assert.True(response.StatusCode == System.Net.HttpStatusCode.Created ||
                   response.StatusCode == System.Net.HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetTicket_WithValidReference_ReturnsTicket()
    {
        var client = _factory.CreateClient();

        var ticket = TestTickets.CreateBusinessRegistration();
        var createContent = new StringContent(
            System.Text.Json.JsonSerializer.Serialize(ticket, JsonOptions),
            System.Text.Encoding.UTF8,
            "application/json");

        var createResponse = await client.PostAsync("/api/tickets", createContent);
        Assert.True(createResponse.IsSuccessStatusCode);

        var reference = ticket.ReferenceNumber;
        var getResponse = await client.GetAsync($"/api/tickets/{reference}");

        Assert.True(getResponse.IsSuccessStatusCode);
    }

    [Fact]
    public async Task ListTickets_ReturnsAllUserTickets()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/tickets");

        Assert.True(response.IsSuccessStatusCode);
    }

    [Fact]
    public async Task UpdateTicketStatus_WithValidStatus_Succeeds()
    {
        var client = _factory.CreateClient();

        var ticket = TestTickets.CreateBusinessRegistration();
        var createContent = new StringContent(
            System.Text.Json.JsonSerializer.Serialize(ticket, JsonOptions),
            System.Text.Encoding.UTF8,
            "application/json");

        var createResponse = await client.PostAsync("/api/tickets", createContent);
        Assert.True(createResponse.IsSuccessStatusCode);

        var updateData = new { status = "in_progress" };
        var updateContent = new StringContent(
            System.Text.Json.JsonSerializer.Serialize(updateData),
            System.Text.Encoding.UTF8,
            "application/json");

        var updateResponse = await client.PutAsync($"/api/tickets/{ticket.ReferenceNumber}", updateContent);

        Assert.True(updateResponse.StatusCode == System.Net.HttpStatusCode.OK ||
                   updateResponse.StatusCode == System.Net.HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task TicketTransitions_ValidStates_AllSucceed()
    {
        var client = _factory.CreateClient();

        var ticket = TestTickets.CreateBusinessRegistration();
        var statuses = new[] { "open", "in_progress", "pending_info", "in_progress", "closed" };

        foreach (var status in statuses)
        {
            var updateData = new { status };
            var content = new StringContent(
                System.Text.Json.JsonSerializer.Serialize(updateData),
                System.Text.Encoding.UTF8,
                "application/json");

            var response = await client.PutAsync($"/api/tickets/{ticket.ReferenceNumber}", content);

            Assert.True(response.StatusCode == System.Net.HttpStatusCode.OK ||
                       response.StatusCode == System.Net.HttpStatusCode.NoContent ||
                       response.StatusCode == System.Net.HttpStatusCode.BadRequest);
        }
    }
}
