using FluentValidation;
using OscApi.Dtos.Tickets;

namespace OscApi.Validators;

public class CreateTicketValidator : AbstractValidator<CreateTicketRequest>
{
    private static readonly string[] ValidCategories =
        ["general_inquiry", "procedure_query", "application_support", "license_delay", "complaint", "vip"];

    private static readonly string[] ValidPriorities = ["low", "medium", "high", "critical"];

    public CreateTicketValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(5000);
        RuleFor(x => x.Category).NotEmpty().Must(c => ValidCategories.Contains(c))
            .WithMessage("Invalid category");
        RuleFor(x => x.Priority).Must(p => string.IsNullOrEmpty(p) || ValidPriorities.Contains(p))
            .WithMessage("Invalid priority");
        RuleFor(x => x.ContactEmail).NotEmpty().EmailAddress();
        RuleFor(x => x.ContactName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ContactPhone).MaximumLength(30);
        RuleFor(x => x.InvestorNationality).MaximumLength(100);
        RuleFor(x => x.Sector).MaximumLength(100);
        RuleFor(x => x.InvestmentSize).MaximumLength(50);
    }
}

public class ChatRequestValidator : AbstractValidator<OscApi.Dtos.Chatbot.ChatRequest>
{
    private static readonly string[] ValidLanguages = ["en", "fr", "ar", "zh", "sw"];

    public ChatRequestValidator()
    {
        RuleFor(x => x.Message).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Language).Must(l => ValidLanguages.Contains(l)).WithMessage("Invalid language");
    }
}

public class CreateInvestorValidator : AbstractValidator<OscApi.Dtos.Investors.CreateInvestorRequest>
{
    // Accepted option values (case-insensitive) — must stay in sync with the
    // onboarding wizard and the enum parsing in InvestorService.CreateAsync.
    private static readonly string[] InvestorTypes = ["individual", "institutional", "foreign"];
    private static readonly string[] Experiences = ["beginner", "intermediate", "advanced"];
    private static readonly string[] InvestmentGoals = ["growth", "income", "diversification", "strategic"];
    private static readonly string[] TimeHorizons = ["short-term", "medium-term", "long-term"];
    private static readonly string[] RiskTolerances = ["conservative", "moderate", "aggressive"];
    private static readonly string[] CapitalSources = ["savings", "loan", "partnership", "grant"];
    private static readonly string[] Timeframes = ["immediate", "3-months", "6-months", "1-year"];

    private static bool In(string? value, string[] allowed) =>
        !string.IsNullOrEmpty(value) && allowed.Contains(value.Trim(), StringComparer.OrdinalIgnoreCase);

    public CreateInvestorValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Phone).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Nationality).NotEmpty().MaximumLength(100);
        RuleFor(x => x.InvestorType).Must(v => In(v, InvestorTypes)).WithMessage("Invalid investor type");
        RuleFor(x => x.Experience).Must(v => In(v, Experiences)).WithMessage("Invalid experience level");
        RuleFor(x => x.InvestmentGoal).Must(v => In(v, InvestmentGoals)).WithMessage("Invalid investment goal");
        RuleFor(x => x.InvestmentAmount).NotEmpty();
        RuleFor(x => x.TimeHorizon).Must(v => In(v, TimeHorizons)).WithMessage("Invalid time horizon");
        RuleFor(x => x.RiskTolerance).Must(v => In(v, RiskTolerances)).WithMessage("Invalid risk tolerance");
        RuleFor(x => x.PrimarySector).NotEmpty();
        RuleFor(x => x.CapitalSource).Must(v => In(v, CapitalSources)).WithMessage("Invalid capital source");
        RuleFor(x => x.Timeframe).Must(v => In(v, Timeframes)).WithMessage("Invalid timeframe");
    }
}
