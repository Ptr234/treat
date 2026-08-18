using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.Chatbot;
using OscApi.Dtos.Common;
using OscApi.Models;
using OscApi.Services;

namespace OscApi.Controllers;

[ApiController]
[Route("api/chatbot")]
public class ChatbotController : ControllerBase
{
    private readonly OscDbContext _db;
    private readonly IGroqClient _groq;
    private readonly IChatbotSessionService _sessions;
    private readonly ILogger<ChatbotController> _logger;

    public ChatbotController(OscDbContext db, IGroqClient groq, IChatbotSessionService sessions, ILogger<ChatbotController> logger)
    {
        _db = db;
        _groq = groq;
        _sessions = sessions;
        _logger = logger;
    }

    [HttpPost]
    [EnableRateLimiting("chatbot")]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.SessionId))
            return BadRequest(new ApiResponse(false, "sessionId is required"));

        var systemPrompt = BuildSystemPrompt(request.Language);
        var messages = new List<GroqClient.ChatMessage>
        {
            new("system", systemPrompt)
        };

        // Get conversation history from Redis (server-side storage)
        var sessionHistory = await _sessions.GetSessionHistoryAsync(request.SessionId);

        // Add recent messages (limit to 10 to reduce token usage)
        foreach (var entry in sessionHistory.TakeLast(10))
        {
            if (string.IsNullOrWhiteSpace(entry.Content)) continue;
            messages.Add(new GroqClient.ChatMessage(entry.Role ?? "user", Truncate(entry.Content, 2000)!));
        }

        messages.Add(new GroqClient.ChatMessage("user", request.Message));

        if (!_groq.IsConfigured)
        {
            return StatusCode(503, new { success = false, error = "Chatbot AI is not configured", code = "NOT_CONFIGURED" });
        }

        try
        {
            var response = await _groq.ChatAsync(messages);

            // Parse sentiment tag if present (e.g., [SENTIMENT:positive])
            string? sentiment = null;
            var sentimentMatch = System.Text.RegularExpressions.Regex.Match(response, @"\[SENTIMENT:(\w+)\]");
            if (sentimentMatch.Success)
            {
                var raw = sentimentMatch.Groups[1].Value.ToLowerInvariant();
                if (raw is "positive" or "neutral" or "negative") sentiment = raw;
                response = response.Replace(sentimentMatch.Value, "").Trim();
            }

            // Store messages in Redis session (non-blocking)
            _ = Task.Run(async () =>
            {
                await _sessions.AddMessageAsync(request.SessionId, "user", request.Message);
                await _sessions.AddMessageAsync(request.SessionId, "assistant", response);
            });

            return Ok(new ApiResponse<ChatResponse>(true, new ChatResponse(
                response, request.Language, sentiment, "ai")));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Groq API call failed");
            return StatusCode(502, new ApiResponse(false, "Chatbot temporarily unavailable"));
        }
    }

    [HttpPost("log")]
    [EnableRateLimiting("chatbot")]
    public async Task<IActionResult> LogChat([FromBody] ChatLogRequest request)
    {
        // Parse enums defensively: language/tier/sentiment arrive from the client
        // (and sentiment ultimately from the LLM), so an unexpected value must not
        // 500 and silently drop the enquiry.
        var language = Enum.TryParse<ChatLanguage>(request.Language, true, out var lang) ? lang : ChatLanguage.En;
        var tier = Enum.TryParse<ChatTier>(request.Tier, true, out var t) ? t : ChatTier.Ai;
        ChatSentiment? sentiment =
            !string.IsNullOrEmpty(request.Sentiment) && Enum.TryParse<ChatSentiment>(request.Sentiment, true, out var s)
                ? s : null;

        if (string.IsNullOrWhiteSpace(request.SessionId) ||
            string.IsNullOrWhiteSpace(request.UserMessage) ||
            string.IsNullOrWhiteSpace(request.BotResponse))
            return BadRequest(new ApiResponse(false, "sessionId, userMessage and botResponse are required"));

        // Clamp free-text fields to the column widths so an oversized payload is
        // stored truncated instead of failing the insert with a 500.
        var enquiry = new ChatEnquiry
        {
            SessionId = Truncate(request.SessionId, 100)!,
            UserName = Truncate(request.UserName, 100),
            UserEmail = Truncate(request.UserEmail, 255),
            UserPhone = Truncate(request.UserPhone, 30),
            UserLocation = Truncate(request.UserLocation, 200),
            UserMessage = Truncate(request.UserMessage, 2000)!,
            BotResponse = Truncate(request.BotResponse, 10000)!,
            Language = language,
            Sentiment = sentiment,
            Tier = tier,
        };

        _db.ChatEnquiries.Add(enquiry);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse(true));
    }

    [HttpPost("clear")]
    [EnableRateLimiting("chatbot")]
    public async Task<IActionResult> ClearSession([FromBody] ClearSessionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.SessionId))
            return BadRequest(new ApiResponse(false, "sessionId is required"));

        await _sessions.ClearSessionAsync(request.SessionId);
        return Ok(new ApiResponse(true));
    }

    private static string? Truncate(string? value, int max) =>
        value is null ? null : (value.Length <= max ? value : value[..max]);

    private static string BuildSystemPrompt(string language)
    {
        var langInstruction = language switch
        {
            "fr" => "Respond in French.",
            "ar" => "Respond in Arabic.",
            "zh" => "Respond in Chinese (Simplified).",
            "sw" => "Respond in Swahili.",
            _ => "Respond in English."
        };

        return $"""
            You are the Uganda Investment Authority (UIA) One Stop Centre Digital Assistant.
            You help investors navigate business registration, licensing, tax obligations,
            and investment opportunities in Uganda.

            {langInstruction}

            Key facts:
            - UIA is the primary agency for investment facilitation in Uganda
            - Business registration is handled by URSB (Uganda Registration Services Bureau)
            - Tax registration is handled by URA (Uganda Revenue Authority)
            - Immigration matters are handled by DCIC (Directorate of Citizenship and Immigration Control)
            - Environmental clearance by NEMA (National Environment Management Authority)
            - Standards certification by UNBS (Uganda National Bureau of Standards)

            Always be helpful, professional, and accurate. If unsure, recommend contacting
            the relevant agency directly.

            Formatting: reply in plain text only. Do NOT use any Markdown — no asterisks
            for bold or italics (** or *), no backticks, no headings, and no markdown link
            syntax. Write in plain sentences and paragraphs; if you need a list, use a
            simple hyphen at the start of the line.

            End each response with [SENTIMENT:positive],
            [SENTIMENT:neutral], or [SENTIMENT:negative] based on the user's apparent mood.
            """;
    }
}
