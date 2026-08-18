using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OscApi.Models;

/// <summary>
/// Persistent account for a regular (non-admin) end user / investor.
/// Created via email+password signup or upserted on Google sign-in.
/// Admins continue to live in <see cref="AdminUser"/>.
/// </summary>
[Table("users")]
public class User : AuditableEntity
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    /// <summary>Null for Google-only accounts (no password set).</summary>
    [MaxLength(500)]
    public string? PasswordHash { get; set; }

    [MaxLength(50)]
    public string Role { get; set; } = "user";

    /// <summary>Google subject (sub) claim, when the account is linked to Google.</summary>
    [MaxLength(255)]
    public string? GoogleSubject { get; set; }

    [MaxLength(500)]
    public string? Picture { get; set; }

    public bool IsActive { get; set; } = true;

    [MaxLength(200)]
    public string? PasswordResetToken { get; set; }

    public DateTimeOffset? PasswordResetExpiresAt { get; set; }
}
