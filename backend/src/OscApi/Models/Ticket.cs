using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OscApi.Models;

[Table("tickets")]
public class Ticket : AuditableEntity
{
    [Required, MaxLength(20)]
    public string ReferenceNumber { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(5000)]
    public string Description { get; set; } = string.Empty;

    public TicketCategory Category { get; set; }
    public TicketPriority Priority { get; set; } = TicketPriority.Medium;
    public TicketStatus Status { get; set; } = TicketStatus.New;

    [Required, MaxLength(100)]
    public string ContactName { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string ContactEmail { get; set; } = string.Empty;

    [MaxLength(30)]
    public string? ContactPhone { get; set; }

    [MaxLength(100)]
    public string? InvestorNationality { get; set; }

    [MaxLength(100)]
    public string? Sector { get; set; }

    [MaxLength(50)]
    public string? InvestmentSize { get; set; }

    /// <summary>Display name of the assigned officer (denormalised from <see cref="AssigneeUserId"/>).</summary>
    [MaxLength(100)]
    public string? Assignee { get; set; }

    /// <summary>The <c>admin_users</c> account the ticket is assigned to — always an active staff account.</summary>
    public Guid? AssigneeUserId { get; set; }

    [MaxLength(20)]
    public string? AssignedAgencyCode { get; set; }

    public int? SlaDeadlineHours { get; set; }
    public DateTimeOffset? SlaDeadlineAt { get; set; }

    /// <summary>When the SLA monitor first found the deadline passed with the ticket open (cleared if a priority change moves the deadline back into the future).</summary>
    public DateTimeOffset? SlaBreachedAt { get; set; }

    /// <summary>When an officer was first named on the ticket — the end of triage.</summary>
    public DateTimeOffset? AssignedAt { get; set; }

    /// <summary>When staff first replied publicly to the filer.</summary>
    public DateTimeOffset? FirstResponseAt { get; set; }

    public int? SatisfactionRating { get; set; }

    [MaxLength(1000)]
    public string? SatisfactionComment { get; set; }

    /// <summary>Unguessable secret in the filer's tracking link — the public's proof
    /// of ownership (see <c>Common.TicketAccess</c>). Never returned to staff views.</summary>
    [Required, MaxLength(64)]
    public string AccessToken { get; set; } = string.Empty;

    public bool IsEscalated { get; set; }
    public DateTimeOffset? EscalatedAt { get; set; }

    public DateTimeOffset? ResolvedAt { get; set; }
    public DateTimeOffset? ClosedAt { get; set; }

    public ICollection<TicketMessage> Messages { get; set; } = new List<TicketMessage>();
    public ICollection<TicketDocument> Documents { get; set; } = new List<TicketDocument>();
    public ICollection<TicketEvent> Events { get; set; } = new List<TicketEvent>();
}
