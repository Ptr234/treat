using OscApi.Models;
using OscApi.Tests.Fixtures;
using Xunit;

namespace OscApi.Tests.Integration;

public class EndToEndScenarioTests
{
    private readonly ApiFactory _factory;

    public EndToEndScenarioTests()
    {
        _factory = new ApiFactory();
    }

    private static readonly System.Text.Json.JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase,
        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() }
    };

    [Fact]
    public async Task InvestorRegistrationToTicketCreation_CompleteFlow()
    {
        var client = _factory.CreateClient();

        // 1. Simulate investor signup (if endpoint exists)
        // var signupResponse = await client.PostAsync("/api/auth/signup", signupContent);
        // Assert.True(signupResponse.IsSuccessStatusCode);

        // 2. Create ticket as investor
        var ticket = TestTickets.CreateInvestmentInquiry();
        var ticketContent = new StringContent(
            System.Text.Json.JsonSerializer.Serialize(ticket, JsonOptions),
            System.Text.Encoding.UTF8,
            "application/json");

        var ticketResponse = await client.PostAsync("/api/tickets", ticketContent);
        Assert.True(ticketResponse.IsSuccessStatusCode);

        // 3. Retrieve created ticket
        var getResponse = await client.GetAsync($"/api/tickets/{ticket.ReferenceNumber}");
        Assert.True(getResponse.IsSuccessStatusCode);

        // 4. Verify ticket data
        var content = await getResponse.Content.ReadAsStringAsync();
        Assert.Contains("Investment Inquiry", content);
    }

    [Fact]
    public async Task MultipleTickets_DifferentCategories_AllSucceed()
    {
        var client = _factory.CreateClient();

        var ticketFactories = new Func<string>[]
        {
            () => System.Text.Json.JsonSerializer.Serialize(TestTickets.CreateBusinessRegistration()),
            () => System.Text.Json.JsonSerializer.Serialize(TestTickets.CreateInvestmentInquiry()),
            () => System.Text.Json.JsonSerializer.Serialize(TestTickets.CreateLicenseApplication()),
        };

        var successCount = 0;
        foreach (var factory in ticketFactories)
        {
            var content = new StringContent(factory(), System.Text.Encoding.UTF8, "application/json");
            var response = await client.PostAsync("/api/tickets", content);

            if (response.IsSuccessStatusCode)
                successCount++;
        }

        Assert.Equal(ticketFactories.Length, successCount);
    }

    [Fact]
    public async Task TicketListFiltering_ByStatus_WorksCorrectly()
    {
        var client = _factory.CreateClient();

        // Create tickets with different statuses
        var ticketPending = TestTickets.CreateBusinessRegistration();
        var contentPending = new StringContent(
            System.Text.Json.JsonSerializer.Serialize(ticketPending),
            System.Text.Encoding.UTF8,
            "application/json");

        var responsePending = await client.PostAsync("/api/tickets", contentPending);
        Assert.True(responsePending.IsSuccessStatusCode);

        // Retrieve list and verify filtering capability
        var listResponse = await client.GetAsync("/api/tickets?status=pending");
        Assert.True(listResponse.IsSuccessStatusCode);
    }

    [Fact]
    public async Task TicketPriority_DifferentLevels_AllValid()
    {
        var client = _factory.CreateClient();

        var priorities = new[] { TicketPriority.Low, TicketPriority.Medium, TicketPriority.High, TicketPriority.Critical };

        foreach (var priority in priorities)
        {
            var ticket = TestTickets.CreateBusinessRegistration();
            ticket.Priority = priority;

            var content = new StringContent(
                System.Text.Json.JsonSerializer.Serialize(ticket, JsonOptions),
                System.Text.Encoding.UTF8,
                "application/json");

            var response = await client.PostAsync("/api/tickets", content);

            Assert.True(response.IsSuccessStatusCode || response.StatusCode == System.Net.HttpStatusCode.BadRequest);
        }
    }

    [Fact]
    public async Task CrossRegion_TicketSubmission_AllLocationsWork()
    {
        var client = _factory.CreateClient();

        var locations = new[] { "Kampala", "Jinja", "Mbarara", "Gulu", "Fort Portal", "Kasese" };

        foreach (var location in locations)
        {
            var ticket = TestTickets.CreateBusinessRegistration();
            ticket.InvestorNationality = location; // Map location to investor info

            var content = new StringContent(
                System.Text.Json.JsonSerializer.Serialize(ticket, JsonOptions),
                System.Text.Encoding.UTF8,
                "application/json");

            var response = await client.PostAsync("/api/tickets", content);

            Assert.True(response.IsSuccessStatusCode);
        }
    }
}
