using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using OscApi.Common;
using OscApi.Data;
using OscApi.Models;
using OtpNet;

namespace OscApi.Tests.Integration;

/// <summary>
/// Regression tests for the security review: MFA is enforced on every
/// privileged route (not only those behind the Staff/AdminOnly policies),
/// Google sign-in honours account status and agency scope, and chat sessions
/// require unguessable ids.
/// </summary>
public class SecurityReviewIntegrationTests : IClassFixture<ApiFactory>
{
    private readonly WebApplicationFactory<Program> _factory;

    /// <summary>Accepts "verified:{email}" as a Google token for that address.</summary>
    private sealed class FakeGoogleValidator : IGoogleTokenValidator
    {
        public Task<GoogleJsonWebSignature.Payload> ValidateAsync(string idToken, string clientId)
        {
            if (!idToken.StartsWith("verified:")) throw new InvalidJwtException("bad token");
            var email = idToken["verified:".Length..];
            return Task.FromResult(new GoogleJsonWebSignature.Payload
            {
                Email = email, EmailVerified = true, Subject = "g-" + email, Name = "Google " + email,
            });
        }
    }

    public SecurityReviewIntegrationTests(ApiFactory factory)
    {
        _factory = factory.WithWebHostBuilder(b => b.ConfigureTestServices(services =>
        {
            services.RemoveAll<IGoogleTokenValidator>();
            services.AddSingleton<IGoogleTokenValidator, FakeGoogleValidator>();
        }));
    }

    private static JsonElement Data(string json) => JsonDocument.Parse(json).RootElement.GetProperty("data");

