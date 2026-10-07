using Microsoft.Extensions.Caching.Memory;
using OscApi.Data;
using OscApi.Models;
using OscApi.Services;
using OscApi.Tests.Helpers;

namespace OscApi.Tests.Services;

/// <summary>
/// Covers the leadership panels that are derived rather than counted:
/// pipeline value, conversion rate, the agency scorecard and the alert feed.
/// </summary>
public class DashboardServiceTests
{
    private static DashboardService CreateService(OscDbContext db) =>
        new(db, new MemoryCache(new MemoryCacheOptions()));

    private static InvestorProfile Investor(string reference, string amount, InvestorStatus status) => new()
    {
        ReferenceNumber = reference,
        Name = $"Investor {reference}",
        Email = $"{reference.ToLowerInvariant()}@example.com",
        Phone = "+256 700 000 000",
        Nationality = "Ugandan",
        InvestmentAmount = amount,
        PrimarySector = "Agriculture",
        Status = status,
    };

    private static Ticket Ticket(
        string reference,
        TicketStatus status,
        string? agency = "UIA",
        TicketCategory category = TicketCategory.GeneralInquiry,
        DateTimeOffset? slaDeadline = null,
        DateTimeOffset? resolvedAt = null,
        string? investmentSize = null) => new()
    {
        ReferenceNumber = reference,
        Title = $"Case {reference}",
        Description = "Test case",
        Category = category,
        Priority = TicketPriority.Medium,
        Status = status,
        ContactName = "Test Investor",
        ContactEmail = "investor@example.com",
        AssignedAgencyCode = agency,
        SlaDeadlineAt = slaDeadline,
        ResolvedAt = resolvedAt,
        InvestmentSize = investmentSize,
        CreatedAt = DateTimeOffset.UtcNow.AddHours(-6),
    };

    // Anonymous projections come back as object; read them by property name.
    private static T Read<T>(object row, string property) =>
        (T)row.GetType().GetProperty(property)!.GetValue(row)!;

    [Fact]
    public async Task PipelineValue_sums_investors_still_in_the_funnel()
    {
        var db = TestDbFactory.Create();
        db.InvestorProfiles.AddRange(
            Investor("INV-1", "USD 1,000,000", InvestorStatus.New),
            Investor("INV-2", "USD 2,500,000", InvestorStatus.Contacted),
            Investor("INV-3", "USD 500,000", InvestorStatus.Active));
        await db.SaveChangesAsync();

        var stats = await CreateService(db).GetDashboardStatsAsync();

        Assert.Equal(4_000_000m, stats.PipelineValueUsd);
    }

    [Fact]
    public async Task PipelineValue_excludes_inactive_investors()
    {
        var db = TestDbFactory.Create();
        db.InvestorProfiles.AddRange(
            Investor("INV-1", "USD 1,000,000", InvestorStatus.Active),
            Investor("INV-2", "USD 9,000,000", InvestorStatus.Inactive));
        await db.SaveChangesAsync();

        var stats = await CreateService(db).GetDashboardStatsAsync();

        Assert.Equal(1_000_000m, stats.PipelineValueUsd);
    }

    [Fact]
    public async Task PipelineValue_ignores_amounts_it_cannot_read()
    {
        var db = TestDbFactory.Create();
        db.InvestorProfiles.AddRange(
            Investor("INV-1", "USD 1,000,000", InvestorStatus.New),
            Investor("INV-2", "to be confirmed", InvestorStatus.New));
        await db.SaveChangesAsync();

        var stats = await CreateService(db).GetDashboardStatsAsync();

        Assert.Equal(1_000_000m, stats.PipelineValueUsd);
    }

    [Fact]
    public async Task ConversionRate_is_the_share_of_investors_that_reached_active()
    {
        var db = TestDbFactory.Create();
        db.InvestorProfiles.AddRange(
            Investor("INV-1", "USD 1", InvestorStatus.Active),
            Investor("INV-2", "USD 1", InvestorStatus.Active),
            Investor("INV-3", "USD 1", InvestorStatus.New),
            Investor("INV-4", "USD 1", InvestorStatus.Contacted));
        await db.SaveChangesAsync();

        var stats = await CreateService(db).GetDashboardStatsAsync();

        Assert.Equal(50, stats.ConversionRate);
    }

