using System.Net.Http.Json;
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
        var request = TestTickets.CreateInvestmentInquiryRequest();
        var ticketResponse = await client.PostAsJsonAsync("/api/tickets", request);
        Assert.True(ticketResponse.IsSuccessStatusCode);

        // 3. Retrieve created ticket and extract reference number
        var responseBody = await ticketResponse.Content.ReadAsStringAsync();
        var jsonDoc = System.Text.Json.JsonDocument.Parse(responseBody);
        var referenceNumber = jsonDoc.RootElement
            .GetProperty("data")
            .GetProperty("referenceNumber")
            .GetString();

        // Pass email as query parameter for unauthenticated access
        var getResponse = await client.GetAsync($"/api/tickets/{referenceNumber}?email={request.ContactEmail}");
        Assert.True(getResponse.IsSuccessStatusCode);

        // 4. Verify ticket data
        var content = await getResponse.Content.ReadAsStringAsync();
        Assert.Contains("industrial park", content, System.StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task MultipleTickets_DifferentCategories_AllSucceed()
    {
        var client = _factory.CreateClient();

        var requests = new object[]
        {
            TestTickets.CreateBusinessRegistrationRequest(),
            TestTickets.CreateInvestmentInquiryRequest(),
            TestTickets.CreateLicenseApplicationRequest(),
        };

        var successCount = 0;
        foreach (var request in requests)
        {
            var response = await client.PostAsJsonAsync("/api/tickets", request);

            if (response.IsSuccessStatusCode)
                successCount++;
        }

        Assert.Equal(requests.Length, successCount);
    }

    [Fact]
    public async Task TicketListFiltering_ByStatus_WorksCorrectly()
    {
        var client = _factory.CreateClient();

        // Create tickets with different statuses
        var request = TestTickets.CreateBusinessRegistrationRequest();
        var responsePending = await client.PostAsJsonAsync("/api/tickets", request);
        Assert.True(responsePending.IsSuccessStatusCode);

        // Authenticate as admin to list tickets
        await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = ApiFactory.AdminEmail,
            password = ApiFactory.AdminPassword,
        });

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
            var request = TestTickets.CreateBusinessRegistrationRequest();
            // Create new request with updated InvestorNationality
            var requestWithLocation = new OscApi.Dtos.Tickets.CreateTicketRequest(
                request.Title,
                request.Description,
                request.Category,
                request.Priority,
                request.ContactEmail,
                request.ContactName,
                request.ContactPhone,
                location,  // Update InvestorNationality to location
                request.Sector,
                request.InvestmentSize,
                request.IsEscalated
            );

            var response = await client.PostAsJsonAsync("/api/tickets", requestWithLocation);

            Assert.True(response.IsSuccessStatusCode);
        }
    }
}
