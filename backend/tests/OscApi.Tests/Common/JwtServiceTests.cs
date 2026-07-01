using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using OscApi.Common;

namespace OscApi.Tests.Common;

public class JwtServiceTests
{
    private static JwtService CreateService(string secret = "test-secret-key-minimum-32-characters-long!!")
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Secret"] = secret,
                ["Jwt:ExpiryHours"] = "24",
                ["Jwt:Issuer"] = "osc-api",
            })
            .Build();
        return new JwtService(config);
    }

    [Fact]
    public void CreateToken_ThenValidate_RoundTripsClaims()
    {
        var jwt = CreateService();
        var token = jwt.CreateToken("user-123", "admin@uia.go.ug", "OSC Admin", "admin", "http://pic");

        var principal = jwt.ValidateToken(token);

        Assert.NotNull(principal);
        Assert.Equal("admin@uia.go.ug", principal!.FindFirst(ClaimTypes.Email)?.Value);
        Assert.Equal("admin", principal.FindFirst(ClaimTypes.Role)?.Value);
        Assert.True(principal.IsInRole("admin"));
        Assert.Equal("user-123", principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? principal.FindFirst("sub")?.Value);
    }

    [Fact]
    public void ValidateToken_WithTamperedToken_ReturnsNull()
    {
        var jwt = CreateService();
        var token = jwt.CreateToken("u", "e@e.com", "n", "user");

        var tampered = token.Substring(0, token.Length - 3) + "abc";

        Assert.Null(jwt.ValidateToken(tampered));
    }

    [Fact]
    public void ValidateToken_SignedWithDifferentSecret_ReturnsNull()
    {
        var issuer = CreateService("secret-A-minimum-32-characters-long-padding!!");
        var verifier = CreateService("secret-B-minimum-32-characters-long-padding!!");

        var token = issuer.CreateToken("u", "e@e.com", "n", "user");

        Assert.Null(verifier.ValidateToken(token));
    }

    [Fact]
    public void ValidateToken_Garbage_ReturnsNull()
    {
        Assert.Null(CreateService().ValidateToken("not-a-jwt"));
    }
}
