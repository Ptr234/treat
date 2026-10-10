using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using OscApi.Data;

namespace OscApi.Tests.Helpers;

/// <summary>
/// Regular (investor) accounts need a verified email before they can sign in
/// with a password. A test can't click the emailed link, so this signs up,
/// marks the address verified directly in the test database (what the link
/// does), then signs in — leaving <paramref name="client"/> with a session.
/// </summary>
public static class TestUsers
{
    public static async Task SignUpVerifiedAsync<TEntry>(
        WebApplicationFactory<TEntry> factory, HttpClient client, string name, string email, string password)
        where TEntry : class
    {
        var signup = await client.PostAsJsonAsync("/api/v1/auth/signup", new { name, email, password });
        Assert.Equal(HttpStatusCode.OK, signup.StatusCode);

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<OscDbContext>();
            var user = db.Users.Single(u => u.Email == email.ToLowerInvariant());
            user.EmailVerified = true;
            user.EmailVerificationToken = null;
            user.EmailVerificationExpiresAt = null;
            db.SaveChanges();
        }

        var login = await client.PostAsJsonAsync("/api/v1/auth/login", new { email, password });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
    }
}
