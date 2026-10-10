using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using OtpNet;

namespace OscApi.Tests.Integration;

/// <summary>
/// Ticket access over HTTP: the public side is gated on the tracking token (or
/// a signed-in owner), staff on an MFA-complete session, and malformed staff
/// input is a 400 rather than a database error.
/// </summary>
public class TicketAccessIntegrationTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    public TicketAccessIntegrationTests(ApiFactory factory) => _factory = factory;

    private static string? _adminMfaSecret;
    private static string Code(string secret) => new Totp(Base32Encoding.ToBytes(secret)).ComputeTotp();
    private static JsonElement Data(string json) => JsonDocument.Parse(json).RootElement.GetProperty("data");

    private async Task<HttpClient> AdminClient(bool completeMfa = true)
    {
        var client = _factory.CreateClient();
        object body = _adminMfaSecret is null
            ? new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword }
            : new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword, mfaCode = Code(_adminMfaSecret) };
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/v1/auth/login", body)).StatusCode);

        if (completeMfa && _adminMfaSecret is null)
        {
            var enroll = await client.PostAsync("/api/v1/auth/mfa/enroll", null);
            _adminMfaSecret = Data(await enroll.Content.ReadAsStringAsync()).GetProperty("secret").GetString()!;
            await client.PostAsJsonAsync("/api/v1/auth/mfa/verify", new { code = Code(_adminMfaSecret) });
        }
        return client;
    }

    private async Task<(string Ref, string Token)> FileTicketAsync(object? overrides = null)
    {
        var res = await _factory.CreateClient().PostAsJsonAsync("/api/v1/tickets", overrides ?? new
        {
            title = "Work permit delay", description = "Pending for a month", category = "license_delay",
            contactEmail = "filer@example.com", contactName = "Filer",
        });
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        var data = Data(await res.Content.ReadAsStringAsync());
        return (data.GetProperty("referenceNumber").GetString()!, data.GetProperty("accessToken").GetString()!);
    }

    [Fact]
    public async Task Ticket_IsReadableWithItsToken_AndIndistinguishableFromMissingWithout()
    {
        var (refNo, token) = await FileTicketAsync();
        var anon = _factory.CreateClient();

        Assert.Equal(HttpStatusCode.OK, (await anon.GetAsync($"/api/v1/tickets/{refNo}?token={token}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await anon.GetAsync($"/api/v1/tickets/{refNo}?token=guess")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await anon.GetAsync($"/api/v1/tickets/{refNo}")).StatusCode);
        // The old email-only lookup no longer grants access.
        Assert.Equal(HttpStatusCode.NotFound, (await anon.GetAsync($"/api/v1/tickets/{refNo}?email=filer@example.com")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await anon.GetAsync("/api/v1/tickets/UIA-2099-9999?token=guess")).StatusCode);
    }

    [Fact]
    public async Task AccessLinkRequest_AlwaysAccepted_WithoutRevealingAnything()
    {
        var (refNo, _) = await FileTicketAsync();
        var anon = _factory.CreateClient();

        var match = await anon.PostAsJsonAsync($"/api/v1/tickets/{refNo}/access-link", new { email = "FILER@example.com" });
        var wrong = await anon.PostAsJsonAsync($"/api/v1/tickets/{refNo}/access-link", new { email = "other@example.com" });
        var missing = await anon.PostAsJsonAsync("/api/v1/tickets/UIA-2099-9999/access-link", new { email = "x@example.com" });

        Assert.Equal(HttpStatusCode.Accepted, match.StatusCode);
        Assert.Equal(HttpStatusCode.Accepted, wrong.StatusCode);
        Assert.Equal(HttpStatusCode.Accepted, missing.StatusCode);
    }

    [Fact]
    public async Task PublicCommentAndEscalation_UseTheToken()
    {
        var (refNo, token) = await FileTicketAsync();
        var anon = _factory.CreateClient();

        Assert.Equal(HttpStatusCode.NotFound, (await anon.PostAsJsonAsync($"/api/v1/tickets/{refNo}/comments",
            new { content = "Any news?", token = "guess" })).StatusCode);
        Assert.Equal(HttpStatusCode.Created, (await anon.PostAsJsonAsync($"/api/v1/tickets/{refNo}/comments",
            new { content = "Any news?", token })).StatusCode);

        var escalate = await anon.PatchAsJsonAsync($"/api/v1/tickets/{refNo}/public", new { token, isEscalated = true });
        Assert.Equal(HttpStatusCode.OK, escalate.StatusCode);
    }

    [Fact]
    public async Task OversizedPublicComment_Is400_Not500()
    {
        var (refNo, token) = await FileTicketAsync();
        var res = await _factory.CreateClient().PostAsJsonAsync($"/api/v1/tickets/{refNo}/comments",
            new { content = new string('x', 6000), token });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task StaffUpdate_ValidatesInput_AndCannotRateForTheInvestor()
    {
        var (refNo, _) = await FileTicketAsync();
        var admin = await AdminClient();

        async Task<HttpStatusCode> Patch(object body) =>
            (await admin.PatchAsJsonAsync($"/api/v1/tickets/{refNo}", body)).StatusCode;

        Assert.Equal(HttpStatusCode.BadRequest, await Patch(new { satisfactionRating = 5 }));
        Assert.Equal(HttpStatusCode.BadRequest, await Patch(new { assignee = new string('a', 150) }));
        Assert.Equal(HttpStatusCode.BadRequest, await Patch(new { assignedAgencyCode = "NOPE" }));
        Assert.Equal(HttpStatusCode.BadRequest, await Patch(new { status = "pending" }));
        Assert.Equal(HttpStatusCode.OK, await Patch(new { assignedAgencyCode = "ursb", status = "in_progress" }));

        var ticket = Data(await (await admin.GetAsync($"/api/v1/tickets/{refNo}")).Content.ReadAsStringAsync());
        Assert.Equal("URSB", ticket.GetProperty("assignedAgencyCode").GetString());
        Assert.Equal("InProgress", ticket.GetProperty("status").GetString());
    }

    [Fact]
    public async Task Assignment_UsesTheStaffList_AndStaffSeeTheHistory()
    {
        var (refNo, token) = await FileTicketAsync();
        var admin = await AdminClient();

        // The picker lists real accounts; the admin is assignable on any agency's ticket.
        var officers = Data(await (await admin.GetAsync("/api/v1/tickets/officers?agency=UIA")).Content.ReadAsStringAsync());
        Assert.Contains(officers.EnumerateArray(), o => o.GetProperty("email").GetString() == ApiFactory.AdminEmail.ToLowerInvariant());
        Assert.Equal(HttpStatusCode.BadRequest, (await admin.GetAsync("/api/v1/tickets/officers?agency=NOPE")).StatusCode);

        // A free-text name is no longer an assignee; a staff email is.
        Assert.Equal(HttpStatusCode.BadRequest,
            (await admin.PatchAsJsonAsync($"/api/v1/tickets/{refNo}", new { assignee = "Some Officer" })).StatusCode);
        Assert.Equal(HttpStatusCode.OK,
            (await admin.PatchAsJsonAsync($"/api/v1/tickets/{refNo}", new { assignee = ApiFactory.AdminEmail })).StatusCode);

        var staffView = Data(await (await admin.GetAsync($"/api/v1/tickets/{refNo}")).Content.ReadAsStringAsync());
        Assert.Equal("Assigned", staffView.GetProperty("status").GetString());
        Assert.True(staffView.GetProperty("history").GetArrayLength() >= 2); // filed + assigned (+ status)

        var publicView = Data(await (await _factory.CreateClient().GetAsync($"/api/v1/tickets/{refNo}?token={token}")).Content.ReadAsStringAsync());
        Assert.False(publicView.TryGetProperty("history", out _));
        Assert.False(publicView.TryGetProperty("assigneeEmail", out _));
    }

    [Fact]
    public async Task EscalationDefaultAssignee_MustBeAStaffAccount()
    {
        var admin = await AdminClient();
        async Task<HttpStatusCode> Put(string assignee) => (await admin.PutAsJsonAsync("/api/v1/settings/escalation",
            new { escalationEmails = "", defaultAssignee = assignee, escalationMessage = "Please act" })).StatusCode;

        Assert.Equal(HttpStatusCode.BadRequest, await Put("Senior Investment Officer"));
        Assert.Equal(HttpStatusCode.OK, await Put(ApiFactory.AdminEmail));
        Assert.Equal(HttpStatusCode.OK, await Put(""));
    }

    [Fact]
    public async Task OversizedStaffReply_Is400_Not500()
    {
        var (refNo, _) = await FileTicketAsync();
        var admin = await AdminClient();
        var res = await admin.PostAsJsonAsync($"/api/v1/tickets/{refNo}/messages", new { content = new string('x', 6000) });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task PublicFiling_CannotChooseVip()
    {
        var res = await _factory.CreateClient().PostAsJsonAsync("/api/v1/tickets", new
        {
            title = "Fast track please", description = "d", category = "vip", priority = "critical",
            contactEmail = "fast@example.com", contactName = "Fast",
        });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task StaffSessionWithoutMfa_GetsNoStaffAccessToTickets()
    {
        var (refNo, _) = await FileTicketAsync();

        // Seeded DG account, signed in with a password but never MFA-enrolled.
        var dg = _factory.CreateClient();
        Assert.Equal(HttpStatusCode.OK, (await dg.PostAsJsonAsync("/api/v1/auth/login",
            new { email = "dg@test.local", password = "DG123!@#" })).StatusCode);

        Assert.Equal(HttpStatusCode.NotFound, (await dg.GetAsync($"/api/v1/tickets/{refNo}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await dg.GetAsync($"/api/v1/tickets/{refNo}/documents")).StatusCode);
    }

    [Fact]
    public async Task AgencyList_IsAvailableToStaff()
    {
        var admin = await AdminClient();
        var agencies = Data(await (await admin.GetAsync("/api/v1/tickets/agencies")).Content.ReadAsStringAsync());
        Assert.Contains(agencies.EnumerateArray(), a => a.GetProperty("code").GetString() == "URSB");
    }
}
