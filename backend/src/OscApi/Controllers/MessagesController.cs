using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.Common;
using OscApi.Dtos.Messages;
using OscApi.Models;

namespace OscApi.Controllers;

[ApiController]
[Route("api/messages")]
[Authorize(Policy = "AdminOnly")]
public class MessagesController : ControllerBase
{
    private readonly OscDbContext _db;

    public MessagesController(OscDbContext db)
    {
        _db = db;
    }

    /// <summary>Get messages (optionally filtered by channel).</summary>
    [HttpGet]
    public async Task<IActionResult> GetMessages([FromQuery] string? channel)
    {
        if (string.IsNullOrEmpty(channel))
        {
            var channels = await _db.AgencyMessages
                .GroupBy(m => m.Channel)
                .Select(g => new
                {
                    Channel = g.Key,
                    LastMessage = g.OrderByDescending(m => m.SentAt).First().Content,
                    LastSender = g.OrderByDescending(m => m.SentAt).First().SenderName,
                    LastAt = g.Max(m => m.SentAt),
                    Count = g.Count()
                })
                .OrderByDescending(c => c.LastAt)
                .ToListAsync();

            return Ok(new ApiResponse<object>(true, channels));
        }

        var messages = await _db.AgencyMessages
            .Where(m => m.Channel == channel)
            .OrderBy(m => m.SentAt)
            .Select(m => new { m.Content, m.SenderName, m.SenderAgencyCode, m.SenderEmail, m.IsInternal, m.SentAt })
            .ToListAsync();

        return Ok(new ApiResponse<object>(true, messages));
    }

    /// <summary>Send a message to a channel.</summary>
    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
    {
        var name = User.FindFirst("name")?.Value ?? "Unknown";
        var email = User.FindFirst("email")?.Value
            ?? User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

        var message = new AgencyMessage
        {
            Channel = request.Channel,
            Content = SanitizeHelper.StripHtml(request.Content),
            SenderName = name,
            SenderEmail = email,
            IsInternal = request.IsInternal,
        };

        _db.AgencyMessages.Add(message);
        await _db.SaveChangesAsync();

        return Created("", new ApiResponse<object>(true, new
        {
            message.Content, message.SenderName, message.SentAt
        }));
    }
}
