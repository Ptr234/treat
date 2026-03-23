using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OscApi.Models;

[Table("tickets")]
public class Ticket
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

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

    [MaxLength(100)]
    public string? Assignee { get; set; }

    [MaxLength(20)]
    public string? AssignedAgencyCode { get; set; }

    public int? SlaDeadlineHours { get; set; }
    public DateTimeOffset? SlaDeadlineAt { get; set; }

    public int? SatisfactionRating { get; set; }

    [MaxLength(1000)]
    public string? SatisfactionComment { get; set; }

    public bool IsEscalated { get; set; }
    public DateTimeOffset? EscalatedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? ResolvedAt { get; set; }
    public DateTimeOffset? ClosedAt { get; set; }

    public ICollection<TicketMessage> Messages { get; set; } = new List<TicketMessage>();
    public ICollection<TicketDocument> Documents { get; set; } = new List<TicketDocument>();
}
