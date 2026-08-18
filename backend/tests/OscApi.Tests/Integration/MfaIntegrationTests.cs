using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using OtpNet;

namespace OscApi.Tests.Integration;

/// <summary>
/// Exercises the admin TOTP multi-factor flow end to end: enrol → verify → the
/// login gate → disable. Uses its own ApiFactory (class-isolated in-memory DB),
/// so enabling MFA on the seeded admin does not leak into other test classes.
/// </summary>
public class MfaIntegrationTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    public MfaIntegrationTests(ApiFactory factory) => _factory = factory;

    private static async Task<JsonElement> DataOf(HttpResponseMessage res)
    {
        var doc = JsonDocument.Parse(await res.Content.ReadAsStringAsync());
        return doc.RootElement.GetProperty("data");
    }

    private static string Code(string secret) => new Totp(Base32Encoding.ToBytes(secret)).ComputeTotp();

    [Fact]
    public async Task Enroll_WithoutAdminSession_Unauthorized()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsync("/api/auth/mfa/enroll", null);
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task MandatoryMfa_BackOfficeSessionWithoutMfa_CannotReachStaffOrAdminEndpoints_ButCanStillEnroll()
    {
        var client = _factory.CreateClient();

        // Password alone authenticates this admin (MFA not yet enrolled) — the
        // session cookie is issued, but it carries mfa_enabled=false.
        var login = await client.PostAsJsonAsync("/api/auth/login",
            new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        // Blocked from both an AdminOnly and a Staff-policy endpoint...
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/dashboard")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/tickets")).StatusCode);

        // ...but never locked out of the enrolment flow itself (it sits outside
        // both policies), so there's always a way to satisfy the requirement.
        var enroll = await client.PostAsync("/api/auth/mfa/enroll", null);
        Assert.Equal(HttpStatusCode.OK, enroll.StatusCode);
        var secret = (await DataOf(enroll)).GetProperty("secret").GetString()!;
        var verify = await client.PostAsJsonAsync("/api/auth/mfa/verify", new { code = Code(secret) });
        Assert.Equal(HttpStatusCode.OK, verify.StatusCode);

        // The same session cookie (reissued by mfa/verify) now reaches both.
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/dashboard")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/tickets")).StatusCode);

        // Disabling MFA immediately drops back-office access again, on the same session.
        var disable = await client.PostAsJsonAsync("/api/auth/mfa/disable",
            new { password = ApiFactory.AdminPassword, code = Code(secret) });
        Assert.Equal(HttpStatusCode.OK, disable.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/dashboard")).StatusCode);
    }

    [Fact]
    public async Task Mfa_FullLifecycle_EnrollVerifyLoginGateDisable()
    {
        var client = _factory.CreateClient();

        // 1. Sign in as admin (no MFA yet) — establishes the session cookie.
        var login = await client.PostAsJsonAsync("/api/auth/login",
            new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        // 2. Begin enrolment — returns a base32 secret + otpauth URI.
        var enroll = await client.PostAsync("/api/auth/mfa/enroll", null);
        Assert.Equal(HttpStatusCode.OK, enroll.StatusCode);
        var enrollData = await DataOf(enroll);
        var secret = enrollData.GetProperty("secret").GetString()!;
        Assert.False(string.IsNullOrWhiteSpace(secret));
        Assert.StartsWith("otpauth://totp/", enrollData.GetProperty("otpauthUri").GetString());

        // 3. Confirm with a valid code — activates MFA.
        var verify = await client.PostAsJsonAsync("/api/auth/mfa/verify", new { code = Code(secret) });
        Assert.Equal(HttpStatusCode.OK, verify.StatusCode);

        var status = await client.GetAsync("/api/auth/mfa/status");
        Assert.True((await DataOf(status)).GetProperty("enabled").GetBoolean());

        // 4. Fresh client: password alone now yields an MFA challenge, not a session.
        var client2 = _factory.CreateClient();
        var pwOnly = await client2.PostAsJsonAsync("/api/auth/login",
            new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword });
        Assert.Equal(HttpStatusCode.OK, pwOnly.StatusCode);
        Assert.True((await DataOf(pwOnly)).GetProperty("mfaRequired").GetBoolean());
        // No session was issued — protected endpoint stays unauthorized.
        Assert.Equal(HttpStatusCode.Unauthorized, (await client2.GetAsync("/api/dashboard")).StatusCode);

        // 5. Wrong code is rejected.
        var badCode = await client2.PostAsJsonAsync("/api/auth/login",
            new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword, mfaCode = "000000" });
        Assert.Equal(HttpStatusCode.Unauthorized, badCode.StatusCode);

        // 6. Correct code completes login and grants access.
        var withCode = await client2.PostAsJsonAsync("/api/auth/login",
            new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword, mfaCode = Code(secret) });
        Assert.Equal(HttpStatusCode.OK, withCode.StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client2.GetAsync("/api/dashboard")).StatusCode);

        // 7. Disable MFA (needs password + a current code) to restore the seed state.
        var disable = await client2.PostAsJsonAsync("/api/auth/mfa/disable",
            new { password = ApiFactory.AdminPassword, code = Code(secret) });
        Assert.Equal(HttpStatusCode.OK, disable.StatusCode);

        var afterLogin = await _factory.CreateClient().PostAsJsonAsync("/api/auth/login",
            new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword });
        Assert.Equal(HttpStatusCode.OK, afterLogin.StatusCode);
        // Plain password login again returns a real session (no mfaRequired flag).
        var body = await afterLogin.Content.ReadAsStringAsync();
        Assert.DoesNotContain("mfaRequired", body);
    }
}
