using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OscApi.Data;
using OscApi.Dtos.Common;
using OscApi.Models;

namespace OscApi.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Policy = "AdminOnly")]
public class DashboardController : ControllerBase
{
    private readonly OscDbContext _db;

    public DashboardController(OscDbContext db)
    {
        _db = db;
    }

    /// <summary>Get dashboard KPIs and metrics.</summary>
    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        var now = DateTimeOffset.UtcNow;
        var thirtyDaysAgo = now.AddDays(-30);

        var totalTickets = await _db.Tickets.CountAsync();
        var openTickets = await _db.Tickets.CountAsync(t =>
            t.Status != TicketStatus.Resolved && t.Status != TicketStatus.Closed);
        var resolvedTickets = await _db.Tickets.CountAsync(t => t.Status == TicketStatus.Resolved || t.Status == TicketStatus.Closed);
        var escalatedTickets = await _db.Tickets.CountAsync(t => t.IsEscalated);

        var slaBreached = await _db.Tickets.CountAsync(t =>
            t.SlaDeadlineAt != null && t.SlaDeadlineAt < now &&
            t.Status != TicketStatus.Resolved && t.Status != TicketStatus.Closed);

        var avgRating = await _db.Tickets
            .Where(t => t.SatisfactionRating != null)
            .AverageAsync(t => (double?)t.SatisfactionRating) ?? 0;

        var recentTickets = await _db.Tickets
            .Where(t => t.CreatedAt >= thirtyDaysAgo)
            .CountAsync();

        var ticketsByCategory = await _db.Tickets
            .GroupBy(t => t.Category)
            .Select(g => new { Category = g.Key.ToString(), Count = g.Count() })
            .ToListAsync();

        var ticketsByStatus = await _db.Tickets
            .GroupBy(t => t.Status)
            .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
            .ToListAsync();

        var totalInvestors = await _db.InvestorProfiles.CountAsync();
        var totalChatSessions = await _db.ChatEnquiries.Select(c => c.SessionId).Distinct().CountAsync();

        return Ok(new ApiResponse<object>(true, new
        {
            kpis = new
            {
                totalTickets, openTickets, resolvedTickets, escalatedTickets,
                slaBreached, avgRating, recentTickets, totalInvestors, totalChatSessions
            },
            ticketsByCategory,
            ticketsByStatus,
        }));
    }

    /// <summary>Get chat enquiry data (stats, list, session).</summary>
    [HttpGet("enquiries")]
    public async Task<IActionResult> GetEnquiries(
        [FromQuery] string action = "list",
        [FromQuery] int from = 0,
        [FromQuery] int to = 50,
        [FromQuery] string? sessionId = null)
    {
        if (action == "stats")
        {
            var total = await _db.ChatEnquiries.CountAsync();
            var uniqueSessions = await _db.ChatEnquiries.Select(c => c.SessionId).Distinct().CountAsync();
            var byLanguage = await _db.ChatEnquiries
                .GroupBy(c => c.Language)
                .Select(g => new { Language = g.Key.ToString(), Count = g.Count() })
                .ToListAsync();
            var bySentiment = await _db.ChatEnquiries
                .Where(c => c.Sentiment != null)
                .GroupBy(c => c.Sentiment)
                .Select(g => new { Sentiment = g.Key!.Value.ToString(), Count = g.Count() })
                .ToListAsync();

            return Ok(new ApiResponse<object>(true, new { total, uniqueSessions, byLanguage, bySentiment }));
        }

        if (action == "session" && sessionId is not null)
        {
            var messages = await _db.ChatEnquiries
                .Where(c => c.SessionId == sessionId)
                .OrderBy(c => c.CreatedAt)
                .Select(c => new { c.UserMessage, c.BotResponse, c.Language, c.Sentiment, c.Tier, c.CreatedAt })
                .ToListAsync();
            return Ok(new ApiResponse<object>(true, messages));
        }

        var total2 = await _db.ChatEnquiries.CountAsync();
        var enquiries = await _db.ChatEnquiries
            .OrderByDescending(c => c.CreatedAt)
            .Skip(from).Take(to - from)
            .Select(c => new
            {
                c.SessionId, c.UserName, c.UserEmail, c.UserMessage, c.BotResponse,
                c.Language, c.Sentiment, c.Tier, c.CreatedAt
            })
            .ToListAsync();

        return Ok(new ApiResponse<object>(true, new { enquiries, total = total2 }));
    }
}
