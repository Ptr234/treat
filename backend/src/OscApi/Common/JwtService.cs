using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace OscApi.Common;

public class JwtService
{
    private readonly string _secret;
    private readonly int _expiryHours;
    private readonly string _issuer;

    public JwtService(IConfiguration config)
    {
        _secret = config["Jwt:Secret"] ?? throw new InvalidOperationException("JWT:Secret is not configured");
        _expiryHours = int.Parse(config["Jwt:ExpiryHours"] ?? "24");
        _issuer = config["Jwt:Issuer"] ?? "osc-api";
    }

    public string CreateToken(string userId, string email, string name, string role, string? picture = null)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId),
            new(JwtRegisteredClaimNames.Email, email),
            new("name", name),
            new(ClaimTypes.Role, role),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        if (picture is not null)
            claims.Add(new Claim("picture", picture));

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _issuer,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(_expiryHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var handler = new JwtSecurityTokenHandler();

        try
        {
            return handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateAudience = true,
                ValidAudience = _issuer,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(1),
            }, out _);
        }
        catch
        {
            return null;
        }
    }

    public CookieOptions GetCookieOptions(bool isProduction) => new()
    {
        HttpOnly = true,
        Secure = isProduction,
        SameSite = SameSiteMode.Lax,
        MaxAge = TimeSpan.FromHours(_expiryHours),
        Path = "/",
    };
}
