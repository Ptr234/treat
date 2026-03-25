using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OscApi.Models;

[Table("analytics_events")]
public class AnalyticsEvent
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(50)]
    public string EventType { get; set; } = string.Empty; // tool_usage, download, search

    [Required, MaxLength(100)]
    public string EventName { get; set; } = string.Empty; // tax-calculator, roi-calculator, business-guide.pdf

    [MaxLength(500)]
    public string? Metadata { get; set; } // JSON: extra context (search query, inputs, etc.)

    [MaxLength(100)]
    public string? UserEmail { get; set; }

    [MaxLength(45)]
    public string? IpAddress { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
