namespace OscApi.Models;

public enum TicketCategory
{
    GeneralInquiry,
    ProcedureQuery,
    ApplicationSupport,
    LicenseDelay,
    Complaint,
    Vip
}

public enum TicketPriority
{
    Low,
    Medium,
    High,
    Critical
}

public enum TicketStatus
{
    New,
    Assigned,
    InProgress,
    PendingExternal,
    Resolved,
    Closed
}

public enum AuthorRole
{
    Investor,
    Officer,
    System
}

public enum ChatLanguage
{
    En,
    Fr,
    Ar,
    Zh,
    Sw
}

public enum ChatSentiment
{
    Positive,
    Neutral,
    Negative
}

public enum ChatTier
{
    Ai,
    Kb,
    Suggestions,
    Escalation
}

public enum InvestorType
{
    Individual,
    Institutional,
    Foreign
}

public enum InvestorExperience
{
    Beginner,
    Intermediate,
    Advanced
}

public enum InvestmentGoal
{
    Growth,
    Income,
    Diversification,
    Strategic
}

public enum TimeHorizon
{
    ShortTerm,
    MediumTerm,
    LongTerm
}

public enum RiskTolerance
{
    Conservative,
    Moderate,
    Aggressive
}

public enum CapitalSource
{
    Savings,
    Loan,
    Partnership,
    Grant
}

public enum InvestorTimeframe
{
    Immediate,
    ThreeMonths,
    SixMonths,
    OneYear
}

public enum InvestorStatus
{
    New,
    Contacted,
    Active,
    Inactive
}

/// <summary>
/// A business registration's own lifecycle — distinct from <see cref="TicketStatus"/>
/// so a registration is a tracked transaction with its own state, not a support
/// ticket wearing a registration form's clothing.
/// </summary>
public enum BusinessRegistrationStatus
{
    Received,
    UnderReview,
    NameApproved,
    NameRejected,
    CertificateIssued,
    Rejected
}
