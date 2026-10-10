using FluentValidation;
using OscApi.Common;
using OscApi.Dtos.Tickets;
using OscApi.Models;
using OscApi.Services;
using OscApi.Tests.Helpers;

namespace OscApi.Tests.Services;

/// <summary>
/// Routing between agencies, assignment to real staff accounts, the assignment
/// history, status transition rules, the SLA monitor and the handling metrics.
/// </summary>
public class TicketAssignmentTests
{
    private readonly string _dbName = Guid.NewGuid().ToString();
    private readonly MockSettingsService _settings = new();
    private readonly TicketService _svc;

    private static readonly StaffActor Admin = new("Admin User", "admin@uia.go.ug");

    public TicketAssignmentTests()
    {
        var db = TestDbFactory.Create(_dbName);
        _svc = new TicketService(db, MockEmailService.Create(), new ReferenceNumberGenerator(db), _settings);

        db.AdminUsers.AddRange(
            new AdminUser { Name = "Admin User", Email = "admin@uia.go.ug", Role = Roles.Admin },
            new AdminUser { Name = "Grace Akello", Email = "grace@uia.go.ug", Role = Roles.AgencyOfficer, AgencyCode = "UIA" },
            new AdminUser { Name = "Moses Okello", Email = "moses@ursb.go.ug", Role = Roles.AgencyOfficer, AgencyCode = "URSB" },
            new AdminUser { Name = "Former Officer", Email = "gone@ursb.go.ug", Role = Roles.AgencyOfficer, AgencyCode = "URSB", IsActive = false },
            new AdminUser { Name = "Ruth Nakato", Email = "ruth@ura.go.ug", Role = Roles.AgencyOfficer, AgencyCode = "URA" });
        db.SaveChanges();
    }

    private Ticket Load(string reference) => TestDbFactory.Create(_dbName).Tickets.Single(t => t.ReferenceNumber == reference);

    private List<TicketEvent> Events(string reference)
    {
        var db = TestDbFactory.Create(_dbName);
        var id = db.Tickets.Single(t => t.ReferenceNumber == reference).Id;
        return db.TicketEvents.Where(e => e.TicketId == id).OrderBy(e => e.OccurredAt).ToList();
    }

    private async Task<(string Ref, string Token)> File(string category = "general_inquiry")
    {
        var created = await _svc.CreateAsync(new CreateTicketRequest(
            "Trading licence", "Waiting three weeks", category, null,
            "investor@example.com", "Investor", null, null, null, null), isStaff: false);
        string Prop(string n) => created.GetType().GetProperty(n)!.GetValue(created)!.ToString()!;
        return (Prop("ReferenceNumber"), Prop("AccessToken"));
    }

    private static UpdateTicketRequest Update(string? status = null, string? assignee = null, string? agency = null, string? note = null, string? priority = null) =>
        new(status, priority, assignee, agency, null, null, null, note);

    // ── Routing ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task FrontDesk_RoutesAnywhere_AndTheTransferIsRecorded()
    {
        var (reference, _) = await File();

        await _svc.UpdateAsync(reference, Update(agency: "URSB"), agencyScope: "UIA", new StaffActor("Grace Akello", "grace@uia.go.ug"));

        Assert.Equal("URSB", Load(reference).AssignedAgencyCode);
        var routed = Assert.Single(Events(reference), e => e.Type == TicketEventType.AgencyChanged);
        Assert.Equal(("UIA", "URSB", "Grace Akello"), (routed.FromValue, routed.ToValue, routed.ActorName));
    }

    [Fact]
    public async Task OtherAgencies_CannotRouteSideways_OnlyBackToTheFrontDesk()
    {
        var (reference, _) = await File();
        await _svc.UpdateAsync(reference, Update(agency: "URSB"), actor: Admin);
        var ursb = new StaffActor("Moses Okello", "moses@ursb.go.ug");

        await Assert.ThrowsAsync<ValidationException>(() =>
            _svc.UpdateAsync(reference, Update(agency: "URA"), agencyScope: "URSB", ursb));
        Assert.Equal("URSB", Load(reference).AssignedAgencyCode);

        Assert.NotNull(await _svc.UpdateAsync(reference, Update(agency: "UIA"), agencyScope: "URSB", ursb));
        Assert.Equal("UIA", Load(reference).AssignedAgencyCode);
    }

    [Fact]
    public async Task Transfer_HandsTheCaseToTheNewQueue_Unassigned()
    {
        var (reference, _) = await File();
        await _svc.UpdateAsync(reference, Update(assignee: "grace@uia.go.ug"), actor: Admin);
        Assert.Equal(TicketStatus.Assigned, Load(reference).Status);

        await _svc.UpdateAsync(reference, Update(agency: "URSB"), actor: Admin);

        var t = Load(reference);
        Assert.Null(t.Assignee);
        Assert.Null(t.AssigneeUserId);
        Assert.Equal(TicketStatus.New, t.Status);
    }

