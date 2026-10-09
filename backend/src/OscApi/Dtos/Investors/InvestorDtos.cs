namespace OscApi.Dtos.Investors;

public record CreateInvestorRequest(
    string Name,
    string Email,
    string Phone,
    string Nationality,
    string? CompanyName,
    string? Position,
    string InvestorType,
    string Experience,
    string InvestmentGoal,
    string InvestmentAmount,
    string TimeHorizon,
    string RiskTolerance,
    string PrimarySector,
    List<string>? SecondarySectors,
    string? SpecificInterests,
    string CapitalSource,
    string Timeframe,
    List<string>? SupportNeeded
);

public record UpdateInvestorRequest(
    string? Name,
    string? Phone,
    string? CompanyName,
    string? Position,
    string? InvestmentAmount,
    string? PrimarySector,
    List<string>? SecondarySectors,
    string? SpecificInterests,
    List<string>? SupportNeeded,
    string? Status
);

/// <summary>Result of the public onboarding submission. <c>ReferenceNumber</c> is
/// null when a profile already existed (it is emailed to the address on file).</summary>
public record CreateInvestorResponse(string? ReferenceNumber, bool Existing);

public record InvestorResponse(
    string ReferenceNumber,
    string Name,
    string Email,
    string Status
);

public record InvestorDetailResponse(
    string ReferenceNumber,
    string Name,
    string Email,
    string Phone,
    string Nationality,
    string? CompanyName,
    string? Position,
    string InvestorType,
    string Experience,
    string InvestmentGoal,
    string InvestmentAmount,
    string TimeHorizon,
    string RiskTolerance,
    string PrimarySector,
    string[] SecondarySectors,
    string? SpecificInterests,
    string CapitalSource,
    string Timeframe,
    string[] SupportNeeded,
    string Status,
    DateTimeOffset CreatedAt,
    // Reference of a completed URSB business registration matched by email +
    // company name at creation time, or null if none was found.
    string? LinkedBusinessRegistrationRef
);
