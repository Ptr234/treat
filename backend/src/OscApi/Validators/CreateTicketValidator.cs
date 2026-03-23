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
    public CreateInvestorValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Phone).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Nationality).NotEmpty().MaximumLength(100);
        RuleFor(x => x.InvestorType).NotEmpty();
        RuleFor(x => x.Experience).NotEmpty();
        RuleFor(x => x.InvestmentGoal).NotEmpty();
        RuleFor(x => x.InvestmentAmount).NotEmpty();
        RuleFor(x => x.TimeHorizon).NotEmpty();
        RuleFor(x => x.RiskTolerance).NotEmpty();
        RuleFor(x => x.PrimarySector).NotEmpty();
        RuleFor(x => x.CapitalSource).NotEmpty();
        RuleFor(x => x.Timeframe).NotEmpty();
    }
}
