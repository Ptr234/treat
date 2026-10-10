using FluentValidation;
using OscApi.Common;
using OscApi.Dtos.Tickets;
using OscApi.Models;

namespace OscApi.Validators;

// Every limit mirrors the column width in Models/Ticket.cs / TicketMessage.cs,
// so an oversized value is a 400 here rather than a database error (500).

public class UpdateTicketValidator : AbstractValidator<UpdateTicketRequest>
{
    private static readonly string[] ValidStatuses =
        ["new", "assigned", "in_progress", "pending_external", "resolved", "closed"];
    private static readonly string[] ValidPriorities = ["low", "medium", "high", "critical"];

    private static string Canon(string s) => s.Replace("_", "").Replace("-", "").ToLowerInvariant();

    public UpdateTicketValidator()
    {
        RuleFor(x => x.Status)
            .Must(s => s is null || ValidStatuses.Any(v => Canon(v) == Canon(s)))
            .WithMessage("Invalid status");
        RuleFor(x => x.Priority)
            .Must(p => p is null || ValidPriorities.Contains(p.ToLowerInvariant()))
            .WithMessage("Invalid priority");
        // An officer is named by their staff-account email ("" unassigns); the
        // service checks the account is active and can see the ticket.
        RuleFor(x => x.Assignee)
            .MaximumLength(255)
            .EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Assignee))
            .WithMessage("Choose the assigned officer from the staff list");
        RuleFor(x => x.ResolutionNote).MaximumLength(5000);
        RuleFor(x => x.AssignedAgencyCode)
            .Must(c => c is null || AgencyDirectory.IsKnown(c))
            .WithMessage("Unknown agency code");
        RuleFor(x => x.SatisfactionRating).Null()
            .WithMessage("Satisfaction is rated by the investor, not by staff");
        RuleFor(x => x.SatisfactionComment).Null()
            .WithMessage("Satisfaction is rated by the investor, not by staff");
    }
}

public class StaffMessageValidator : AbstractValidator<StaffMessageRequest>
{
    public StaffMessageValidator() => RuleFor(x => x.Content).NotEmpty().MaximumLength(5000);
}

public class PublicCommentValidator : AbstractValidator<PublicCommentRequest>
{
    public PublicCommentValidator() => RuleFor(x => x.Content).NotEmpty().MaximumLength(5000);
}

public class PublicTicketUpdateValidator : AbstractValidator<PublicTicketUpdateRequest>
{
    public PublicTicketUpdateValidator()
    {
        RuleFor(x => x.SatisfactionRating).InclusiveBetween(1, 5).When(x => x.SatisfactionRating.HasValue);
        RuleFor(x => x.SatisfactionComment).MaximumLength(1000);
        RuleFor(x => x)
            .Must(x => x.IsEscalated == true || x.SatisfactionRating.HasValue)
            .WithMessage("Nothing to update");
    }
}

public class TicketAccessLinkValidator : AbstractValidator<TicketAccessLinkRequest>
{
    public TicketAccessLinkValidator() => RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(255);
}

public class TicketListQueryValidator : AbstractValidator<TicketListQuery>
{
    private static readonly string[] Sorts = ["newest", "oldest", "priority", "sla"];

    public TicketListQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, Pagination.MaxPageSize);
        RuleFor(x => x.Status)
            .Must(s => s is null || Enum.TryParse<TicketStatus>(s.Replace("_", ""), true, out _))
            .WithMessage("Invalid status");
        RuleFor(x => x.Priority)
            .Must(p => p is null || Enum.TryParse<TicketPriority>(p, true, out _))
            .WithMessage("Invalid priority");
        RuleFor(x => x.Q).MaximumLength(100);
        RuleFor(x => x.Sort).Must(s => s is null || Sorts.Contains(s)).WithMessage("Invalid sort");
    }
}
