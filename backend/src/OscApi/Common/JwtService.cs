using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace OscApi.Common;

public interface IJwtService
{
    string CreateToken(string userId, string email, string name, string role, string? picture = null, string? agencyCode = null, bool mfaEnabled = false);
    ClaimsPrincipal? ValidateToken(string token);
    CookieOptions GetCookieOptions(bool isProduction = false);
}

public class JwtService : IJwtService
{
    private readonly string _secret;
    private readonly int _expiryHours;
    private readonly string _issuer;
    private readonly bool _secureCookies;
    private readonly string? _cookieDomain;

    public JwtService(IConfiguration config)
    {
        _secret = config["Jwt:Secret"] ?? throw new InvalidOperationException("JWT:Secret is not configured");
        if (Encoding.UTF8.GetByteCount(_secret) < 32)
            throw new InvalidOperationException("Jwt:Secret must be at least 32 bytes for HS256");
        _expiryHours = int.Parse(config["Jwt:ExpiryHours"] ?? "24");
        _issuer = config["Jwt:Issuer"] ?? "osc-api";
        // The session cookie is only marked Secure when the site is actually
        // served over HTTPS. Keying off the environment name would set Secure
        // for a Production build served over plain http (e.g. a LAN address),
        // which silently breaks login because the browser won't send the cookie.
        _secureCookies = (config["SiteUrl"] ?? "").StartsWith("https", StringComparison.OrdinalIgnoreCase);
        // When the API and the site live on sibling subdomains (api.example.com /
        // www.example.com), the cookie must carry Domain=.example.com — a host-only
        // cookie set by the API host is invisible to the Next.js middleware on www,
        // which would bounce every /dashboard visit back to the homepage. Leave
        // unset for localhost / single-host deployments.
        _cookieDomain = config["Cookie:Domain"];
    }

    public string CreateToken(string userId, string email, string name, string role, string? picture = null, string? agencyCode = null, bool mfaEnabled = false)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId),
            new(JwtRegisteredClaimNames.Email, email),
            new("name", name),
            // ClaimTypes.Role (a long Microsoft URI) is what ASP.NET authorization
            // reads; the short "role" claim is what the Next.js middleware and
            // client read. Emit both so the same token works on both tiers.
            new(ClaimTypes.Role, role),
            new("role", role),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            // Read by MfaCompleteHandler (Staff/AdminOnly policies) and by the
            // frontend middleware, so a back-office session that hasn't completed
            // MFA enrolment can reach the enrolment flow but nothing else. Always
            // present (not just for back-office roles) so its absence is never
            // mistaken for "not required".
            new("mfa_enabled", mfaEnabled ? "true" : "false"),
        };

        if (picture is not null)
            claims.Add(new Claim("picture", picture));

        // Agency scope for agency_officer accounts (absent for admin-level roles).
        if (!string.IsNullOrEmpty(agencyCode))
            claims.Add(new Claim("agency_code", agencyCode));

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

    // The bool parameter is retained for call-site compatibility but the Secure
    // flag is derived from the configured SiteUrl scheme (see constructor).
    public CookieOptions GetCookieOptions(bool isProduction = false) => new()
    {
        HttpOnly = true,
        Secure = _secureCookies,
        SameSite = SameSiteMode.Lax,
        MaxAge = TimeSpan.FromHours(_expiryHours),
        Path = "/",
        Domain = string.IsNullOrWhiteSpace(_cookieDomain) ? null : _cookieDomain,
    };
}
