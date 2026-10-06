using FluentValidation;
using OscApi.Dtos.BusinessRegistrations;

namespace OscApi.Validators;

public class OwnerInfoValidator : AbstractValidator<OwnerInfo>
{
    public OwnerInfoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Nationality).NotEmpty().MaximumLength(100);
        RuleFor(x => x.IdNumber).MaximumLength(50);
        RuleFor(x => x.Percentage).NotEmpty()
            .Must(p => decimal.TryParse(p, out var v) && v > 0 && v <= 100)
            .WithMessage("Percentage must be a number between 0 and 100");
    }
}

public class CreateBusinessRegistrationValidator : AbstractValidator<CreateBusinessRegistrationRequest>
{
    public CreateBusinessRegistrationValidator()
    {
        RuleFor(x => x.BusinessName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.BusinessType).NotEmpty().MaximumLength(100);
        RuleFor(x => x.BusinessStructure).NotEmpty().MaximumLength(100);
        RuleFor(x => x.BusinessDescription).MaximumLength(2000);
        RuleFor(x => x.Sector).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Location).NotEmpty().MaximumLength(200);

        RuleFor(x => x.Owners).NotEmpty().WithMessage("At least one owner is required");
        RuleForEach(x => x.Owners).SetValidator(new OwnerInfoValidator());
        // Guarded by When() so a malformed percentage (already flagged per-owner
        // above) doesn't also trip this and produce a confusing second error.
        RuleFor(x => x.Owners)
            .Must(owners => Math.Abs(owners.Sum(o => decimal.Parse(o.Percentage)) - 100m) <= 0.01m)
            .WithMessage("Ownership percentages must sum to 100%")
            .When(x => x.Owners.Count > 0 && x.Owners.All(o => decimal.TryParse(o.Percentage, out _)));

        RuleFor(x => x.InitialCapital).MaximumLength(50);
        RuleFor(x => x.ProjectedTurnover).MaximumLength(50);
        RuleFor(x => x.ContactName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ContactEmail).NotEmpty().EmailAddress().MaximumLength(255);
        RuleFor(x => x.ContactPhone).MaximumLength(30);
    }
}

public class UpdateBusinessRegistrationValidator : AbstractValidator<UpdateBusinessRegistrationRequest>
{
    public UpdateBusinessRegistrationValidator()
    {
        RuleFor(x => x.ReviewNotes).MaximumLength(1000);
        RuleFor(x => x.RejectionReason).MaximumLength(500);
    }
}
