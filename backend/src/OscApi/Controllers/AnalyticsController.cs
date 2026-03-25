using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using OscApi.Data;
using OscApi.Dtos.Common;
using OscApi.Models;

namespace OscApi.Controllers;

[ApiController]
[Route("api/analytics")]
public class AnalyticsController : ControllerBase
{
    private readonly OscDbContext _db;

    public AnalyticsController(OscDbContext db)
    {
        _db = db;
    }

    /// <summary>Log a user interaction event (tool usage, download, search).</summary>
    [HttpPost("event")]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> LogEvent([FromBody] LogEventRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.EventType) || string.IsNullOrWhiteSpace(request.EventName))
            return BadRequest(new ApiResponse(false, "eventType and eventName are required"));

        var allowed = new[] { "tool_usage", "download", "search" };
        if (!allowed.Contains(request.EventType))
            return BadRequest(new ApiResponse(false, $"eventType must be one of: {string.Join(", ", allowed)}"));

        var evt = new AnalyticsEvent
        {
            EventType = request.EventType,
            EventName = request.EventName,
            Metadata = request.Metadata,
            UserEmail = request.UserEmail,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
        };

        _db.AnalyticsEvents.Add(evt);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse(true));
    }
}

public record LogEventRequest(
    string EventType,
    string EventName,
    string? Metadata = null,
    string? UserEmail = null
);
