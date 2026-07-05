using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using OscApi.Data;
using OscApi.Models;

namespace OscApi.Services;

public interface IDashboardService
{
    Task<DashboardStats> GetDashboardStatsAsync();
    void InvalidateCache();
}

public class DashboardService : IDashboardService
{
    private readonly OscDbContext _db;
    private readonly IMemoryCache _cache;
    private const string CacheKey = "dashboard:stats";
    private const int CacheDurationMinutes = 5;

    public DashboardService(OscDbContext db, IMemoryCache cache)
    {
        _db = db;
        _cache = cache;
    }

    public async Task<DashboardStats> GetDashboardStatsAsync()
    {
        if (_cache.TryGetValue(CacheKey, out DashboardStats? cachedStats))
            return cachedStats!;

        var stats = await ComputeDashboardStatsAsync();
        _cache.Set(CacheKey, stats, TimeSpan.FromMinutes(CacheDurationMinutes));
        return stats;
    }

    public void InvalidateCache()
    {
        _cache.Remove(CacheKey);
    }

    private async Task<DashboardStats> ComputeDashboardStatsAsync()
    {
        var now = DateTimeOffset.UtcNow;
        var thirtyDaysAgo = now.AddDays(-30);

        // Single aggregate query for ticket stats
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

        var inquiryStats = await _db.ContactInquiries
            .GroupBy(_ => 1)
            .Select(g => new { Total = g.Count(), Recent = g.Count(i => i.CreatedAt >= thirtyDaysAgo) })
            .FirstOrDefaultAsync();

        var appointmentStats = await _db.Appointments
            .GroupBy(_ => 1)
            .Select(g => new { Total = g.Count(), Recent = g.Count(a => a.CreatedAt >= thirtyDaysAgo) })
            .FirstOrDefaultAsync();

        var chatEscalations = await _db.ChatEnquiries.CountAsync(c => c.Tier == ChatTier.Escalation);

        var messageStats = await _db.TicketMessages
            .GroupBy(_ => 1)
            .Select(g => new { Total = g.Count(), Recent = g.Count(m => m.SentAt >= thirtyDaysAgo) })
            .FirstOrDefaultAsync();

        var analyticsStats = await _db.AnalyticsEvents
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Tool = g.Count(e => e.EventType == "tool_usage"),
                Download = g.Count(e => e.EventType == "download"),
                Search = g.Count(e => e.EventType == "search"),
            })
            .FirstOrDefaultAsync();

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

        return new DashboardStats
        {
            TotalTickets = ticketStats?.Total ?? 0,
            OpenTickets = ticketStats?.Open ?? 0,
            ResolvedTickets = ticketStats?.Resolved ?? 0,
            EscalatedTickets = ticketStats?.Escalated ?? 0,
            SlaBreached = ticketStats?.SlaBreached ?? 0,
            AvgRating = ticketStats?.AvgRating ?? 0,
            RecentTickets = ticketStats?.Recent ?? 0,
            TotalInvestors = totalInvestors,
            TotalChatSessions = totalChatSessions,
            TotalInquiries = inquiryStats?.Total ?? 0,
            RecentInquiries = inquiryStats?.Recent ?? 0,
            TotalAppointments = appointmentStats?.Total ?? 0,
            RecentAppointments = appointmentStats?.Recent ?? 0,
            ChatEscalations = chatEscalations,
            TotalMessages = messageStats?.Total ?? 0,
            RecentMessages = messageStats?.Recent ?? 0,
            ToolUsageCount = analyticsStats?.Tool ?? 0,
            DownloadCount = analyticsStats?.Download ?? 0,
            SearchCount = analyticsStats?.Search ?? 0,
            TicketsByCategory = ticketsByCategory.Cast<object>().ToList(),
            TicketsByStatus = ticketsByStatus.Cast<object>().ToList(),
            ToolBreakdown = toolBreakdown.Cast<object>().ToList(),
            TopDownloads = topDownloads.Cast<object>().ToList(),
        };
    }
}

public class DashboardStats
{
    public int TotalTickets { get; set; }
    public int OpenTickets { get; set; }
    public int ResolvedTickets { get; set; }
    public int EscalatedTickets { get; set; }
    public int SlaBreached { get; set; }
    public double AvgRating { get; set; }
    public int RecentTickets { get; set; }
    public int TotalInvestors { get; set; }
    public int TotalChatSessions { get; set; }
    public int TotalInquiries { get; set; }
    public int RecentInquiries { get; set; }
    public int TotalAppointments { get; set; }
    public int RecentAppointments { get; set; }
    public int ChatEscalations { get; set; }
    public int TotalMessages { get; set; }
    public int RecentMessages { get; set; }
    public int ToolUsageCount { get; set; }
    public int DownloadCount { get; set; }
    public int SearchCount { get; set; }
    public List<object> TicketsByCategory { get; set; } = new();
    public List<object> TicketsByStatus { get; set; } = new();
    public List<object> ToolBreakdown { get; set; } = new();
    public List<object> TopDownloads { get; set; } = new();
}
