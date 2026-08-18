using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using OtpNet;

namespace OscApi.Tests.Integration;

/// <summary>
/// End-to-end role-based access control: DG has full back-office access, agency
/// officers are scoped to their own agency's tickets and shut out of leadership
/// endpoints, and officer accounts require an agency code.
/// </summary>
public class RbacIntegrationTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    public RbacIntegrationTests(ApiFactory factory) => _factory = factory;

    // Every back-office session must complete TOTP enrolment before it can reach a
    // Staff/AdminOnly endpoint (see MfaCompleteRequirement) — a bare password login
    // is no longer sufficient. The seeded admin account is shared across every test
    // in this class (same in-memory DB via IClassFixture), so its secret is cached
    // once enrolled rather than re-enrolled (which would 400 the second time).
    private static string? _adminMfaSecret;
    private static string Code(string secret) => new Totp(Base32Encoding.ToBytes(secret)).ComputeTotp();

    /// <summary>Complete TOTP enrolment for a session that just logged in with no
    /// MFA yet — for one-off officer/dg accounts created fresh within a single test.</summary>
    private static async Task CompleteMfaAsync(HttpClient client)
    {
        var enroll = await client.PostAsync("/api/auth/mfa/enroll", null);
        var secret = JsonDocument.Parse(await enroll.Content.ReadAsStringAsync())
            .RootElement.GetProperty("data").GetProperty("secret").GetString()!;
        await client.PostAsJsonAsync("/api/auth/mfa/verify", new { code = Code(secret) });
    }

    private static async Task<HttpClient> AdminClient(ApiFactory factory)
    {
        var client = factory.CreateClient();
        object body = _adminMfaSecret is null
            ? new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword }
            : new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword, mfaCode = Code(_adminMfaSecret) };
        var login = await client.PostAsJsonAsync("/api/auth/login", body);
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        if (_adminMfaSecret is null)
        {
            var enroll = await client.PostAsync("/api/auth/mfa/enroll", null);
            _adminMfaSecret = JsonDocument.Parse(await enroll.Content.ReadAsStringAsync())
                .RootElement.GetProperty("data").GetProperty("secret").GetString()!;
            await client.PostAsJsonAsync("/api/auth/mfa/verify", new { code = Code(_adminMfaSecret) });
        }
        return client;
    }

    [Fact]
    public async Task CreateAgencyOfficer_RequiresAgencyCode()
    {
        var admin = await AdminClient(_factory);
        var res = await admin.PostAsJsonAsync("/api/admin/users", new
        {
            name = "No Agency", email = $"noagency-{Guid.NewGuid():N}@uia.go.ug",
            password = "Officer@2026!", role = "agency_officer",
        });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task AgencyOfficer_SeesOnlyOwnAgency_AndCannotReachDashboard()
    {
        var admin = await AdminClient(_factory);
        var officerEmail = $"officer-{Guid.NewGuid():N}@uia.go.ug";

        // Create a UIA-scoped officer.
        var create = await admin.PostAsJsonAsync("/api/admin/users", new
        {
            name = "UIA Officer", email = officerEmail,
            password = "Officer@2026!", role = "agency_officer", agencyCode = "UIA",
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);

        // Seed two tickets and assign them to different agencies.
        async Task<string> SeedAssigned(string agency)
        {
            var t = await admin.PostAsJsonAsync("/api/tickets", new
            {
                title = $"Ticket {agency}", description = "d", category = "general_inquiry",
                priority = "low", contactEmail = "i@example.com", contactName = "I",
            });
            var refNo = JsonDocument.Parse(await t.Content.ReadAsStringAsync())
                .RootElement.GetProperty("data").GetProperty("referenceNumber").GetString()!;
            await admin.PatchAsJsonAsync($"/api/tickets/{refNo}", new { assignedAgencyCode = agency });
            return refNo;
        }
        await SeedAssigned("UIA");
        var ursbRef = await SeedAssigned("URSB");

        // Officer signs in.
        var officer = _factory.CreateClient();
        var login = await officer.PostAsJsonAsync("/api/auth/login",
            new { email = officerEmail, password = "Officer@2026!" });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        await CompleteMfaAsync(officer);

        // Ticket list is limited to the officer's agency.
        var list = await officer.GetAsync("/api/tickets");
        Assert.Equal(HttpStatusCode.OK, list.StatusCode);
        var total = JsonDocument.Parse(await list.Content.ReadAsStringAsync())
            .RootElement.GetProperty("data").GetProperty("total").GetInt32();
        Assert.Equal(1, total);

        // A ticket from another agency is not visible / editable.
        Assert.Equal(HttpStatusCode.NotFound, (await officer.GetAsync($"/api/tickets/{ursbRef}")).StatusCode);
        var blocked = await officer.PatchAsJsonAsync($"/api/tickets/{ursbRef}", new { status = "assigned" });
        Assert.Equal(HttpStatusCode.NotFound, blocked.StatusCode);

        // Leadership dashboard stays admin-level only.
        Assert.Equal(HttpStatusCode.Forbidden, (await officer.GetAsync("/api/dashboard")).StatusCode);
    }

    [Fact]
    public async Task DirectorGeneral_HasFullBackOfficeAccess()
    {
        var admin = await AdminClient(_factory);
        var dgEmail = $"dg-{Guid.NewGuid():N}@uia.go.ug";

        var create = await admin.PostAsJsonAsync("/api/admin/users", new
        {
            name = "Director General", email = dgEmail, password = "Director@2026!", role = "dg",
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);

        var dg = _factory.CreateClient();
        var login = await dg.PostAsJsonAsync("/api/auth/login",
            new { email = dgEmail, password = "Director@2026!" });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        await CompleteMfaAsync(dg);

        // DG reaches admin-level endpoints (dashboard, admin user list).
        Assert.Equal(HttpStatusCode.OK, (await dg.GetAsync("/api/dashboard")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await dg.GetAsync("/api/admin/users")).StatusCode);
    }

    [Fact]
    public async Task DirectorGeneral_CanManageMfaAndProfile()
    {
        var admin = await AdminClient(_factory);
        var dgEmail = $"dg-{Guid.NewGuid():N}@uia.go.ug";

        var create = await admin.PostAsJsonAsync("/api/admin/users", new
        {
            name = "Director General", email = dgEmail, password = "Director@2026!", role = "dg",
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);

        var dg = _factory.CreateClient();
        var login = await dg.PostAsJsonAsync("/api/auth/login",
            new { email = dgEmail, password = "Director@2026!" });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        // MFA enrolment must be reachable for a dg (previously "admin"-only → 401).
        var enroll = await dg.PostAsync("/api/auth/mfa/enroll", null);
        Assert.Equal(HttpStatusCode.OK, enroll.StatusCode);
        var enrollData = JsonDocument.Parse(await enroll.Content.ReadAsStringAsync())
            .RootElement.GetProperty("data");
        Assert.False(string.IsNullOrWhiteSpace(enrollData.GetProperty("secret").GetString()));

        // Profile update must resolve the dg in admin_users (previously looked up in
        // the users table → 404). The returned name reflects the change.
        var profile = await dg.PatchAsJsonAsync("/api/auth/profile", new { name = "DG Renamed" });
        Assert.Equal(HttpStatusCode.OK, profile.StatusCode);
        var name = JsonDocument.Parse(await profile.Content.ReadAsStringAsync())
            .RootElement.GetProperty("data").GetProperty("name").GetString();
        Assert.Equal("DG Renamed", name);
    }
}