    [Fact]
    public async Task FinishedTickets_CannotBeTransferred()
    {
        var (reference, _) = await File();
        await _svc.UpdateAsync(reference, Update(status: "resolved", note: "Licence issued"), actor: Admin);

        await Assert.ThrowsAsync<ValidationException>(() => _svc.UpdateAsync(reference, Update(agency: "URSB"), actor: Admin));
    }

    // ── Assignment ──────────────────────────────────────────────────────────

    [Theory]
    [InlineData("nobody@uia.go.ug")]   // no such account
    [InlineData("gone@ursb.go.ug")]    // deactivated
    [InlineData("ruth@ura.go.ug")]     // an officer of another agency
    public async Task Assignee_MustBeAnActiveAccountThatCanSeeTheTicket(string email)
    {
        var (reference, _) = await File();
        await _svc.UpdateAsync(reference, Update(agency: "URSB"), actor: Admin);

        await Assert.ThrowsAsync<ValidationException>(() => _svc.UpdateAsync(reference, Update(assignee: email), actor: Admin));
        Assert.Null(Load(reference).Assignee);
    }

    [Fact]
    public async Task Assigning_StoresTheAccount_StampsAssignedAt_AndRecordsIt()
    {
        var (reference, _) = await File();
        await _svc.UpdateAsync(reference, Update(agency: "URSB"), actor: Admin);

        await _svc.UpdateAsync(reference, Update(assignee: "moses@ursb.go.ug"), actor: Admin);

        var t = Load(reference);
        Assert.Equal("Moses Okello", t.Assignee);
        Assert.NotNull(t.AssigneeUserId);
        Assert.NotNull(t.AssignedAt);
        Assert.Contains(Events(reference), e => e.Type == TicketEventType.AssigneeChanged && e.ToValue == "Moses Okello");
    }

    [Fact]
    public async Task Unassigning_AnAssignedTicket_ReturnsItToNew()
    {
        var (reference, _) = await File();
        await _svc.UpdateAsync(reference, Update(assignee: "grace@uia.go.ug"), actor: Admin);

        await _svc.UpdateAsync(reference, Update(assignee: ""), actor: Admin);

        var t = Load(reference);
        Assert.Null(t.AssigneeUserId);
        Assert.Equal(TicketStatus.New, t.Status);
    }

    [Fact]
    public async Task EscalationDefault_ThatIsNotAValidAccount_IsNotAssigned()
    {
        await _settings.SetAsync(SettingsService.EscalationDefaultAssigneeKey, "Senior Investment Officer", null, null);
        var (reference, token) = await File();

        await _svc.PublicUpdateAsync(reference, new PublicTicketUpdateRequest(token, true, null, null),
            new TicketRequester(false, null, token, null));

        var t = Load(reference);
        Assert.True(t.IsEscalated);
        Assert.Null(t.Assignee);
        Assert.Equal(TicketStatus.New, t.Status);
    }

    [Fact]
    public async Task AssignableOfficers_AreTheAgencysActiveOfficersAndAdmins()
    {
        var officers = await _svc.ListAssignableOfficersAsync("URSB");
        var emails = officers.Select(o => o.GetType().GetProperty("Email")!.GetValue(o)!.ToString()).ToList();

        Assert.Equal(["moses@ursb.go.ug", "admin@uia.go.ug"], emails);
    }

    // ── Status rules ────────────────────────────────────────────────────────

    [Fact]
    public async Task Status_FollowsTheLifecycle()
    {
        var (reference, _) = await File();

        // "Assigned" needs an officer.
        await Assert.ThrowsAsync<ValidationException>(() => _svc.UpdateAsync(reference, Update(status: "assigned"), actor: Admin));

        await _svc.UpdateAsync(reference, Update(status: "in_progress"), actor: Admin);
        // Work doesn't go back to the triage queue by hand.
        await Assert.ThrowsAsync<ValidationException>(() => _svc.UpdateAsync(reference, Update(status: "new"), actor: Admin));

        await _svc.UpdateAsync(reference, Update(status: "closed", note: "Duplicate of an existing case"), actor: Admin);
        // A closed ticket can only be reopened.
        await Assert.ThrowsAsync<ValidationException>(() =>
            _svc.UpdateAsync(reference, Update(status: "resolved", note: "x"), actor: Admin));
        await _svc.UpdateAsync(reference, Update(status: "in_progress"), actor: Admin);
        Assert.Equal(TicketStatus.InProgress, Load(reference).Status);
    }

