using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OscApi.Models;

[Table("contact_inquiries")]
public class ContactInquiry : AuditableEntity
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

    [Required, MaxLength(200)]
    public string Subject { get; set; } = string.Empty;

    [Required, MaxLength(5000)]
    public string Message { get; set; } = string.Empty;

    public ContactUrgency Urgency { get; set; } = ContactUrgency.Normal;

    public ContactInquiryStatus Status { get; set; } = ContactInquiryStatus.Pending;
}

public enum ContactUrgency { Low, Normal, Urgent }
public enum ContactInquiryStatus { Pending, InProgress, Responded, Closed }
