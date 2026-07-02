using FluentValidation;
using OscApi.Dtos.Contact;

namespace OscApi.Validators;

public class CreateContactInquiryValidator : AbstractValidator<CreateContactInquiryRequest>
{
    public CreateContactInquiryValidator()
    {
        RuleFor(x => x.AgencyCode).NotEmpty().MaximumLength(20);
        RuleFor(x => x.AgencyName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Phone).NotEmpty().MaximumLength(30);
        RuleFor(x => x.ServiceType).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Subject).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Message).NotEmpty().MaximumLength(5000);
        RuleFor(x => x.Urgency).Must(u => new[] { "low", "normal", "urgent" }.Contains(u))
            .WithMessage("Urgency must be low, normal, or urgent");
    }
}

public class CreateAppointmentValidator : AbstractValidator<CreateAppointmentRequest>
{
    public CreateAppointmentValidator()
    {
        RuleFor(x => x.AgencyCode).NotEmpty().MaximumLength(20);
        RuleFor(x => x.AgencyName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Phone).NotEmpty().MaximumLength(30);
        RuleFor(x => x.ServiceType).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Purpose).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Duration).InclusiveBetween(15, 180);
        RuleFor(x => x.MeetingType).Must(m => new[] { "in-person", "virtual", "phone" }.Contains(m))
            .WithMessage("Meeting type must be in-person, virtual, or phone");
        RuleFor(x => x.PreferredDate).NotEmpty()
            .Must(d => DateOnly.TryParse(d, out _)).WithMessage("Invalid date format");
        RuleFor(x => x.PreferredTime).NotEmpty().MaximumLength(10);
        // Optional, but when present it is parsed with DateOnly.Parse — an
        // unparseable value must fail validation, not 500.
        RuleFor(x => x.AlternativeDate)
            .Must(d => string.IsNullOrEmpty(d) || DateOnly.TryParse(d, out _))
            .WithMessage("Invalid alternative date format");
        RuleFor(x => x.AlternativeTime).MaximumLength(10);
    }
}
