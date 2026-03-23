namespace OscApi.Dtos.Contact;

public record CreateContactInquiryRequest(
    string AgencyCode,
    string AgencyName,
    string Name,
    string Email,
    string Phone,
    string? Company,
    string ServiceType,
    string Subject,
    string Message,
    string Urgency = "normal"
);

public record CreateAppointmentRequest(
    string AgencyCode,
    string AgencyName,
    string Name,
    string Email,
    string Phone,
    string? Company,
    string ServiceType,
    string Purpose,
    int Duration,
    string MeetingType,
    string PreferredDate,
    string PreferredTime,
    string? AlternativeDate,
    string? AlternativeTime,
    string? SpecialRequirements
);

public record ContactInquiryResponse(
    string ReferenceNumber,
    string AgencyCode,
    string ContactName,
    string Status,
    DateTimeOffset CreatedAt
);

public record AppointmentResponse(
    string ReferenceNumber,
    string AgencyCode,
    string ContactName,
    string PreferredDate,
    string PreferredTime,
    string Status,
    DateTimeOffset CreatedAt
);
