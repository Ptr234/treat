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
