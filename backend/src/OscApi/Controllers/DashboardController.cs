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
