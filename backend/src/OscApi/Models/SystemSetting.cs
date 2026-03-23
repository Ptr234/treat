using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OscApi.Models;

[Table("system_settings")]
public class SystemSetting
{
    [Key, MaxLength(100)]
    public string Key { get; set; } = string.Empty;

    [Required, MaxLength(2000)]
    public string Value { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Description { get; set; }

    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    [MaxLength(100)]
    public string? UpdatedBy { get; set; }
}
