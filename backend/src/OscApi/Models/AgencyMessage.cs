using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OscApi.Models;

[Table("agency_messages")]
public class AgencyMessage
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(100)]
    public string Channel { get; set; } = string.Empty;

    [Required, MaxLength(5000)]
    public string Content { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string SenderName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? SenderAgencyCode { get; set; }

    [MaxLength(255)]
    public string? SenderEmail { get; set; }

    public bool IsInternal { get; set; }

    public DateTimeOffset SentAt { get; set; } = DateTimeOffset.UtcNow;
}
