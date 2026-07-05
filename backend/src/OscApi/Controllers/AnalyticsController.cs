using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using OscApi.Dtos.Common;
using OscApi.Models;
using OscApi.Services;

namespace OscApi.Controllers;

[ApiController]
[Route("api/analytics")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsQueueService _analyticsQueue;

    public AnalyticsController(IAnalyticsQueueService analyticsQueue)
    {
        _analyticsQueue = analyticsQueue;
    }

    /// <summary>Log a user interaction event (tool usage, download, search). Events are queued and batched for write.</summary>
    [HttpPost("event")]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> LogEvent([FromBody] LogEventRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.EventType) || string.IsNullOrWhiteSpace(request.EventName))
            return BadRequest(new ApiResponse(false, "eventType and eventName are required"));

        var allowed = new[] { "tool_usage", "download", "search" };
        if (!allowed.Contains(request.EventType))
            return BadRequest(new ApiResponse(false, $"eventType must be one of: {string.Join(", ", allowed)}"));

        // Clamp to column widths so an oversized value can't turn the insert into a 500
        static string? Clamp(string? v, int max) => v is null || v.Length <= max ? v : v[..max];

        var evt = new AnalyticsEvent
        {
            EventType = request.EventType,
            EventName = Clamp(request.EventName, 100)!,
            Metadata = Clamp(request.Metadata, 500),
            UserEmail = Clamp(request.UserEmail, 100),
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
        };

        // Queue event for batch processing (non-blocking)
        await _analyticsQueue.EnqueueAsync(evt);

        return Ok(new ApiResponse(true));
    }
}

public record LogEventRequest(
    string EventType,
    string EventName,
    string? Metadata = null,
    string? UserEmail = null
);
