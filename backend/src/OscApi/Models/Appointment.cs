using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OscApi.Models;

[Table("appointments")]
public class Appointment : AuditableEntity
{
    [Required, MaxLength(20)]
    public string ReferenceNumber { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string AgencyCode { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string AgencyName { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string ContactName { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string ContactEmail { get; set; } = string.Empty;

    [Required, MaxLength(30)]
    public string ContactPhone { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Company { get; set; }

    [Required, MaxLength(200)]
    public string ServiceType { get; set; } = string.Empty;

    [Required, MaxLength(2000)]
    public string Purpose { get; set; } = string.Empty;

    public int DurationMinutes { get; set; } = 30;

    public MeetingType MeetingType { get; set; } = MeetingType.InPerson;

    [Required]
    public DateOnly PreferredDate { get; set; }

    [Required, MaxLength(10)]
    public string PreferredTime { get; set; } = string.Empty;

    public DateOnly? AlternativeDate { get; set; }

    [MaxLength(10)]
    public string? AlternativeTime { get; set; }

    [MaxLength(2000)]
    public string? SpecialRequirements { get; set; }

    public AppointmentStatus Status { get; set; } = AppointmentStatus.Requested;
}

public enum MeetingType { InPerson, Virtual, Phone }
public enum AppointmentStatus { Requested, Confirmed, Rescheduled, Cancelled, Completed }