    [Fact]
    public async Task ConversionRate_is_zero_when_there_are_no_investors()
    {
        var db = TestDbFactory.Create();

        var stats = await CreateService(db).GetDashboardStatsAsync();

        Assert.Equal(0, stats.ConversionRate);
        Assert.Equal(0m, stats.PipelineValueUsd);
    }

    [Fact]
    public async Task AgencyScorecard_reports_one_row_per_assigned_agency()
    {
        var db = TestDbFactory.Create();
        var future = DateTimeOffset.UtcNow.AddHours(4);
        db.Tickets.AddRange(
            Ticket("T-1", TicketStatus.InProgress, "UIA", slaDeadline: future),
            Ticket("T-2", TicketStatus.Assigned, "UIA", slaDeadline: future),
            Ticket("T-3", TicketStatus.New, "URSB", slaDeadline: future),
            // Unassigned tickets belong to no agency and must not create a row.
            Ticket("T-4", TicketStatus.New, null, slaDeadline: future));
        await db.SaveChangesAsync();

        var stats = await CreateService(db).GetDashboardStatsAsync();

        Assert.Equal(2, stats.AgencyScorecard.Count);
        var uia = stats.AgencyScorecard.Single(r => Read<string>(r, "acronym") == "UIA");
        Assert.Equal("Uganda Investment Authority", Read<string>(uia, "agency"));
        Assert.Equal(2, Read<int>(uia, "activeCases"));
    }

    [Fact]
    public async Task AgencyScorecard_drops_sla_compliance_when_a_deadline_is_missed()
    {
        var db = TestDbFactory.Create();
        var overdue = DateTimeOffset.UtcNow.AddHours(-3);
        var future = DateTimeOffset.UtcNow.AddHours(3);
        db.Tickets.AddRange(
            Ticket("T-1", TicketStatus.InProgress, "UIA", slaDeadline: overdue),
            Ticket("T-2", TicketStatus.InProgress, "UIA", slaDeadline: future));
        await db.SaveChangesAsync();

        var stats = await CreateService(db).GetDashboardStatsAsync();

        var uia = Assert.Single(stats.AgencyScorecard);
        Assert.Equal(50, Read<int>(uia, "slaCompliance"));
    }

    [Fact]
    public async Task AgencyScorecard_reports_a_fast_turnaround_in_minutes_not_as_zero_hours()
    {
        var db = TestDbFactory.Create();
        var created = DateTimeOffset.UtcNow.AddMinutes(-30);
        var ticket = Ticket("T-1", TicketStatus.Resolved, "UIA",
            resolvedAt: created.AddMinutes(20));
        ticket.CreatedAt = created;
        db.Tickets.Add(ticket);
        await db.SaveChangesAsync();

        var stats = await CreateService(db).GetDashboardStatsAsync();

        var uia = Assert.Single(stats.AgencyScorecard);
        Assert.Equal("20m", Read<string>(uia, "avgResponseTime"));
    }

    [Fact]
    public async Task AgencyScorecard_shows_a_dash_when_nothing_has_been_resolved_yet()
    {
        var db = TestDbFactory.Create();
        db.Tickets.Add(Ticket("T-1", TicketStatus.InProgress, "UIA"));
        await db.SaveChangesAsync();

        var stats = await CreateService(db).GetDashboardStatsAsync();

        var uia = Assert.Single(stats.AgencyScorecard);
        Assert.Equal("—", Read<string>(uia, "avgResponseTime"));
    }

    [Fact]
    public async Task Alerts_flag_an_open_ticket_past_its_sla_deadline()
    {
        var db = TestDbFactory.Create();
        db.Tickets.Add(Ticket("T-1", TicketStatus.InProgress, "UIA",
            slaDeadline: DateTimeOffset.UtcNow.AddHours(-2)));
        await db.SaveChangesAsync();

        var stats = await CreateService(db).GetDashboardStatsAsync();

        var alert = Assert.Single(stats.Alerts);
        Assert.Equal("sla_breach", Read<string>(alert, "type"));
        Assert.Equal("critical", Read<string>(alert, "severity"));
        Assert.Equal("T-1", Read<string?>(alert, "relatedTicketId"));
        // Deterministic id, so a client-side acknowledgement survives a refresh.
        Assert.Equal("sla-T-1", Read<string>(alert, "id"));
    }

