using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OscApi.Models;

[Table("ticket_documents")]
public class TicketDocument : Entity
{
    public Guid TicketId { get; set; }

    [Required, MaxLength(255)]
    public string FileName { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string MimeType { get; set; } = string.Empty;

    public long FileSize { get; set; }

    [Required]
    public string StorageUrl { get; set; } = string.Empty;

    public DateTimeOffset UploadedAt { get; set; } = DateTimeOffset.UtcNow;

    [ForeignKey(nameof(TicketId))]
    public Ticket Ticket { get; set; } = null!;
}
