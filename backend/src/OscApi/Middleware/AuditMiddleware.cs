using System.Security.Claims;
using OscApi.Data;
using OscApi.Models;

namespace OscApi.Middleware;

/// <summary>
/// Records every state-changing API request (who, what, when, from where, result)
/// to the append-only audit log. Auth endpoints are logged explicitly by the
/// controller (so the actor is known); telemetry is skipped to avoid noise.
/// Failures here never affect the request.
/// </summary>
public class AuditMiddleware
{
    private readonly RequestDelegate _next;
    private static readonly string[] Mutating = { "POST", "PUT", "PATCH", "DELETE" };

    public AuditMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext ctx, OscDbContext db)
    {
        await _next(ctx);

        try
        {
            var method = ctx.Request.Method;
            var path = ctx.Request.Path.Value ?? string.Empty;

            if (!Mutating.Contains(method)) return;
            if (!path.StartsWith("/api", StringComparison.OrdinalIgnoreCase)) return;
            if (path.StartsWith("/api/analytics", StringComparison.OrdinalIgnoreCase)) return;
            if (path.StartsWith("/api/auth", StringComparison.OrdinalIgnoreCase)) return;

            var user = ctx.User;
            var email = user?.FindFirst(ClaimTypes.Email)?.Value ?? user?.FindFirst("email")?.Value;
            var role = user?.FindFirst(ClaimTypes.Role)?.Value ?? user?.FindFirst("role")?.Value;

            db.AuditLogs.Add(new AuditLog
            {
                ActorEmail = email ?? "(anonymous)",
                ActorRole = role ?? "-",
                Action = $"{method} {path}",
                StatusCode = ctx.Response.StatusCode,
                IpAddress = ctx.Connection.RemoteIpAddress?.ToString(),
            });
            await db.SaveChangesAsync();
        }
        catch
        {
            // Auditing must never break the request path.
        }
    }
}
