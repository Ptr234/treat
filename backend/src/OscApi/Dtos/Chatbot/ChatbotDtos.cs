namespace OscApi.Dtos.Chatbot;

public record ChatRequest(
    string Message,
    List<ChatHistoryEntry> History,
    string Language = "en",
    string? SessionId = null
);

public record ChatHistoryEntry(string Role, string Content);

public record ChatLogRequest(
    string SessionId,
    string? UserName,
    string? UserEmail,
    string? UserPhone,
    string? UserLocation,
    string UserMessage,
    string BotResponse,
    string Language,
    string? Sentiment,
    string Tier
);

public record ChatResponse(string Response, string Language, string? Sentiment, string Tier);
