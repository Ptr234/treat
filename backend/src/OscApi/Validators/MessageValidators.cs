using FluentValidation;
using OscApi.Dtos.Messages;

namespace OscApi.Validators;

public class SendMessageValidator : AbstractValidator<SendMessageRequest>
{
    public const int MaxAttachments = 3;

    // Attachments are uploaded to Sanity by the frontend, so only Sanity's CDN
    // is accepted. Rendered as links in other officers' browsers, an arbitrary
    // URL (javascript:, a phishing host) must never be stored.
    private const string AllowedHost = "cdn.sanity.io";

    public SendMessageValidator()
    {
        RuleFor(x => x.Attachments)
            .Must(a => a is null || a.Count <= MaxAttachments)
            .WithMessage($"A message can have at most {MaxAttachments} attachments");

        RuleForEach(x => x.Attachments).ChildRules(a =>
        {
            a.RuleFor(x => x.Url).NotEmpty().MaximumLength(1000)
                .Must(IsSanityCdnUrl).WithMessage("Attachment URL must be an https://cdn.sanity.io/ file URL");
            a.RuleFor(x => x.OriginalFilename).NotEmpty().MaximumLength(255);
        });
    }

    private static bool IsSanityCdnUrl(string? url) =>
        Uri.TryCreate(url, UriKind.Absolute, out var uri)
        && uri.Scheme == Uri.UriSchemeHttps
        && uri.Host.Equals(AllowedHost, StringComparison.OrdinalIgnoreCase);
}
