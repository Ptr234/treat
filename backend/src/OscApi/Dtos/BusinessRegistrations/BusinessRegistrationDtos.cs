namespace OscApi.Dtos.BusinessRegistrations;

public record OwnerInfo(
    string Name,
    string Nationality,
    string? IdNumber,
    string Percentage
);

public record CreateBusinessRegistrationRequest(
    string BusinessName,
    string BusinessType,
    string BusinessStructure,
    string? BusinessDescription,
    string Sector,
    string Location,
    List<OwnerInfo> Owners,
    string? InitialCapital,
    string? ProjectedTurnover,
    string ContactName,
    string ContactEmail,
    string? ContactPhone
);

/// <summary>Staff review action. Only the fields relevant to the requested transition need be set.</summary>
public record UpdateBusinessRegistrationRequest(
    string? Status,
    string? ReviewNotes,
    string? RejectionReason
);

public record NameCheckResponse(
    bool Available,
    string Name,
    string? ConflictingReferenceNumber
);

public record BusinessRegistrationResponse(
    string ReferenceNumber,
    string BusinessName,
    string Status,
    DateTimeOffset CreatedAt
);

public record BusinessRegistrationDetailResponse(
    string ReferenceNumber,
    string BusinessName,
    string BusinessType,
    string BusinessStructure,
    string? BusinessDescription,
    string Sector,
    string Location,
    List<OwnerInfo> Owners,
    string? InitialCapital,
    string? ProjectedTurnover,
    string ContactName,
    string ContactEmail,
    string? ContactPhone,
    string Status,
    string AssignedAgencyCode,
    string? ReviewNotes,
    string? RejectionReason,
    DateTimeOffset? NameDecisionAt,
    string? CertificateNumber,
    DateTimeOffset? CertificateIssuedAt,
    DateTimeOffset CreatedAt,
    // Hours from submission to a terminal state (certificate issued or rejected),
    // or hours-so-far while still in progress. Distinct from a ticket's SLA
    // response deadline — this is time-to-completion, not time-to-first-reply.
    double ProcessingHours
);

public record CertificateResponse(
    string ReferenceNumber,
    string CertificateNumber,
    string BusinessName,
    string BusinessType,
    string BusinessStructure,
    string Location,
    List<OwnerInfo> Owners,
    DateTimeOffset IssuedAt
);
