using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OscApi.Models;

/// <summary>
/// A business registration filed with URSB. This is a tracked transaction with
/// its own reference number, status lifecycle, and (on completion) a certificate
/// — not a support ticket. See <see cref="BusinessRegistrationStatus"/> for the
/// state machine.
/// </summary>
[Table("business_registrations")]
public class BusinessRegistration : AuditableEntity
{
    [Required, MaxLength(20)]
    public string ReferenceNumber { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string BusinessName { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string BusinessType { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string BusinessStructure { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? BusinessDescription { get; set; }

    [Required, MaxLength(100)]
    public string Sector { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Location { get; set; } = string.Empty;

    /// <summary>Serialized JSON array of owners: [{name, nationality, idNumber, percentage}].</summary>
    [Required]
    [Column(TypeName = "text")]
    public string OwnersJson { get; set; } = "[]";

    [MaxLength(50)]
    public string? InitialCapital { get; set; }

    [MaxLength(50)]
    public string? ProjectedTurnover { get; set; }

    // The applicant's real contact details — the whole point of this entity
    // existing separately from Ticket is that these are never a placeholder.
    [Required, MaxLength(100)]
    public string ContactName { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string ContactEmail { get; set; } = string.Empty;

    [MaxLength(30)]
    public string? ContactPhone { get; set; }

    public BusinessRegistrationStatus Status { get; set; } = BusinessRegistrationStatus.Received;

    /// <summary>Always "URSB" today; kept as a field (not a constant) so registration
    /// could be extended to other registrars without a schema change.</summary>
    [Required, MaxLength(20)]
    public string AssignedAgencyCode { get; set; } = "URSB";

    [MaxLength(1000)]
    public string? ReviewNotes { get; set; }

    [MaxLength(500)]
    public string? RejectionReason { get; set; }

    public DateTimeOffset? NameDecisionAt { get; set; }

    [MaxLength(30)]
    public string? CertificateNumber { get; set; }

    public DateTimeOffset? CertificateIssuedAt { get; set; }
}
