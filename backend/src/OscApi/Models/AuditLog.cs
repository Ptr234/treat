using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OscApi.Models;

/// <summary>
/// Append-only record of a privileged / state-changing action, for accountability.
/// Rows are never updated or deleted by the application.
/// </summary>
[Table("audit_logs")]
public class AuditLog
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>Login email of the actor, or "(anonymous)" for unauthenticated actions.</summary>
    [MaxLength(255)]
    public string ActorEmail { get; set; } = "(anonymous)";

    [MaxLength(50)]
    public string ActorRole { get; set; } = "-";

    /// <summary>Machine action key, e.g. "POST /api/tickets" or "auth.login".</summary>
    [Required, MaxLength(160)]
    public string Action { get; set; } = string.Empty;

    /// <summary>Optional human-readable detail or affected reference.</summary>
    [MaxLength(500)]
    public string? Details { get; set; }

    public int StatusCode { get; set; }

    [MaxLength(45)]
    public string? IpAddress { get; set; }
}
