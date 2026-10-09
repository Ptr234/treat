namespace OscApi.Dtos.Messages;

/// <summary>A file attached to an agency message. The file itself is uploaded to
/// Sanity by the frontend; the message stores only its CDN URL and display name.</summary>
public record MessageAttachment(string Url, string OriginalFilename);

public record SendMessageRequest(
    string Channel,
    string Content,
    string? SenderAgencyCode = null,
    bool IsInternal = false,
    List<MessageAttachment>? Attachments = null
);
