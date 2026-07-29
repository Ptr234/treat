using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using OscApi.Common;
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

        // ── Investment pipeline ──────────────────────────────────────────
        // Capital still in the funnel: every investor profile that has not been
        // marked inactive. Amounts are free text from the onboarding form, so
        // they go through MoneyParser and anything unreadable is skipped rather
        // than silently counted as zero.
        var pipelineAmounts = await _db.InvestorProfiles
            .Where(p => p.Status != InvestorStatus.Inactive)
            .Select(p => p.InvestmentAmount)
            .ToListAsync();
        var pipelineValueUsd = MoneyParser.SumUsd(pipelineAmounts);

        // ── Conversion ───────────────────────────────────────────────────
        // Share of registered investors that reached Active — the end of the
        // New → Contacted → Active funnel the pipeline board tracks.
        var investorsByStatus = await _db.InvestorProfiles
            .GroupBy(p => p.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();
        var investorTotal = investorsByStatus.Sum(x => x.Count);
        var investorActive = investorsByStatus
            .Where(x => x.Status == InvestorStatus.Active)
            .Sum(x => x.Count);
        var conversionRate = investorTotal > 0
            ? (int)Math.Round(investorActive * 100.0 / investorTotal)
            : 0;

        // ── Agency scorecard ─────────────────────────────────────────────
        var startOfToday = new DateTimeOffset(now.UtcDateTime.Date, TimeSpan.Zero);
        // Only the columns the scorecard needs; the durations are averaged in
        // memory because date arithmetic differs per provider and this whole
        // computation is behind the 5-minute cache anyway.
        var agencyTickets = await _db.Tickets
            .Where(t => t.AssignedAgencyCode != null && t.AssignedAgencyCode != "")
            .Select(t => new
            {
                Code = t.AssignedAgencyCode!,
                t.Status,
                t.CreatedAt,
                t.ResolvedAt,
                t.SlaDeadlineAt,
            })
            .ToListAsync();

        var agencyScorecard = agencyTickets
            .GroupBy(t => t.Code)
            .Select(g =>
            {
                var total = g.Count();
                var active = g.Count(t => t.Status != TicketStatus.Resolved && t.Status != TicketStatus.Closed);
                var resolvedToday = g.Count(t => t.ResolvedAt != null && t.ResolvedAt >= startOfToday);
                var breached = g.Count(t =>
                    t.SlaDeadlineAt != null &&
                    ((t.ResolvedAt == null && t.SlaDeadlineAt < now) ||
                     (t.ResolvedAt != null && t.ResolvedAt > t.SlaDeadlineAt)));

                var resolutionHours = g
                    .Where(t => t.ResolvedAt != null)
                    .Select(t => (t.ResolvedAt!.Value - t.CreatedAt).TotalHours)
                    .ToList();

                var slaCompliance = total > 0
                    ? (int)Math.Round((total - breached) * 100.0 / total)
                    : 100;
                var closureRate = total > 0 ? (total - active) * 100.0 / total : 0;
                // Weighted so an agency is judged mostly on meeting its SLA,
                // with the rest on actually closing what it is given.
                var score = (int)Math.Round(slaCompliance * 0.7 + closureRate * 0.3);

                return new
                {
                    Score = score,
                    Row = (object)new
                    {
                        agency = AgencyDirectory.NameFor(g.Key),
                        acronym = g.Key,
                        score,
                        activeCases = active,
                        resolvedToday,
                        avgResponseTime = resolutionHours.Count > 0
                            ? FormatHours(resolutionHours.Average())
                            : "—",
                        slaCompliance,
                    },
                };
            })
            .OrderByDescending(x => x.Score)
            .Select(x => x.Row)
            .ToList();

        // ── Alerts ───────────────────────────────────────────────────────
        var alerts = await BuildAlertsAsync(now);

        // ── Recent activity ──────────────────────────────────────────────
        var recentActivity = await BuildRecentActivityAsync();

        return new DashboardStats
        {
            PipelineValueUsd = pipelineValueUsd,
            ConversionRate = conversionRate,
            AgencyScorecard = agencyScorecard,
            Alerts = alerts,
            RecentActivity = recentActivity,
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

    /// <summary>Capital threshold above which an open case is flagged to leadership.</summary>
    private const decimal LargeInvestmentUsd = 10_000_000m;

    /// <summary>Open cases at one agency beyond which its queue is flagged.</summary>
    private const int HighVolumeThreshold = 5;

    /// <summary>
    /// Derives the leadership alert feed from live ticket state. Alert ids are
    /// deterministic (type + reference) so that acknowledging one on the client
    /// keeps it acknowledged across refreshes.
    /// </summary>
    private async Task<List<object>> BuildAlertsAsync(DateTimeOffset now)
    {
        var open = await _db.Tickets
            .Where(t => t.Status != TicketStatus.Resolved && t.Status != TicketStatus.Closed)
            .Select(t => new
            {
                t.ReferenceNumber, t.Title, t.Category, t.Priority, t.CreatedAt,
                t.SlaDeadlineAt, t.AssignedAgencyCode, t.InvestmentSize, t.IsEscalated,
            })
            .ToListAsync();

        var alerts = new List<(int Rank, DateTimeOffset When, object Alert)>();

        void Add(int rank, string id, string type, string severity, string title, string message,
                 DateTimeOffset ts, string? refNumber)
            => alerts.Add((rank, ts, new
            {
                id,
                type,
                severity,
                title,
                message,
                timestamp = ts,
                acknowledged = false,
                relatedTicketId = refNumber,
            }));

        foreach (var t in open)
        {
            var agency = AgencyDirectory.NameFor(t.AssignedAgencyCode);

            // Past its SLA deadline and still not resolved.
            if (t.SlaDeadlineAt is { } deadline && deadline < now)
            {
                var overdue = now - deadline;
                Add(0, $"sla-{t.ReferenceNumber}", "sla_breach", "critical",
                    $"SLA breached — {t.ReferenceNumber}",
                    $"{t.Title} ({agency}) is {FormatDuration(overdue)} past its response deadline.",
                    deadline, t.ReferenceNumber);
            }

            // VIP files are the Centre's highest-touch commitment.
            if (t.Category == TicketCategory.Vip)
            {
                Add(1, $"vip-{t.ReferenceNumber}", "vip_delay", "high",
                    $"VIP case open — {t.ReferenceNumber}",
                    $"{t.Title} ({agency}) has been open for {FormatDuration(now - t.CreatedAt)}.",
                    t.CreatedAt, t.ReferenceNumber);
            }

            // Large capital at stake on an unresolved case.
            var amount = MoneyParser.ParseUsd(t.InvestmentSize);
            if (amount >= LargeInvestmentUsd)
            {
                Add(2, $"cap-{t.ReferenceNumber}", "large_investment",
                    t.IsEscalated ? "high" : "medium",
                    $"Large investment pending — {t.ReferenceNumber}",
                    $"{t.Title} represents {amount!.Value / 1_000_000m:0.#}M USD and is awaiting {agency}.",
                    t.CreatedAt, t.ReferenceNumber);
            }
        }

        // An agency carrying an unusually large open queue.
        foreach (var g in open
                     .Where(t => !string.IsNullOrEmpty(t.AssignedAgencyCode))
                     .GroupBy(t => t.AssignedAgencyCode!)
                     .Where(g => g.Count() >= HighVolumeThreshold))
        {
            Add(3, $"vol-{g.Key}", "high_volume", "medium",
                $"High case volume — {g.Key}",
                $"{AgencyDirectory.NameFor(g.Key)} has {g.Count()} open cases awaiting action.",
                now, null);
        }

        return alerts
            .OrderBy(a => a.Rank)
            .ThenByDescending(a => a.When)
            .Select(a => a.Alert)
            .Take(25)
            .ToList();
    }

    /// <summary>Most recent notable events across tickets, inquiries and appointments.</summary>
    private async Task<List<object>> BuildRecentActivityAsync()
    {
        var tickets = await _db.Tickets
            .OrderByDescending(t => t.CreatedAt)
            .Take(10)
            .Select(t => new
            {
                t.ReferenceNumber, t.Title, t.ContactName, t.CreatedAt,
                t.ResolvedAt, t.IsEscalated,
            })
            .ToListAsync();

        var inquiries = await _db.ContactInquiries
            .OrderByDescending(i => i.CreatedAt)
            .Take(5)
            .Select(i => new { i.ReferenceNumber, i.Subject, i.ContactName, i.CreatedAt })
            .ToListAsync();

        var appointments = await _db.Appointments
            .OrderByDescending(a => a.CreatedAt)
            .Take(5)
            .Select(a => new { a.ReferenceNumber, a.AgencyName, a.ContactName, a.CreatedAt })
            .ToListAsync();

        var events = new List<(DateTimeOffset When, object Item)>();

        foreach (var t in tickets)
        {
            if (t.ResolvedAt is { } resolved)
            {
                events.Add((resolved, new
                {
                    id = $"act-res-{t.ReferenceNumber}",
                    action = "Resolved case",
                    actor = "OneStop Centre",
                    target = $"{t.ReferenceNumber} — {t.Title}",
                    timestamp = resolved,
                    type = "resolution",
                }));
            }
            else if (t.IsEscalated)
            {
                events.Add((t.CreatedAt, new
                {
                    id = $"act-esc-{t.ReferenceNumber}",
                    action = "Escalated case",
                    actor = t.ContactName,
                    target = $"{t.ReferenceNumber} — {t.Title}",
                    timestamp = t.CreatedAt,
                    type = "escalation",
                }));
            }
            else
            {
                events.Add((t.CreatedAt, new
                {
                    id = $"act-tkt-{t.ReferenceNumber}",
                    action = "Filed a support case",
                    actor = t.ContactName,
                    target = $"{t.ReferenceNumber} — {t.Title}",
                    timestamp = t.CreatedAt,
                    type = "inquiry",
                }));
            }
        }

        foreach (var i in inquiries)
        {
            events.Add((i.CreatedAt, new
            {
                id = $"act-inq-{i.ReferenceNumber}",
                action = "Submitted an enquiry",
                actor = i.ContactName,
                target = $"{i.ReferenceNumber} — {i.Subject}",
                timestamp = i.CreatedAt,
                type = "inquiry",
            }));
        }

        foreach (var a in appointments)
        {
            events.Add((a.CreatedAt, new
            {
                id = $"act-apt-{a.ReferenceNumber}",
                action = "Requested an appointment",
                actor = a.ContactName,
                target = $"{a.ReferenceNumber} — {a.AgencyName}",
                timestamp = a.CreatedAt,
                type = "approval",
            }));
        }

        return events
            .OrderByDescending(e => e.When)
            .Take(12)
            .Select(e => e.Item)
            .ToList();
    }

    /// <summary>
    /// A mean resolution time in the unit that suits it. Formatting everything
    /// in hours renders a genuinely fast turnaround as "0h", which reads as
    /// missing data rather than good performance.
    /// </summary>
    private static string FormatHours(double hours)
    {
        if (hours >= 24) return $"{hours / 24:0.#}d";
        if (hours >= 1) return $"{hours:0.#}h";
        var minutes = hours * 60;
        return minutes >= 1 ? $"{minutes:0}m" : "<1m";
    }

    /// <summary>"3h 20m" / "2d 4h" — compact enough for an alert line.</summary>
    private static string FormatDuration(TimeSpan span)
    {
        if (span.TotalDays >= 1) return $"{(int)span.TotalDays}d {span.Hours}h";
        if (span.TotalHours >= 1) return $"{(int)span.TotalHours}h {span.Minutes}m";
        return $"{Math.Max(1, (int)span.TotalMinutes)}m";
    }
}

public class DashboardStats
{
    /// <summary>Capital value (USD) of investor profiles still in the funnel.</summary>
    public decimal PipelineValueUsd { get; set; }
    /// <summary>Percentage of registered investors that reached Active.</summary>
    public int ConversionRate { get; set; }
    public List<object> AgencyScorecard { get; set; } = new();
    public List<object> Alerts { get; set; } = new();
    public List<object> RecentActivity { get; set; } = new();

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
