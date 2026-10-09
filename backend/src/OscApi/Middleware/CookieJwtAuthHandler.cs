using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using OscApi.Common;
using OscApi.Data;
using Microsoft.EntityFrameworkCore;

namespace OscApi.Middleware;

public class CookieJwtAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    private readonly IJwtService _jwt;
    private readonly OscDbContext _db;

    public CookieJwtAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        IJwtService jwt,
        OscDbContext db)
        : base(options, logger, encoder)
    {
        _jwt = jwt;
        _db = db;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var token = Request.Cookies["osc-session"];
        if (string.IsNullOrEmpty(token))
            return AuthenticateResult.NoResult();

        var principal = _jwt.ValidateToken(token);
        if (principal is null)
            return AuthenticateResult.Fail("Invalid or expired token");

        // JWT claims are a snapshot. Re-check current account state so deactivation,
        // role/agency changes, MFA changes, and password resets revoke old cookies.
        var idValue = principal.FindFirst("sub")?.Value ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = principal.FindFirst(ClaimTypes.Role)?.Value ?? principal.FindFirst("role")?.Value;
        if (!Guid.TryParse(idValue, out var id) || string.IsNullOrWhiteSpace(role))
            return AuthenticateResult.Fail("Invalid session");

        var accountUpdatedClaim = principal.FindFirst("account_updated_at")?.Value;
        if (!long.TryParse(accountUpdatedClaim, out var tokenUpdatedAt))
            return AuthenticateResult.Fail("Session must be refreshed");

        DateTimeOffset currentUpdatedAt;
        if (Roles.BackOfficeRoles.Contains(role))
        {
            var admin = await _db.AdminUsers.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id, Context.RequestAborted);
            if (admin is null || !admin.IsActive || admin.Role != role ||
                admin.AgencyCode != principal.FindFirst("agency_code")?.Value ||
                admin.MfaEnabled.ToString().ToLowerInvariant() != principal.FindFirst("mfa_enabled")?.Value)
                return AuthenticateResult.Fail("Account is inactive or its security state changed");
            currentUpdatedAt = admin.UpdatedAt;
        }
        else
        {
            var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id, Context.RequestAborted);
            if (user is null || !user.IsActive || user.Role != role ||
                user.EmailVerified.ToString().ToLowerInvariant() != principal.FindFirst("email_verified")?.Value)
                return AuthenticateResult.Fail("Account is inactive or its security state changed");
            currentUpdatedAt = user.UpdatedAt;
        }

        if (currentUpdatedAt.ToUnixTimeMilliseconds() != tokenUpdatedAt)
            return AuthenticateResult.Fail("Account security state changed");

        var ticket = new AuthenticationTicket(principal, Scheme.Name);
        return AuthenticateResult.Success(ticket);
    }
}
