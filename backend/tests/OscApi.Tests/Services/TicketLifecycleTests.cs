using FluentValidation;
using OscApi.Common;
using OscApi.Dtos.Tickets;
using OscApi.Models;
using OscApi.Services;
using OscApi.Tests.Helpers;

namespace OscApi.Tests.Services;

/// <summary>Creation rules, escalation, SLA re-derivation and status bookkeeping.</summary>
public class TicketLifecycleTests
{
    private static (TicketService Svc, string DbName, MockSettingsService Settings) Create()
    {
        var dbName = Guid.NewGuid().ToString();
        var db = TestDbFactory.Create(dbName);
        var settings = new MockSettingsService();
        return (new TicketService(db, MockEmailService.Create(), new ReferenceNumberGenerator(db), settings), dbName, settings);
    }

    private static CreateTicketRequest Request(string category = "general_inquiry", string? priority = null, bool escalated = false) =>
        new("Licence stuck", "My licence has been pending for weeks", category, priority,
            "investor@example.com", "Investor", null, null, null, null, escalated);

    private static Ticket Load(string dbName) => TestDbFactory.Create(dbName).Tickets.Single();

    private static UpdateTicketRequest Update(string? status = null, string? priority = null, string? assignee = null, string? agency = null) =>
        new(status, priority, assignee, agency, null, null, null);

    [Fact]
    public async Task PublicFiling_IgnoresRequestedPriority_AndUsesTheCategoryDefault()
    {
        var (svc, db, _) = Create();
        await svc.CreateAsync(Request("general_inquiry", priority: "critical"), isStaff: false);

        var t = Load(db);
        Assert.Equal(TicketPriority.Low, t.Priority);
        Assert.Equal(24, t.SlaDeadlineHours);
    }

    [Fact]
    public async Task PublicFiling_CannotClaimVip_ButStaffCan()
    {
        var (svc, _, _) = Create();
        await Assert.ThrowsAsync<ValidationException>(() => svc.CreateAsync(Request("vip"), isStaff: false));

        var (staffSvc, db, _) = Create();
        await staffSvc.CreateAsync(Request("vip"), isStaff: true);
        Assert.Equal(TicketCategory.Vip, Load(db).Category);
    }

    [Fact]
    public async Task NewTickets_LandWithTheFrontDesk_AndCarryAnAccessToken()
    {
        var (svc, db, _) = Create();
        await svc.CreateAsync(Request(), isStaff: false);

        var t = Load(db);
        Assert.Equal("UIA", t.AssignedAgencyCode);
        Assert.True(t.AccessToken.Length >= 32);
    }

    [Fact]
    public async Task FilingAsAnEscalation_IsAFullEscalation()
    {
        var (svc, db, settings) = Create();
        await settings.SetAsync(SettingsService.EscalationDefaultAssigneeKey, "Duty Officer", null, null);

        await svc.CreateAsync(Request(escalated: true), isStaff: false);

        var t = Load(db);
        Assert.True(t.IsEscalated);
        Assert.NotNull(t.EscalatedAt);
        Assert.Equal(TicketPriority.High, t.Priority);   // raised from the category's Low
        Assert.Equal("Duty Officer", t.Assignee);         // default assignee applied
        Assert.Equal(TicketStatus.Assigned, t.Status);
    }

    [Fact]
    public async Task LaterEscalation_AppliesTheDefaultAssignee()
    {
        var (svc, db, settings) = Create();
        await settings.SetAsync(SettingsService.EscalationDefaultAssigneeKey, "Duty Officer", null, null);
        await svc.CreateAsync(Request(), isStaff: false);
        var t = Load(db);

        await svc.PublicUpdateAsync(t.ReferenceNumber, new PublicTicketUpdateRequest(t.AccessToken, true, null, null),
            new TicketRequester(false, null, t.AccessToken, null));

        t = Load(db);
        Assert.NotNull(t.EscalatedAt);
        Assert.Equal("Duty Officer", t.Assignee);
    }

