using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OscApi.Models;

[Table("ticket_messages")]
public class TicketMessage : Entity
{
    public Guid TicketId { get; set; }

    [Required, MaxLength(5000)]
    public string Content { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string AuthorName { get; set; } = string.Empty;

    public AuthorRole AuthorRole { get; set; }

    [MaxLength(255)]
    public string? AuthorEmail { get; set; }

    public bool IsInternal { get; set; }

    public DateTimeOffset SentAt { get; set; } = DateTimeOffset.UtcNow;

    [ForeignKey(nameof(TicketId))]
    public Ticket Ticket { get; set; } = null!;
}
