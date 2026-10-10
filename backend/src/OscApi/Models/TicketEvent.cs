using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OscApi.Models;

public enum TicketEventType
{
    Created,
    StatusChanged,
    PriorityChanged,
    AgencyChanged,
    AssigneeChanged,
    Escalated,
    SlaBreached,
}

/// <summary>
/// Append-only history of who changed a ticket's ownership or lifecycle, and
/// when — so a transfer between agencies or officers can always be traced.
/// Staff-only: never returned to the public side.
/// </summary>
[Table("ticket_events")]
public class TicketEvent : Entity
{
    public Guid TicketId { get; set; }

    public TicketEventType Type { get; set; }

    [MaxLength(100)]
    public string? FromValue { get; set; }

    [MaxLength(100)]
    public string? ToValue { get; set; }

    /// <summary>Who made the change: a staff name, "Investor", or "System" (SLA monitor).</summary>
    [Required, MaxLength(100)]
    public string ActorName { get; set; } = "System";

    [MaxLength(255)]
    public string? ActorEmail { get; set; }

    public DateTimeOffset OccurredAt { get; set; } = DateTimeOffset.UtcNow;

    [ForeignKey(nameof(TicketId))]
    public Ticket Ticket { get; set; } = null!;
}
