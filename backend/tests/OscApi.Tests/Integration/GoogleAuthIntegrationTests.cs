using System.Net;
using System.Net.Http.Json;

namespace OscApi.Tests.Integration;

/// <summary>
/// Guards on the Google sign-in endpoint. The happy path needs a Google-signed
/// ID token and so cannot run offline, but the rejection paths — which are the
/// security-relevant ones — are fully exercisable.
/// </summary>
public class GoogleAuthIntegrationTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public GoogleAuthIntegrationTests(ApiFactory factory) => _factory = factory;

    [Fact]
    public async Task Google_sign_in_rejects_a_missing_credential()
    {
        var client = _factory.CreateClient();

        var res = await client.PostAsJsonAsync("/api/auth/google", new { idToken = "" });

        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Google_sign_in_rejects_a_token_that_is_not_signed_by_google()
    {
        var client = _factory.CreateClient();

        // Well-formed JWT shape, but not signed by Google — validation must fail
        // rather than the payload being trusted as-is.
        const string forged =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
            "eyJlbWFpbCI6ImFkbWluQHVpYS5nby51ZyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJzdWIiOiIxIn0." +
            "not-a-real-google-signature";

        var res = await client.PostAsJsonAsync("/api/auth/google", new { idToken = forged });

        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task Google_sign_in_does_not_issue_a_session_for_an_invalid_token()
    {
        var client = _factory.CreateClient();

        var res = await client.PostAsJsonAsync("/api/auth/google", new { idToken = "garbage" });

        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
        Assert.False(res.Headers.Contains("Set-Cookie"),
            "a rejected Google sign-in must not set a session cookie");
    }
}