    [Fact]
    public async Task Resolving_NeedsANote_WhichIsPostedToTheInvestor()
    {
        var (reference, token) = await File();

        await Assert.ThrowsAsync<ValidationException>(() => _svc.UpdateAsync(reference, Update(status: "resolved"), actor: Admin));

        await _svc.UpdateAsync(reference, Update(status: "resolved", note: "Your licence was issued today."), actor: Admin);

        var t = Load(reference);
        Assert.Equal(TicketStatus.Resolved, t.Status);
        Assert.NotNull(t.FirstResponseAt);
        var messages = (IEnumerable<object>)(await _svc.GetMessagesAsync(reference, new TicketRequester(false, null, token, null)))!;
        var note = Assert.Single(messages);
        Assert.Equal("Your licence was issued today.", note.GetType().GetProperty("Content")!.GetValue(note));
    }

    [Fact]
    public async Task ClosingAResolvedTicket_NeedsNoFurtherNote()
    {
        var (reference, _) = await File();
        await _svc.UpdateAsync(reference, Update(status: "resolved", note: "Done"), actor: Admin);

        await _svc.UpdateAsync(reference, Update(status: "closed"), actor: Admin);

        Assert.Equal(TicketStatus.Closed, Load(reference).Status);
    }

    // ── SLA monitor ─────────────────────────────────────────────────────────

    private void MakeOverdue(string reference, TicketStatus? status = null)
    {
        var db = TestDbFactory.Create(_dbName);
        var t = db.Tickets.Single(x => x.ReferenceNumber == reference);
        t.SlaDeadlineAt = DateTimeOffset.UtcNow.AddHours(-1);
        if (status is { } s) t.Status = s;
        db.SaveChanges();
    }

    [Fact]
    public async Task SlaMonitor_FlagsAndEscalatesOverdueOpenTickets_Once()
    {
        var (overdue, _) = await File();
        var (finished, _) = await File();
        var (onTime, _) = await File();
        MakeOverdue(overdue);
        MakeOverdue(finished, TicketStatus.Resolved);

        Assert.Equal(1, await _svc.ProcessSlaBreachesAsync());

        var t = Load(overdue);
        Assert.NotNull(t.SlaBreachedAt);
        Assert.True(t.IsEscalated);
        Assert.Contains(Events(overdue), e => e.Type == TicketEventType.SlaBreached && e.ActorName == "SLA monitor");
        Assert.Null(Load(finished).SlaBreachedAt);
        Assert.Null(Load(onTime).SlaBreachedAt);

        // Already acted on: the next pass doesn't alert again.
        Assert.Equal(0, await _svc.ProcessSlaBreachesAsync());
    }

    [Fact]
    public async Task RelaxingPriority_PastTheBreach_RearmsTheMonitor()
    {
        var (reference, _) = await File("complaint"); // high → 8 business hours
        MakeOverdue(reference);
        await _svc.ProcessSlaBreachesAsync();

        // A low-priority SLA from a just-filed ticket is back in the future.
        await _svc.UpdateAsync(reference, Update(priority: "low"), actor: Admin);

        Assert.Null(Load(reference).SlaBreachedAt);
    }

    // ── Visibility and metrics ──────────────────────────────────────────────

    [Fact]
    public async Task History_IsStaffOnly()
    {
        var (reference, token) = await File();
        await _svc.UpdateAsync(reference, Update(agency: "URSB"), actor: Admin);

        static object? History(object ticket) => ticket.GetType().GetProperty("history")!.GetValue(ticket);
        Assert.NotNull(History((await _svc.GetAsync(reference, new TicketRequester(true, null, null, null)))!));
        Assert.Null(History((await _svc.GetAsync(reference, new TicketRequester(false, null, token, null)))!));
    }

    [Fact]
    public async Task BoardStats_SeparateTriageFromFirstResponse()
    {
        var (reference, _) = await File();
        await _svc.UpdateAsync(reference, Update(assignee: "grace@uia.go.ug"), actor: Admin);
        await _svc.PostStaffMessageAsync(reference, "We're on it", "Grace Akello", "grace@uia.go.ug", isInternal: false);

        var result = await _svc.ListAsync(new TicketListQuery());
        var stats = result.GetType().GetProperty("stats")!.GetValue(result)!;
        Assert.NotNull(stats.GetType().GetProperty("avgTimeToAssignHours")!.GetValue(stats));
        Assert.NotNull(stats.GetType().GetProperty("avgFirstResponseHours")!.GetValue(stats));
    }

    [Fact]
    public async Task InternalNotes_DoNotCountAsAFirstResponse()
    {
        var (reference, _) = await File();
        await _svc.PostStaffMessageAsync(reference, "Checking with URSB", "Grace Akello", "grace@uia.go.ug", isInternal: true);
        Assert.Null(Load(reference).FirstResponseAt);
    }
}