    [Fact]
    public async Task PriorityChange_RederivesTheSlaFromFilingTime()
    {
        var (svc, db, _) = Create();
        await svc.CreateAsync(Request(), isStaff: false); // general inquiry, low → 24h
        var t = Load(db);
        Assert.Equal(24, t.SlaDeadlineHours);

        await svc.UpdateAsync(t.ReferenceNumber, Update(priority: "critical"));

        var updated = Load(db);
        Assert.Equal(2, updated.SlaDeadlineHours);
        Assert.Equal(SlaCalculator.AddBusinessHours(t.CreatedAt, 2), updated.SlaDeadlineAt);
    }

    [Fact]
    public async Task ResendingTheSameStatus_DoesNotResetResolvedAt()
    {
        var (svc, db, _) = Create();
        await svc.CreateAsync(Request(), isStaff: false);
        var reference = Load(db).ReferenceNumber;

        await svc.UpdateAsync(reference, Update(status: "resolved"));
        var firstResolvedAt = Load(db).ResolvedAt;
        await Task.Delay(20);
        await svc.UpdateAsync(reference, Update(status: "resolved"));

        Assert.Equal(firstResolvedAt, Load(db).ResolvedAt);
    }

    [Fact]
    public async Task AssigningAnOfficer_MovesANewTicketToAssigned()
    {
        var (svc, db, _) = Create();
        await svc.CreateAsync(Request(), isStaff: false);

        await svc.UpdateAsync(Load(db).ReferenceNumber, Update(assignee: "Sarah Namubiru"));

        var t = Load(db);
        Assert.Equal("Sarah Namubiru", t.Assignee);
        Assert.Equal(TicketStatus.Assigned, t.Status);
    }

    [Fact]
    public async Task ClosedTickets_RejectComments_AndResolvedOnesRejectEscalation()
    {
        var (svc, db, _) = Create();
        await svc.CreateAsync(Request(), isStaff: false);
        var t = Load(db);
        var owner = new TicketRequester(false, null, t.AccessToken, null);

        await svc.UpdateAsync(t.ReferenceNumber, Update(status: "resolved"));
        await Assert.ThrowsAsync<ValidationException>(() => svc.PublicUpdateAsync(t.ReferenceNumber,
            new PublicTicketUpdateRequest(t.AccessToken, true, null, null), owner));

        await svc.UpdateAsync(t.ReferenceNumber, Update(status: "closed"));
        await Assert.ThrowsAsync<ValidationException>(() => svc.PostPublicCommentAsync(t.ReferenceNumber, "hello?", owner));
    }

    [Fact]
    public async Task List_FiltersSearchesAndReportsScopeWideStats()
    {
        var (svc, _, _) = Create();
        await svc.CreateAsync(Request() with { Title = "Land title query" }, isStaff: true);
        var second = await svc.CreateAsync(Request() with { Title = "Power connection" }, isStaff: true);
        var secondRef = second.GetType().GetProperty("ReferenceNumber")!.GetValue(second)!.ToString()!;
        await svc.UpdateAsync(secondRef, Update(status: "resolved"));

        var result = await svc.ListAsync(new TicketListQuery(Q: "power"));
        Assert.Equal(1, (int)result.GetType().GetProperty("total")!.GetValue(result)!);

        var resolved = await svc.ListAsync(new TicketListQuery(Status: "resolved"));
        Assert.Equal(1, (int)resolved.GetType().GetProperty("total")!.GetValue(resolved)!);

        // Stats describe everything in scope, not just the filtered page.
        var stats = resolved.GetType().GetProperty("stats")!.GetValue(resolved)!;
        Assert.Equal(2, (int)stats.GetType().GetProperty("total")!.GetValue(stats)!);
        Assert.Equal(1, (int)stats.GetType().GetProperty("open")!.GetValue(stats)!);
    }

    [Theory]
    [InlineData(TicketStatus.PendingExternal, "Pending External")]
    [InlineData(TicketStatus.InProgress, "In Progress")]
    [InlineData(TicketStatus.New, "New")]
    public void StatusLabel_IsHumanReadable(TicketStatus status, string label) =>
        Assert.Equal(label, TicketService.StatusLabel(status));
}
