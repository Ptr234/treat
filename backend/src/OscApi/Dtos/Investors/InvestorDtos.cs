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

public record InvestorResponse(
    string ReferenceNumber,
    string Name,
    string Email,
    string Status
);
