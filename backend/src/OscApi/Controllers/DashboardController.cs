using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OscApi.Common;
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

        // Collapse the per-ticket counters into a single aggregate query (SUM(CASE
        // WHEN …)) instead of ~7 sequential round-trips to the cloud DB. EF Core
        // does not allow concurrent queries on one DbContext, so fewer queries —
        // not parallel ones — is the correct optimization here.
        var ticketStats = await _db.Tickets
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Total = g.Count(),
                Open = g.Count(t => t.Status != TicketStatus.Resolved && t.Status != TicketStatus.Closed),
                Resolved = g.Count(t => t.Status == TicketStatus.Resolved || t.Status == TicketStatus.Closed),
                Escalated = g.Count(t => t.IsEscalated),
                SlaBreached = g.Count(t =>
                    t.SlaDeadlineAt != null && t.SlaDeadlineAt < now &&
                    t.Status != TicketStatus.Resolved && t.Status != TicketStatus.Closed),
                Recent = g.Count(t => t.CreatedAt >= thirtyDaysAgo),
                AvgRating = g.Average(t => (double?)t.SatisfactionRating) ?? 0,
            })
            .FirstOrDefaultAsync();

        var totalTickets = ticketStats?.Total ?? 0;
        var openTickets = ticketStats?.Open ?? 0;
        var resolvedTickets = ticketStats?.Resolved ?? 0;
        var escalatedTickets = ticketStats?.Escalated ?? 0;
        var slaBreached = ticketStats?.SlaBreached ?? 0;
        var avgRating = ticketStats?.AvgRating ?? 0;
        var recentTickets = ticketStats?.Recent ?? 0;

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

        // Contact & appointment counts — one aggregate query per table.
        var inquiryStats = await _db.ContactInquiries
            .GroupBy(_ => 1)
            .Select(g => new { Total = g.Count(), Recent = g.Count(i => i.CreatedAt >= thirtyDaysAgo) })
            .FirstOrDefaultAsync();
        var appointmentStats = await _db.Appointments
            .GroupBy(_ => 1)
            .Select(g => new { Total = g.Count(), Recent = g.Count(a => a.CreatedAt >= thirtyDaysAgo) })
            .FirstOrDefaultAsync();
        var totalInquiries = inquiryStats?.Total ?? 0;
        var recentInquiries = inquiryStats?.Recent ?? 0;
        var totalAppointments = appointmentStats?.Total ?? 0;
        var recentAppointments = appointmentStats?.Recent ?? 0;

        // Escalation count (from chatbot)
        var chatEscalations = await _db.ChatEnquiries.CountAsync(c => c.Tier == ChatTier.Escalation);

        // Message volume — single aggregate query.
        var messageStats = await _db.TicketMessages
            .GroupBy(_ => 1)
            .Select(g => new { Total = g.Count(), Recent = g.Count(m => m.SentAt >= thirtyDaysAgo) })
            .FirstOrDefaultAsync();
        var totalMessages = messageStats?.Total ?? 0;
        var recentMessages = messageStats?.Recent ?? 0;

        // Analytics events (tool usage, downloads) — single aggregate query.
        var analyticsStats = await _db.AnalyticsEvents
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Tool = g.Count(e => e.EventType == "tool_usage"),
                Download = g.Count(e => e.EventType == "download"),
                Search = g.Count(e => e.EventType == "search"),
            })
            .FirstOrDefaultAsync();
        var toolUsageCount = analyticsStats?.Tool ?? 0;
        var downloadCount = analyticsStats?.Download ?? 0;
        var searchCount = analyticsStats?.Search ?? 0;

        var toolBreakdown = await _db.AnalyticsEvents
            .Where(e => e.EventType == "tool_usage")
            .GroupBy(e => e.EventName)
            .Select(g => new { Tool = g.Key, Count = g.Count() })
            .ToListAsync();

        var topDownloads = await _db.AnalyticsEvents
            .Where(e => e.EventType == "download")
            .GroupBy(e => e.EventName)
            .Select(g => new { Resource = g.Key, Count = g.Count() })
            .OrderByDescending(g => g.Count)
            .Take(10)
            .ToListAsync();

        return Ok(new ApiResponse<object>(true, new
        {
            kpis = new
            {
                totalTickets, openTickets, resolvedTickets, escalatedTickets,
                slaBreached, avgRating, recentTickets, totalInvestors, totalChatSessions,
                totalInquiries, totalAppointments, recentInquiries, recentAppointments,
                chatEscalations, totalMessages, recentMessages,
                toolUsageCount, downloadCount, searchCount,
            },
            ticketsByCategory,
            ticketsByStatus,
            toolBreakdown,
            topDownloads,
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
        var (skip, take) = Pagination.Normalize(from, to);
        var enquiries = await _db.ChatEnquiries
            .OrderByDescending(c => c.CreatedAt)
            .Skip(skip).Take(take)
            .Select(c => new
            {
                c.SessionId, c.UserName, c.UserEmail, c.UserMessage, c.BotResponse,
                c.Language, c.Sentiment, c.Tier, c.CreatedAt
            })
            .ToListAsync();

        return Ok(new ApiResponse<object>(true, new { enquiries, total = total2 }));
    }
}
