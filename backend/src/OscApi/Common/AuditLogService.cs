using OscApi.Data;
using OscApi.Models;

namespace OscApi.Common;

/// <summary>
/// Shared writer for <see cref="AuditLog"/>, usable from the service layer (not
/// just controllers, which already have their own inline HttpContext-based
/// helper in AuthController) — so accountability-sensitive service methods like
/// BusinessRegistrationService's staff decisions can record who acted without
/// duplicating the insert-and-swallow-failures logic per call site.
/// </summary>
public interface IAuditLogService
{
    Task LogAsync(string actorEmail, string actorRole, string action, string? details, int statusCode, string? ipAddress);
}

public class AuditLogService : IAuditLogService
{
    private readonly OscDbContext _db;

    public AuditLogService(OscDbContext db)
    {
        _db = db;
    }

    /// <summary>Best-effort: a logging failure must never break the action it's recording.</summary>
    public async Task LogAsync(string actorEmail, string actorRole, string action, string? details, int statusCode, string? ipAddress)
    {
        try
        {
            _db.AuditLogs.Add(new AuditLog
            {
                ActorEmail = actorEmail,
                ActorRole = actorRole,
                Action = action,
                Details = details,
                StatusCode = statusCode,
                IpAddress = ipAddress,
            });
            await _db.SaveChangesAsync();
        }
        catch { /* audit is best-effort */ }
    }
}
