using Microsoft.AspNetCore.Mvc;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.Chatbot;
using OscApi.Dtos.Common;
using OscApi.Models;

namespace OscApi.Controllers;

[ApiController]
[Route("api/chatbot")]
public class ChatbotController : ControllerBase
{
    private readonly OscDbContext _db;
    private readonly GroqClient _groq;
    private readonly ILogger<ChatbotController> _logger;

    public ChatbotController(OscDbContext db, GroqClient groq, ILogger<ChatbotController> logger)
    {
        _db = db;
        _groq = groq;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        var systemPrompt = BuildSystemPrompt(request.Language);

        var messages = new List<GroqClient.ChatMessage>
        {
            new("system", systemPrompt)
        };

        foreach (var entry in request.History.TakeLast(10))
            messages.Add(new GroqClient.ChatMessage(entry.Role, entry.Content));

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
                sentiment = sentimentMatch.Groups[1].Value;
                response = response.Replace(sentimentMatch.Value, "").Trim();
            }

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
    public async Task<IActionResult> LogChat([FromBody] ChatLogRequest request)
    {
        var enquiry = new ChatEnquiry
        {
            SessionId = request.SessionId,
            UserName = request.UserName,
            UserEmail = request.UserEmail,
            UserPhone = request.UserPhone,
            UserLocation = request.UserLocation,
            UserMessage = request.UserMessage,
            BotResponse = request.BotResponse,
            Language = Enum.Parse<ChatLanguage>(request.Language, true),
            Sentiment = string.IsNullOrEmpty(request.Sentiment) ? null : Enum.Parse<ChatSentiment>(request.Sentiment, true),
            Tier = Enum.Parse<ChatTier>(request.Tier, true),
        };

        _db.ChatEnquiries.Add(enquiry);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse(true));
    }

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
            the relevant agency directly. End each response with [SENTIMENT:positive],
            [SENTIMENT:neutral], or [SENTIMENT:negative] based on the user's apparent mood.
            """;
    }
}
