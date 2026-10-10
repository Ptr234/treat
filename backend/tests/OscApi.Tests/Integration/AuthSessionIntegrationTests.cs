using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using OscApi.Tests.Helpers;

namespace OscApi.Tests.Integration;

/// <summary>
/// GET /auth/session answers 200 for everyone (user or null), so a signed-out
/// visitor's session check is not a failed request in the browser console.
/// </summary>
public class AuthSessionIntegrationTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    public AuthSessionIntegrationTests(ApiFactory factory) => _factory = factory;

    // Null fields are omitted from API responses, so "signed out" is either a
    // missing or a null "data" (the frontend treats both as no user).
    private static async Task<JsonElement> DataAsync(HttpResponseMessage response)
    {
        var root = JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement;
        Assert.True(root.GetProperty("success").GetBoolean());
        return root.TryGetProperty("data", out var data) ? data : default;
    }

    private static bool IsSignedOut(JsonElement data) =>
        data.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null;

    [Fact]
    public async Task SignedOut_Returns200WithNull()
    {
        var response = await _factory.CreateClient().GetAsync("/api/v1/auth/session");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(IsSignedOut(await DataAsync(response)));
    }

    [Fact]
    public async Task SignedIn_ReturnsTheAccount()
    {
        var client = _factory.CreateClient();
        var email = $"session-{Guid.NewGuid():N}@example.com";
        await TestUsers.SignUpVerifiedAsync(_factory, client, "Session User", email, "Session1pass");

        var data = await DataAsync(await client.GetAsync("/api/v1/auth/session"));

        Assert.Equal(email, data.GetProperty("email").GetString());
        Assert.Equal("user", data.GetProperty("role").GetString());
    }

    [Fact]
    public async Task GarbageCookie_ReadsAsSignedOut()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("Cookie", "osc-session=not-a-real-token");

        var response = await client.GetAsync("/api/v1/auth/session");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(IsSignedOut(await DataAsync(response)));
    }

    [Fact]
    public async Task AfterLogout_ReadsAsSignedOut()
    {
        var client = _factory.CreateClient();
        await TestUsers.SignUpVerifiedAsync(_factory, client, "Logout User", $"logout-{Guid.NewGuid():N}@example.com", "Logout1pass");

        await client.PostAsync("/api/v1/auth/logout", null);

        Assert.True(IsSignedOut(await DataAsync(await client.GetAsync("/api/v1/auth/session"))));
    }
}
