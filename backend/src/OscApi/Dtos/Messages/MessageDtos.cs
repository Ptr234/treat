namespace OscApi.Dtos.Messages;

public record SendMessageRequest(
    string Channel,
    string Content,
    string? SenderAgencyCode = null,
    bool IsInternal = false
);
