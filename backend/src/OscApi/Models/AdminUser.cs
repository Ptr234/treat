using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OscApi.Models;

[Table("admin_users")]
public class AdminUser
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? PasswordHash { get; set; }

    [MaxLength(50)]
    public string Role { get; set; } = "admin";

    /// <summary>For agency_officer accounts, the agency whose records they may access. Null for admin-level roles.</summary>
    [MaxLength(20)]
    public string? AgencyCode { get; set; }

    public bool IsActive { get; set; } = true;

    [MaxLength(200)]
    public string? PasswordResetToken { get; set; }

    public DateTimeOffset? PasswordResetExpiresAt { get; set; }

    /// <summary>Base32-encoded TOTP shared secret. Set at enrolment; cleared when MFA is disabled.</summary>
    [MaxLength(64)]
    public string? MfaSecret { get; set; }

    /// <summary>True once the admin has verified a code against <see cref="MfaSecret"/>. Login then requires a TOTP code.</summary>
    public bool MfaEnabled { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
