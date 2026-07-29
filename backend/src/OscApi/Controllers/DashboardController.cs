using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.Common;
using OscApi.Models;
using OscApi.Services;

namespace OscApi.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Policy = "AdminOnly")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly OscDbContext _db;

    public DashboardController(IDashboardService dashboardService, OscDbContext db)
    {
        _dashboardService = dashboardService;
        _db = db;
    }

    /// <summary>Get dashboard KPIs and metrics (cached for 5 minutes).</summary>
    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        // Dashboard stats are cached for 5 minutes to reduce database load
        var stats = await _dashboardService.GetDashboardStatsAsync();

        // Add cache headers for browser-side caching (1 minute)
        Response.Headers.CacheControl = "private, max-age=60";

        return Ok(new ApiResponse<object>(true, new
        {
            kpis = new
            {
                stats.TotalTickets, stats.OpenTickets, stats.ResolvedTickets, stats.EscalatedTickets,
                stats.SlaBreached, stats.AvgRating, stats.RecentTickets, stats.TotalInvestors, stats.TotalChatSessions,
                stats.TotalInquiries, stats.TotalAppointments, stats.RecentInquiries, stats.RecentAppointments,
                stats.ChatEscalations, stats.TotalMessages, stats.RecentMessages,
                stats.ToolUsageCount, stats.DownloadCount, stats.SearchCount,
            },
            stats.TicketsByCategory,
            stats.TicketsByStatus,
            stats.ToolBreakdown,
            stats.TopDownloads,
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
            var now = DateTimeOffset.UtcNow;
            var startOfToday = new DateTimeOffset(now.UtcDateTime.Date, TimeSpan.Zero);
            var startOfWeek = startOfToday.AddDays(-(int)now.UtcDateTime.DayOfWeek);

            var total = await _db.ChatEnquiries.CountAsync();
            var uniqueSessions = await _db.ChatEnquiries.Select(c => c.SessionId).Distinct().CountAsync();
            var today = await _db.ChatEnquiries.CountAsync(c => c.CreatedAt >= startOfToday);
            var thisWeek = await _db.ChatEnquiries.CountAsync(c => c.CreatedAt >= startOfWeek);

            // The dashboard indexes these by name (e.g. byTier.ai), so they are
            // returned as lower-cased maps rather than arrays of pairs.
            var byLanguage = (await _db.ChatEnquiries
                    .GroupBy(c => c.Language)
                    .Select(g => new { Key = g.Key, Count = g.Count() })
                    .ToListAsync())
                .ToDictionary(x => x.Key.ToString().ToLowerInvariant(), x => x.Count);
            var bySentiment = (await _db.ChatEnquiries
                    .Where(c => c.Sentiment != null)
                    .GroupBy(c => c.Sentiment!.Value)
                    .Select(g => new { Key = g.Key, Count = g.Count() })
                    .ToListAsync())
                .ToDictionary(x => x.Key.ToString().ToLowerInvariant(), x => x.Count);
            var byTier = (await _db.ChatEnquiries
                    .GroupBy(c => c.Tier)
                    .Select(g => new { Key = g.Key, Count = g.Count() })
                    .ToListAsync())
                .ToDictionary(x => x.Key.ToString().ToLowerInvariant(), x => x.Count);

            // Emit every enum member, so the dashboard's "no data" checks and
            // percentage maths never hit an undefined bucket.
            foreach (var l in Enum.GetNames<ChatLanguage>())
                byLanguage.TryAdd(l.ToLowerInvariant(), 0);
            foreach (var s in Enum.GetNames<ChatSentiment>())
                bySentiment.TryAdd(s.ToLowerInvariant(), 0);
            foreach (var t in Enum.GetNames<ChatTier>())
                byTier.TryAdd(t.ToLowerInvariant(), 0);

            return Ok(new ApiResponse<object>(true, new
            {
                total, uniqueSessions, today, thisWeek, byLanguage, bySentiment, byTier,
            }));
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