    private void Seed(Action<OscDbContext> seed)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<OscDbContext>();
        seed(db);
        db.SaveChanges();
    }

    // The seeded DG account: admin-level role, signed in with a password, but
    // never MFA-enrolled in this fixture.
    private async Task<HttpClient> AdminWithoutMfa()
    {
        var c = _factory.CreateClient();
        Assert.Equal(HttpStatusCode.OK, (await c.PostAsJsonAsync("/api/v1/auth/login",
            new { email = "dg@test.local", password = "DG123!@#" })).StatusCode);
        return c;
    }

    private static string? _adminSecret;

    private async Task<HttpClient> AdminWithMfa()
    {
        var c = _factory.CreateClient();
        static string Code(string s) => new Totp(Base32Encoding.ToBytes(s)).ComputeTotp();
        object body = _adminSecret is null
            ? new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword }
            : new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword, mfaCode = Code(_adminSecret) };
        Assert.Equal(HttpStatusCode.OK, (await c.PostAsJsonAsync("/api/v1/auth/login", body)).StatusCode);
        if (_adminSecret is null)
        {
            var enroll = await c.PostAsync("/api/v1/auth/mfa/enroll", null);
            _adminSecret = Data(await enroll.Content.ReadAsStringAsync()).GetProperty("secret").GetString()!;
            await c.PostAsJsonAsync("/api/v1/auth/mfa/verify", new { code = Code(_adminSecret) });
        }
        return c;
    }

    // ── 1. MFA on every privileged route ───────────────────────────────────────

    [Fact]
    public async Task AdminSessionWithoutMfa_IsRefused_OnInvestorRoutes()
    {
        var reference = "INV-SEC-" + Guid.NewGuid().ToString("N")[..8];
        Seed(db => db.InvestorProfiles.Add(new InvestorProfile
        {
            ReferenceNumber = reference, Name = "Sec Test", Email = "sec.investor@example.com", Phone = "+256700000001",
            Nationality = "Ugandan", InvestmentAmount = "100000", PrimarySector = "agriculture",
        }));

        var noMfa = await AdminWithoutMfa();
        Assert.Equal(HttpStatusCode.Forbidden, (await noMfa.GetAsync("/api/v1/investors")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await noMfa.PatchAsJsonAsync($"/api/v1/investors/{reference}", new { status = "active" })).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await noMfa.DeleteAsync($"/api/v1/investors/{reference}")).StatusCode);
        // Without MFA the session is treated as the public: no email, no profile.
        Assert.Equal(HttpStatusCode.Forbidden, (await noMfa.GetAsync($"/api/v1/investors/{reference}")).StatusCode);

        var mfa = await AdminWithMfa();
        Assert.Equal(HttpStatusCode.OK, (await mfa.GetAsync("/api/v1/investors")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await mfa.GetAsync($"/api/v1/investors/{reference}")).StatusCode);
    }

    [Fact]
    public async Task AdminSessionWithoutMfa_GetsNoStaffAccess_ToRegistrationsOrDocumentDeletion()
    {
        var reference = "REG-SEC-" + Guid.NewGuid().ToString("N")[..8];
        Seed(db => db.BusinessRegistrations.Add(new BusinessRegistration
        {
            ReferenceNumber = reference, BusinessName = "Sec Test Ltd", BusinessType = "limited-company",
            BusinessStructure = "private", Sector = "ICT", Location = "Kampala", AssignedAgencyCode = "URSB",
            ContactName = "Applicant", ContactEmail = "sec.applicant@example.com",
        }));

        var noMfa = await AdminWithoutMfa();
        Assert.Equal(HttpStatusCode.Forbidden, (await noMfa.GetAsync($"/api/v1/business-registrations/{reference}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await noMfa.GetAsync($"/api/v1/business-registrations/{reference}/payment")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden,
            (await noMfa.DeleteAsync($"/api/v1/tickets/UIA-2026-0001/documents/{Guid.NewGuid()}")).StatusCode);

        var mfa = await AdminWithMfa();
        Assert.Equal(HttpStatusCode.OK, (await mfa.GetAsync($"/api/v1/business-registrations/{reference}")).StatusCode);
    }

    // ── 2. Google sign-in honours account status and agency scope ──────────────

    [Fact]
    public async Task Google_DeactivatedUser_GetsNoSession()
    {
        var email = $"inactive-{Guid.NewGuid():N}@example.com";
        Seed(db => db.Users.Add(new User { Name = "Inactive", Email = email, Role = "user", IsActive = false }));

        var res = await _factory.CreateClient().PostAsJsonAsync("/api/v1/auth/google", new { idToken = "verified:" + email });

        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
        Assert.False(res.Headers.Contains("Set-Cookie"));
    }

    [Fact]
    public async Task Google_DeactivatedAdmin_IsRefused_AndNotTurnedIntoARegularUser()
    {
        var email = $"former-officer-{Guid.NewGuid():N}@uia.go.ug";
        Seed(db => db.AdminUsers.Add(new AdminUser { Name = "Former", Email = email, Role = "admin", IsActive = false }));

        var res = await _factory.CreateClient().PostAsJsonAsync("/api/v1/auth/google", new { idToken = "verified:" + email });

        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
        Assert.False(res.Headers.Contains("Set-Cookie"));
        using var scope = _factory.Services.CreateScope();
        Assert.False(scope.ServiceProvider.GetRequiredService<OscDbContext>().Users.Any(u => u.Email == email));
    }

    [Fact]
    public async Task Google_AgencyOfficer_SessionCarriesTheAgency()
    {
        var email = $"officer-{Guid.NewGuid():N}@uia.go.ug";
        Seed(db => db.AdminUsers.Add(new AdminUser
        {
            Name = "URSB Officer", Email = email, Role = "agency_officer", AgencyCode = "URSB", IsActive = true,
        }));

        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/v1/auth/google", new { idToken = "verified:" + email });
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        Assert.Equal("URSB", Data(await res.Content.ReadAsStringAsync()).GetProperty("agencyCode").GetString());

        var me = Data(await (await client.GetAsync("/api/v1/auth/me")).Content.ReadAsStringAsync());
        Assert.Equal("URSB", me.GetProperty("agencyCode").GetString());
    }

    [Fact]
    public async Task Google_ActiveUser_StillSignsIn()
    {
        var email = $"active-{Guid.NewGuid():N}@example.com";
        var res = await _factory.CreateClient().PostAsJsonAsync("/api/v1/auth/google", new { idToken = "verified:" + email });
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    }

    // ── 4. Chat sessions need unguessable ids ───────────────────────────────────

    [Theory]
    [InlineData("chat-k3j2h1-ab12cd")]          // the old timestamp + Math.random() shape
    [InlineData("escalation-mfa8x2")]
    [InlineData("guessable")]
    public async Task Chat_RejectsGuessableSessionIds(string sessionId)
    {
        var client = _factory.CreateClient();
        Assert.Equal(HttpStatusCode.BadRequest,
            (await client.PostAsJsonAsync("/api/v1/chatbot/clear", new { sessionId })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest,
            (await client.PostAsJsonAsync("/api/v1/chatbot", new { sessionId, message = "Hello", language = "en" })).StatusCode);
    }

    [Fact]
    public async Task Chat_AcceptsRandomSessionIds()
    {
        var res = await _factory.CreateClient().PostAsJsonAsync("/api/v1/chatbot/clear",
            new { sessionId = "chat-" + Guid.NewGuid() });
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    }

    // ── 6. Stored document paths can't escape the uploads directory ────────────

    [Theory]
    [InlineData("/uploads/abc.pdf", "abc.pdf")]
    [InlineData("/uploads/../../etc/passwd", "passwd")]
    [InlineData("..\\..\\secrets.json", "secrets.json")]
    public void UploadStorage_UsesOnlyTheFileName(string storageUrl, string expectedFile)
    {
        var root = Path.Combine(Path.GetTempPath(), "osc-uploads-test");
        Assert.Equal(Path.Combine(root, expectedFile), UploadStorage.PathFor(root, storageUrl));
    }
}