    [Fact]
    public async Task Alerts_ignore_a_resolved_ticket_even_if_its_deadline_passed()
    {
        var db = TestDbFactory.Create();
        db.Tickets.Add(Ticket("T-1", TicketStatus.Resolved, "UIA",
            slaDeadline: DateTimeOffset.UtcNow.AddHours(-2),
            resolvedAt: DateTimeOffset.UtcNow.AddHours(-1)));
        await db.SaveChangesAsync();

        var stats = await CreateService(db).GetDashboardStatsAsync();

        Assert.Empty(stats.Alerts);
    }

    [Fact]
    public async Task Alerts_flag_open_vip_cases()
    {
        var db = TestDbFactory.Create();
        db.Tickets.Add(Ticket("T-1", TicketStatus.InProgress, "UIA",
            category: TicketCategory.Vip, slaDeadline: DateTimeOffset.UtcNow.AddHours(5)));
        await db.SaveChangesAsync();

        var stats = await CreateService(db).GetDashboardStatsAsync();

        var alert = Assert.Single(stats.Alerts);
        Assert.Equal("vip_delay", Read<string>(alert, "type"));
        Assert.Equal("high", Read<string>(alert, "severity"));
    }

    [Fact]
    public async Task Alerts_flag_large_investments_that_are_still_open()
    {
        var db = TestDbFactory.Create();
        db.Tickets.AddRange(
            Ticket("T-BIG", TicketStatus.InProgress, "UIA",
                slaDeadline: DateTimeOffset.UtcNow.AddHours(5), investmentSize: "USD 25,000,000"),
            Ticket("T-SMALL", TicketStatus.InProgress, "UIA",
                slaDeadline: DateTimeOffset.UtcNow.AddHours(5), investmentSize: "USD 50,000"));
        await db.SaveChangesAsync();

        var stats = await CreateService(db).GetDashboardStatsAsync();

        var alert = Assert.Single(stats.Alerts);
        Assert.Equal("large_investment", Read<string>(alert, "type"));
        Assert.Equal("T-BIG", Read<string?>(alert, "relatedTicketId"));
    }

    [Fact]
    public async Task Alerts_flag_an_agency_carrying_a_large_open_queue()
    {
        var db = TestDbFactory.Create();
        var future = DateTimeOffset.UtcNow.AddHours(5);
        for (var i = 1; i <= 5; i++)
            db.Tickets.Add(Ticket($"T-{i}", TicketStatus.New, "URSB", slaDeadline: future));
        await db.SaveChangesAsync();

        var stats = await CreateService(db).GetDashboardStatsAsync();

        var volume = stats.Alerts.Single(a => Read<string>(a, "type") == "high_volume");
        Assert.Equal("vol-URSB", Read<string>(volume, "id"));
    }

    [Fact]
    public async Task Alerts_are_empty_when_everything_is_on_track()
    {
        var db = TestDbFactory.Create();
        db.Tickets.Add(Ticket("T-1", TicketStatus.InProgress, "UIA",
            slaDeadline: DateTimeOffset.UtcNow.AddHours(6)));
        await db.SaveChangesAsync();

        var stats = await CreateService(db).GetDashboardStatsAsync();

        Assert.Empty(stats.Alerts);
    }

    [Fact]
    public async Task RecentActivity_describes_what_happened_to_each_ticket()
    {
        var db = TestDbFactory.Create();
        db.Tickets.AddRange(
            Ticket("T-NEW", TicketStatus.New, "UIA"),
            Ticket("T-DONE", TicketStatus.Resolved, "UIA",
                resolvedAt: DateTimeOffset.UtcNow.AddMinutes(-5)));
        await db.SaveChangesAsync();

        var stats = await CreateService(db).GetDashboardStatsAsync();

        Assert.Equal(2, stats.RecentActivity.Count);
        // Newest first — the resolution happened most recently.
        Assert.Equal("resolution", Read<string>(stats.RecentActivity[0], "type"));
        Assert.Equal("inquiry", Read<string>(stats.RecentActivity[1], "type"));
    }

