using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

namespace OscApi.Services;

public interface IChatbotSessionService
{
    Task<List<ChatMessage>> GetSessionHistoryAsync(string sessionId);
    Task AddMessageAsync(string sessionId, string role, string content);
    Task ClearSessionAsync(string sessionId);
}

public class ChatbotSessionService : IChatbotSessionService
{
    private readonly IDistributedCache _cache;
    private readonly ILogger<ChatbotSessionService> _logger;
    private const int MaxHistoryLength = 50;
    private const int SessionExpirationMinutes = 120; // 2 hours

    public ChatbotSessionService(IDistributedCache cache, ILogger<ChatbotSessionService> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public async Task<List<ChatMessage>> GetSessionHistoryAsync(string sessionId)
    {
        if (string.IsNullOrEmpty(sessionId))
            return new List<ChatMessage>();

        var cacheKey = GetCacheKey(sessionId);
        var cached = await _cache.GetStringAsync(cacheKey);

        if (string.IsNullOrEmpty(cached))
            return new List<ChatMessage>();

        try
        {
            var history = JsonSerializer.Deserialize<List<ChatMessage>>(cached);
            return history ?? new List<ChatMessage>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to deserialize chat history for session {SessionId}", sessionId);
            return new List<ChatMessage>();
        }
    }

    public async Task AddMessageAsync(string sessionId, string role, string content)
    {
        if (string.IsNullOrEmpty(sessionId))
            return;

        var cacheKey = GetCacheKey(sessionId);
        var history = await GetSessionHistoryAsync(sessionId);

        // Add new message
        history.Add(new ChatMessage { Role = role, Content = content, Timestamp = DateTimeOffset.UtcNow });

        // Keep only recent messages to limit token usage
        if (history.Count > MaxHistoryLength)
        {
            history = history.Skip(history.Count - MaxHistoryLength).ToList();
        }

        try
        {
            var json = JsonSerializer.Serialize(history);
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(SessionExpirationMinutes)
            };
            await _cache.SetStringAsync(cacheKey, json, options);
            _logger.LogDebug("Added message to session {SessionId}, history length: {Count}", sessionId, history.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save chat history for session {SessionId}", sessionId);
        }
    }

    public async Task ClearSessionAsync(string sessionId)
    {
        if (string.IsNullOrEmpty(sessionId))
            return;

        var cacheKey = GetCacheKey(sessionId);
        await _cache.RemoveAsync(cacheKey);
        _logger.LogInformation("Cleared chat session {SessionId}", sessionId);
    }

    private static string GetCacheKey(string sessionId) => $"chatbot:session:{sessionId}";
}

public class ChatMessage
{
    public string? Role { get; set; }
    public string? Content { get; set; }
    public DateTimeOffset Timestamp { get; set; }
}
