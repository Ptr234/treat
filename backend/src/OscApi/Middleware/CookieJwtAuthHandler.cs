using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using OscApi.Common;

namespace OscApi.Middleware;

public class CookieJwtAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    private readonly JwtService _jwt;

    public CookieJwtAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        JwtService jwt)
        : base(options, logger, encoder)
    {
        _jwt = jwt;
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var token = Request.Cookies["osc-session"];
        if (string.IsNullOrEmpty(token))
            return Task.FromResult(AuthenticateResult.NoResult());

        var principal = _jwt.ValidateToken(token);
        if (principal is null)
            return Task.FromResult(AuthenticateResult.Fail("Invalid token"));

        var ticket = new AuthenticationTicket(principal, Scheme.Name);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
