using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.Chatbot;
using OscApi.Dtos.Common;
using OscApi.Models;
using OscApi.Services;

namespace OscApi.Controllers;

/// <summary>
/// The investor assistant. Signed-in accounts only: every call costs an LLM
/// request, and each conversation is tied to the account that holds it.
/// </summary>
[ApiController]
[Route("api/v1/chatbot")]
[Authorize]
public class ChatbotController : ControllerBase
{
    private readonly OscDbContext _db;
    private readonly IGroqClient _groq;
    private readonly IChatbotSessionService _sessions;
    private readonly ILogger<ChatbotController> _logger;
    private readonly IReadOnlyList<string> _verifiedFacts;

    public ChatbotController(OscDbContext db, IGroqClient groq, IChatbotSessionService sessions, ILogger<ChatbotController> logger,
        IConfiguration config)
    {
        // Figures confirmed with the agencies (Chatbot:VerifiedFacts in config) —
        // the only amounts the assistant may quote. Empty by default.
        _verifiedFacts = config.GetSection("Chatbot:VerifiedFacts").Get<string[]>()?
            .Where(f => !string.IsNullOrWhiteSpace(f)).Select(f => f.Trim()).ToArray() ?? [];
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
            return Problem(detail: "sessionId is required", statusCode: StatusCodes.Status400BadRequest);

        var systemPrompt = BuildSystemPrompt(request.Language, _verifiedFacts);
        var messages = new List<GroqClient.ChatMessage>
        {
            new("system", systemPrompt)
        };

        // Get conversation history from Redis (server-side storage)
        var sessionKey = SessionKey(request.SessionId);
        var sessionHistory = await _sessions.GetSessionHistoryAsync(sessionKey);

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
                await _sessions.AddMessageAsync(sessionKey, "user", request.Message);
                await _sessions.AddMessageAsync(sessionKey, "assistant", response);
            });

            return Ok(new ApiResponse<ChatResponse>(true, new ChatResponse(
                response, request.Language, sentiment, "ai")));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Groq API call failed");
            return Problem(detail: "Chatbot temporarily unavailable", statusCode: 502);
        }
    }

    [HttpPost("log")]
    [EnableRateLimiting("chatbot")]
    public async Task<IActionResult> LogChat([FromBody] ChatLogRequest request)
    {
        // The enquiry is filed under the signed-in account, never a name or
        // address typed into the client.
        request = request with
        {
            UserEmail = AccountEmail() ?? request.UserEmail,
            UserName = User.FindFirst("name")?.Value ?? request.UserName,
        };

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
            return Problem(detail: "sessionId, userMessage and botResponse are required", statusCode: StatusCodes.Status400BadRequest);

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
            return Problem(detail: "sessionId is required", statusCode: StatusCodes.Status400BadRequest);

        await _sessions.ClearSessionAsync(SessionKey(request.SessionId));
        return Ok(new ApiResponse(true));
    }

    /// <summary>
    /// History is stored per account: the client's session id is scoped by the
    /// signed-in user, so one account can never read or clear another's
    /// conversation by presenting its session id.
    /// </summary>
    private string SessionKey(string sessionId)
    {
        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "unknown";
        return $"{userId}:{sessionId}";
    }

    private string? AccountEmail() =>
        (User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value)?.Trim().ToLowerInvariant();

    private static string? Truncate(string? value, int max) =>
        value is null ? null : (value.Length <= max ? value : value[..max]);

    public static string BuildSystemPrompt(string language, IReadOnlyList<string>? verifiedFacts = null)
    {
        // Investors act on what the assistant says, and a model's memory of
        // legal thresholds is often out of date (it quoted a pre-2019 minimum
        // capital in testing). Unless a figure is listed as verified, it must
        // explain the requirement and send the user to the agency for the number.
        var facts = verifiedFacts is { Count: > 0 }
            ? "Verified facts (confirmed with the agencies — you may state these exactly as written, and no other figures):\n"
              + string.Join("\n", verifiedFacts.Select(f => "- " + f))
            : "Verified facts: none are configured, so do not state any figures of the kinds described here.";

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

            Figures and legal thresholds: do NOT state specific amounts or numbers from memory —
            minimum investment or capital requirements, fees and charges, tax rates and
            percentages, penalties, processing times, deadlines or validity periods. They change,
            and an outdated figure can seriously mislead an investor. Instead, explain what the
            requirement is and which agency sets or administers it, and tell the user to confirm
            the current figure with that agency (the UIA One Stop Centre can be reached on
            +256 414 301 000). This applies even if the user asks for "just the number".

            {facts}

            Formatting: reply in plain text only. Do NOT use any Markdown — no asterisks
            for bold or italics (** or *), no backticks, no headings, and no markdown link
            syntax. Write in plain sentences and paragraphs; if you need a list, use a
            simple hyphen at the start of the line.

            End each response with [SENTIMENT:positive],
            [SENTIMENT:neutral], or [SENTIMENT:negative] based on the user's apparent mood.
            """;
    }
}
