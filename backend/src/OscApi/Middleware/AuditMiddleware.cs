using System.Security.Claims;
using Microsoft.Extensions.DependencyInjection;
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
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AuditMiddleware> _logger;
    private static readonly string[] Mutating = { "POST", "PUT", "PATCH", "DELETE" };

    public AuditMiddleware(RequestDelegate next, IServiceScopeFactory scopeFactory, ILogger<AuditMiddleware> logger)
    {
        _next = next;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext ctx)
    {
        await _next(ctx);

        var method = ctx.Request.Method;
        var path = ctx.Request.Path.Value ?? string.Empty;

        if (!Mutating.Contains(method)) return;
        if (!path.StartsWith("/api", StringComparison.OrdinalIgnoreCase)) return;
        if (path.StartsWith("/api/analytics", StringComparison.OrdinalIgnoreCase)) return;
        if (path.StartsWith("/api/auth", StringComparison.OrdinalIgnoreCase)) return;

        // Capture everything needed from the request's HttpContext up front: once this
        // method returns, the request's DI scope (and ctx.User/ctx.Connection) may be torn down.
        var user = ctx.User;
        var email = user?.FindFirst(ClaimTypes.Email)?.Value ?? user?.FindFirst("email")?.Value ?? "(anonymous)";
        var role = user?.FindFirst(ClaimTypes.Role)?.Value ?? user?.FindFirst("role")?.Value ?? "-";
        var statusCode = ctx.Response.StatusCode;
        var ipAddress = ctx.Connection.RemoteIpAddress?.ToString();

        // Fire-and-forget: queue audit log without blocking response, using our own
        // DI scope (and thus our own DbContext) so it survives past the request's lifetime.
        _ = Task.Run(async () =>
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<OscDbContext>();

                db.AuditLogs.Add(new AuditLog
                {
                    ActorEmail = email,
                    ActorRole = role,
                    Action = $"{method} {path}",
                    StatusCode = statusCode,
                    IpAddress = ipAddress,
                });
                await db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Auditing must never break the request path, but the failure must be visible.
                _logger.LogError(ex, "Failed to write audit log for {Method} {Path}", method, path);
            }
        });
    }
}
