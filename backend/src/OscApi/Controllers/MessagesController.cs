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
public class MessagesController : ControllerBase
{
    private readonly OscDbContext _db;
    private readonly JwtService _jwt;

    public MessagesController(OscDbContext db, JwtService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    [HttpGet]
    public async Task<IActionResult> GetMessages([FromQuery] string? channel)
    {
        if (!IsAdmin(out var claims))
            return Unauthorized(new ApiResponse(false, "Admin access required"));

        if (string.IsNullOrEmpty(channel))
        {
            // Return list of channels
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

    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
    {
        if (!IsAdmin(out var claims))
            return Unauthorized(new ApiResponse(false, "Admin access required"));

        var name = claims.FirstOrDefault(c => c.Type == "name")?.Value ?? "Unknown";
        var email = claims.FirstOrDefault(c => c.Type == "email" || c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;

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

    private bool IsAdmin(out System.Security.Claims.Claim[] claims)
    {
        claims = Array.Empty<System.Security.Claims.Claim>();
        var token = Request.Cookies["osc-session"];
        if (string.IsNullOrEmpty(token)) return false;
        var principal = _jwt.ValidateToken(token);
        if (principal is null) return false;
        claims = principal.Claims.ToArray();
        return claims.Any(c =>
            c.Type == System.Security.Claims.ClaimTypes.Role && c.Value == "admin");
    }
}
