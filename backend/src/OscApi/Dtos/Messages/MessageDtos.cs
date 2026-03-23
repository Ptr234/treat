namespace OscApi.Dtos.Messages;

public record SendMessageRequest(
    string Channel,
    string Content,
    bool IsInternal = false
);
