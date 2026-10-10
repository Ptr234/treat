using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.DependencyInjection;
using OscApi.Common;
using OscApi.Data;
using OscApi.Tests.Helpers;

namespace OscApi.Tests.Integration;

/// <summary>
/// Investor accounts can reset a forgotten password (previously only staff
/// accounts could), and repeated wrong passwords lock the account briefly no
/// matter how many IP addresses they come from.
/// </summary>
public class AccountRecoveryIntegrationTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    public AccountRecoveryIntegrationTests(ApiFactory factory) => _factory = factory;

    private static string NewEmail(string p) => $"{p}-{Guid.NewGuid():N}@example.com";

    private static string Hash(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    [Fact]
    public async Task Investor_CanResetForgottenPassword_AndSignInWithTheNewOne()
    {
        var client = _factory.CreateClient();
        var email = NewEmail("reset");
        await TestUsers.SignUpVerifiedAsync(_factory, client, "Reset User", email, "Original1pass");

        var request = await client.PostAsJsonAsync("/api/v1/auth/password-reset", new { email });
        Assert.Equal(HttpStatusCode.OK, request.StatusCode);

        // Only the hash is stored and the raw token goes by email, so put a known
        // token in place to complete the flow the way the emailed link would.
        const string token = "known-reset-token-for-test";
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<OscDbContext>();
            var user = db.Users.Single(u => u.Email == email);
            Assert.NotNull(user.PasswordResetToken);
            Assert.True(user.PasswordResetExpiresAt > DateTimeOffset.UtcNow);
            user.PasswordResetToken = Hash(token);
            db.SaveChanges();
        }

        var verify = await client.PostAsJsonAsync("/api/v1/auth/password-reset/verify",
            new { token, newPassword = "Replaced2pass" });
        Assert.Equal(HttpStatusCode.OK, verify.StatusCode);

        var fresh = _factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await fresh.PostAsJsonAsync("/api/v1/auth/login", new { email, password = "Original1pass" })).StatusCode);
        Assert.Equal(HttpStatusCode.OK,
            (await fresh.PostAsJsonAsync("/api/v1/auth/login", new { email, password = "Replaced2pass" })).StatusCode);

        // The token is single-use.
        var reuse = await client.PostAsJsonAsync("/api/v1/auth/password-reset/verify",
            new { token, newPassword = "Another3pass" });
        Assert.Equal(HttpStatusCode.BadRequest, reuse.StatusCode);
    }

    // The password-reset limiter allows 3 requests per 15 minutes per client,
    // and the test above uses all 3, so no other test in this class may call it.

    [Fact]
    public async Task RepeatedWrongPasswords_LockTheAccount_EvenWithTheRightPassword()
    {
        var client = _factory.CreateClient();
        var email = NewEmail("lock");
        await TestUsers.SignUpVerifiedAsync(_factory, client, "Lock User", email, "Correct1pass");

        for (var i = 0; i < LoginThrottle.MaxFailures; i++)
        {
            var wrong = await client.PostAsJsonAsync("/api/v1/auth/login", new { email, password = "Wrong1pass" });
            Assert.Equal(HttpStatusCode.Unauthorized, wrong.StatusCode);
        }

        var locked = await client.PostAsJsonAsync("/api/v1/auth/login", new { email, password = "Correct1pass" });
        Assert.Equal(HttpStatusCode.TooManyRequests, locked.StatusCode);

        // Other accounts are unaffected.
        var otherEmail = NewEmail("other");
        await TestUsers.SignUpVerifiedAsync(_factory, _factory.CreateClient(), "Other User", otherEmail, "Correct1pass");
    }

    [Fact]
    public async Task SuccessfulSignIn_ClearsEarlierFailures()
    {
        var client = _factory.CreateClient();
        var email = NewEmail("clear");
        await TestUsers.SignUpVerifiedAsync(_factory, client, "Clear User", email, "Correct1pass");

        for (var i = 0; i < LoginThrottle.MaxFailures - 1; i++)
            await client.PostAsJsonAsync("/api/v1/auth/login", new { email, password = "Wrong1pass" });
        Assert.Equal(HttpStatusCode.OK,
            (await client.PostAsJsonAsync("/api/v1/auth/login", new { email, password = "Correct1pass" })).StatusCode);

        // The counter restarted, so one more mistake doesn't lock the account.
        await client.PostAsJsonAsync("/api/v1/auth/login", new { email, password = "Wrong1pass" });
        Assert.Equal(HttpStatusCode.OK,
            (await client.PostAsJsonAsync("/api/v1/auth/login", new { email, password = "Correct1pass" })).StatusCode);
    }
}