    [Fact]
    public async Task EscalatedTickets_excludes_ones_that_have_since_been_resolved()
    {
        var db = TestDbFactory.Create();
        var stillOpen = Ticket("T-OPEN", TicketStatus.InProgress, "UIA");
        stillOpen.IsEscalated = true;
        var nowClosed = Ticket("T-DONE", TicketStatus.Resolved, "UIA", resolvedAt: DateTimeOffset.UtcNow);
        nowClosed.IsEscalated = true;
        db.Tickets.AddRange(stillOpen, nowClosed);
        await db.SaveChangesAsync();

        var stats = await CreateService(db).GetDashboardStatsAsync();

        // IsEscalated is never cleared on resolution (see TicketService.MarkEscalated),
        // so counting it without a status filter would include T-DONE even though
        // nothing is "awaiting officer action" on a resolved ticket.
        Assert.Equal(1, stats.EscalatedTickets);
    }

    [Fact]
    public async Task NewOrAssignedTickets_counts_only_those_two_statuses()
    {
        var db = TestDbFactory.Create();
        db.Tickets.AddRange(
            Ticket("T-1", TicketStatus.New, "UIA"),
            Ticket("T-2", TicketStatus.Assigned, "UIA"),
            Ticket("T-3", TicketStatus.InProgress, "UIA"),
            Ticket("T-4", TicketStatus.PendingExternal, "UIA"));
        await db.SaveChangesAsync();

        var stats = await CreateService(db).GetDashboardStatsAsync();

        Assert.Equal(2, stats.NewOrAssignedTickets);
    }

    [Fact]
    public async Task PendingExternalTickets_counts_only_that_status()
    {
        var db = TestDbFactory.Create();
        db.Tickets.AddRange(
            Ticket("T-1", TicketStatus.PendingExternal, "UIA"),
            Ticket("T-2", TicketStatus.InProgress, "UIA"),
            Ticket("T-3", TicketStatus.Resolved, "UIA", resolvedAt: DateTimeOffset.UtcNow));
        await db.SaveChangesAsync();

        var stats = await CreateService(db).GetDashboardStatsAsync();

        Assert.Equal(1, stats.PendingExternalTickets);
    }

    [Fact]
    public async Task SlaComplianceOverall_counts_a_ticket_that_breached_before_it_was_resolved()
    {
        var db = TestDbFactory.Create();
        var deadline = DateTimeOffset.UtcNow.AddHours(-2);
        // Resolved, but after its own deadline — a real breach the old formula
        // (breached-open / all-open) couldn't see at all once a ticket closes.
        db.Tickets.Add(Ticket("T-LATE", TicketStatus.Resolved, "UIA",
            slaDeadline: deadline, resolvedAt: deadline.AddHours(1)));
        await db.SaveChangesAsync();

        var stats = await CreateService(db).GetDashboardStatsAsync();

        Assert.Equal(0, stats.SlaComplianceOverall);
    }

    [Fact]
    public async Task SlaComplianceOverall_is_100_when_no_ticket_carries_a_deadline()
    {
        var db = TestDbFactory.Create();
        db.Tickets.Add(Ticket("T-1", TicketStatus.New, "UIA"));
        await db.SaveChangesAsync();

        var stats = await CreateService(db).GetDashboardStatsAsync();

        Assert.Equal(100, stats.SlaComplianceOverall);
    }

    [Fact]
    public async Task SlaComplianceOverall_matches_the_agency_scorecards_definition()
    {
        // One UIA ticket resolved on time, one resolved late — the scorecard
        // (which already handled resolved-late tickets correctly) and the
        // headline gauge it summarizes should now agree: 50% either way.
        var db = TestDbFactory.Create();
        var deadline = DateTimeOffset.UtcNow.AddHours(-1);
        db.Tickets.AddRange(
            Ticket("T-ONTIME", TicketStatus.Resolved, "UIA", slaDeadline: deadline.AddHours(2), resolvedAt: deadline),
            Ticket("T-LATE", TicketStatus.Resolved, "UIA", slaDeadline: deadline, resolvedAt: deadline.AddHours(2)));
        await db.SaveChangesAsync();

        var stats = await CreateService(db).GetDashboardStatsAsync();

        var uia = Assert.Single(stats.AgencyScorecard);
        Assert.Equal(Read<int>(uia, "slaCompliance"), stats.SlaComplianceOverall);
    }
}
