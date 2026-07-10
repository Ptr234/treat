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
[Authorize(Policy = Roles.StaffPolicy)]
public class MessagesController : ControllerBase
{
    private readonly OscDbContext _db;

    public MessagesController(OscDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// True if the signed-in agency officer may access this channel: the shared
    /// "general" channel, or a per-ticket channel for a ticket assigned to their
    /// own agency. Admin-level users (checked by the caller) bypass this.
    /// </summary>
    private async Task<bool> OfficerCanAccessChannelAsync(string channel)
    {
        if (channel == "general") return true;
        var agencyCode = User.GetAgencyCode();
        if (string.IsNullOrEmpty(agencyCode)) return false;
        return await _db.Tickets.AnyAsync(t => t.ReferenceNumber == channel && t.AssignedAgencyCode == agencyCode);
    }

    /// <summary>Get messages (optionally filtered by channel).</summary>
    [HttpGet]
    public async Task<IActionResult> GetMessages([FromQuery] string? channel)
    {
        var isOfficer = User.IsAgencyOfficer();

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

            if (isOfficer)
            {
                var agencyCode = User.GetAgencyCode();
                var agencyTicketRefs = await _db.Tickets
                    .Where(t => t.AssignedAgencyCode == agencyCode)
                    .Select(t => t.ReferenceNumber)
                    .ToListAsync();
                var visibleRefs = new HashSet<string>(agencyTicketRefs) { "general" };
                channels = channels.Where(c => visibleRefs.Contains(c.Channel)).ToList();
            }

            return Ok(new ApiResponse<object>(true, channels));
        }

        if (isOfficer && !await OfficerCanAccessChannelAsync(channel))
            return NotFound(new ApiResponse(false, "Channel not found"));

        var messages = await _db.AgencyMessages
            .Where(m => m.Channel == channel)
            .OrderBy(m => m.SentAt)
            .Select(m => new
            {
                _id = m.Id.ToString(),
                m.Channel,
                m.Content,
                m.SenderName,
                m.SenderAgencyCode,
                m.SenderEmail,
                m.IsInternal,
                m.SentAt
            })
            .ToListAsync();

        return Ok(new ApiResponse<object>(true, messages));
    }

    /// <summary>Send a message to a channel.</summary>
    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
    {
        if (User.IsAgencyOfficer() && !await OfficerCanAccessChannelAsync(request.Channel))
            return NotFound(new ApiResponse(false, "Channel not found"));

        var name = User.FindFirst("name")?.Value ?? "Unknown";
        var email = User.FindFirst("email")?.Value
            ?? User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        var agencyCode = User.GetAgencyCode() ?? request.SenderAgencyCode;

        var message = new AgencyMessage
        {
            Channel = request.Channel,
            Content = SanitizeHelper.StripHtml(request.Content),
            SenderName = name,
            SenderAgencyCode = agencyCode,
            SenderEmail = email,
            IsInternal = request.IsInternal,
        };

        _db.AgencyMessages.Add(message);
        await _db.SaveChangesAsync();

        return Created("", new ApiResponse<object>(true, new
        {
            _id = message.Id.ToString(),
            message.Channel,
            message.Content,
            message.SenderName,
            message.SenderAgencyCode,
            message.SenderEmail,
            message.IsInternal,
            message.SentAt
        }));
    }
}
