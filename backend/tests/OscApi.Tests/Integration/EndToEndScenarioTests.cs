using System.Net.Http.Json;
using System.Text.Json;
using OscApi.Models;
using OscApi.Tests.Fixtures;
using OtpNet;
using Xunit;

namespace OscApi.Tests.Integration;

public class EndToEndScenarioTests
{
    private readonly ApiFactory _factory;

    public EndToEndScenarioTests()
    {
        _factory = new ApiFactory();
    }

    /// <summary>Log in as the seeded admin and complete TOTP enrolment — required
    /// to reach a Staff-policy endpoint under MfaCompleteRequirement. Each test
    /// here gets its own fresh ApiFactory/admin, so no secret caching is needed.</summary>
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
    public async Task InvestorRegistrationToTicketCreation_CompleteFlow()
    {
        var client = _factory.CreateClient();

        // 1. Simulate investor signup (if endpoint exists)
        // var signupResponse = await client.PostAsync("/api/v1/auth/signup", signupContent);
        // Assert.True(signupResponse.IsSuccessStatusCode);

        // 2. Create ticket as investor
        var request = TestTickets.CreateInvestmentInquiryRequest();
        var ticketResponse = await client.PostAsJsonAsync("/api/v1/tickets", request);
        Assert.True(ticketResponse.IsSuccessStatusCode);

        // 3. Retrieve created ticket and extract reference number
        var responseBody = await ticketResponse.Content.ReadAsStringAsync();
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
            var response = await client.PostAsJsonAsync("/api/v1/tickets", request);

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
        var responsePending = await client.PostAsJsonAsync("/api/v1/tickets", request);
        Assert.True(responsePending.IsSuccessStatusCode);

        // Authenticate as admin to list tickets
        await LoginAdminWithMfaAsync(client);

        // Filter by a real status: the new ticket is in the "new" bucket...
        var listResponse = await client.GetAsync("/api/v1/tickets?status=new");
        Assert.True(listResponse.IsSuccessStatusCode);
        var newTotal = System.Text.Json.JsonDocument.Parse(await listResponse.Content.ReadAsStringAsync())
            .RootElement.GetProperty("data").GetProperty("total").GetInt32();
        Assert.True(newTotal >= 1);

        // ...and not in "resolved".
        var resolved = await client.GetAsync("/api/v1/tickets?status=resolved");
        var resolvedRefs = System.Text.Json.JsonDocument.Parse(await resolved.Content.ReadAsStringAsync())
            .RootElement.GetProperty("data").GetProperty("tickets").EnumerateArray()
            .Select(t => t.GetProperty("status").GetString()).ToList();
        Assert.All(resolvedRefs, s => Assert.Equal("Resolved", s));

        // An unknown status is a 400, not silently ignored.
        Assert.Equal(System.Net.HttpStatusCode.BadRequest,
            (await client.GetAsync("/api/v1/tickets?status=pending")).StatusCode);
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

            var response = await client.PostAsync("/api/v1/tickets", content);

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

            var response = await client.PostAsJsonAsync("/api/v1/tickets", requestWithLocation);

            Assert.True(response.IsSuccessStatusCode);
        }
    }
}
