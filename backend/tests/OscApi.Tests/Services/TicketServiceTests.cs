using OscApi.Common;
using OscApi.Dtos.Tickets;
using OscApi.Models;
using OscApi.Services;
using OscApi.Tests.Helpers;

namespace OscApi.Tests.Services;

public class TicketServiceTests
{
    private TicketService CreateService(string? dbName = null)
    {
        var db = TestDbFactory.Create(dbName);
        var email = MockEmailService.Create();
        var refGen = new ReferenceNumberGenerator(db);
        var settings = new MockSettingsService();
        return new TicketService(db, email, refGen, settings);
    }

    // These tests exercise staff behaviour (priority honoured); the public path
    // has its own tests below.
    private static Task<object> Create(TicketService svc, CreateTicketRequest r) => svc.CreateAsync(r, isStaff: true);

    private static readonly TicketRequester Staff = new(true, null, null, null);

    [Fact]
    public async Task CreateAsync_ReturnsReferenceNumber()
    {
        var svc = CreateService();
        var request = new CreateTicketRequest(
            Title: "Test ticket",
            Description: "Test description",
            Category: "general_inquiry",
            Priority: "medium",
            ContactEmail: "test@example.com",
            ContactName: "John Doe",
            ContactPhone: null, InvestorNationality: null,
            Sector: null, InvestmentSize: null, IsEscalated: false);

        var result = await Create(svc, request);

        Assert.NotNull(result);
        var dict = result.GetType().GetProperties()
            .ToDictionary(p => p.Name, p => p.GetValue(result));
        Assert.StartsWith("UIA-", dict["ReferenceNumber"]?.ToString());
        Assert.Equal(TicketStatus.New, dict["Status"]);
    }

    [Fact]
    public async Task CreateAsync_SequentialRefsIncrement()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        var req = new CreateTicketRequest("T1", "D1", "general_inquiry", "low",
            "a@b.com", "A", null, null, null, null, false);

        var r1 = await Create(svc, req);
        var r2 = await Create(svc, req with { Title = "T2" });

        var ref1 = r1.GetType().GetProperty("ReferenceNumber")!.GetValue(r1)!.ToString()!;
        var ref2 = r2.GetType().GetProperty("ReferenceNumber")!.GetValue(r2)!.ToString()!;

        Assert.EndsWith("0001", ref1);
        Assert.EndsWith("0002", ref2);
    }

    [Fact]
    public async Task CreateAsync_EmptyPriority_DefaultsToCategoryPriorityWithoutThrowing()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        // An empty priority string slipped past validation and used to throw in
        // Enum.Parse; it must now fall back to the category's default (low for
        // a general inquiry).
        var req = new CreateTicketRequest("T1", "D1", "general_inquiry", Priority: "",
            "a@b.com", "A", null, null, null, null, false);

        var result = await Create(svc, req);
        Assert.NotNull(result);

        var db = TestDbFactory.Create(dbName);
        var ticket = db.Tickets.First();
        Assert.Equal(TicketPriority.Low, ticket.Priority);
    }

    [Fact]
    public async Task CreateAsync_ReferenceSequence_IsCorrectPast9999()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);
        var year = DateTime.UtcNow.Year;

        var req = new CreateTicketRequest("T1", "D1", "general_inquiry", "low",
            "a@b.com", "A", null, null, null, null, false);
        await Create(svc, req);

        // Force the latest reference to the 4-digit ceiling. Lexicographic ordering
        // would then pick "…-9999" over "…-10000"; the numeric max must not.
        using (var seed = TestDbFactory.Create(dbName))
        {
            var t = seed.Tickets.First();
            t.ReferenceNumber = $"UIA-{year}-9999";
            seed.SaveChanges();
        }

        var next = await Create(svc, req with { Title = "T2" });
        var nextRef = next.GetType().GetProperty("ReferenceNumber")!.GetValue(next)!.ToString()!;
        Assert.Equal($"UIA-{year}-10000", nextRef);
    }

    [Fact]
    public async Task ListAsync_ReturnsTicketsAndTotal()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        await Create(svc, new CreateTicketRequest("T1", "D1", "general_inquiry", "low",
            "a@b.com", "A", null, null, null, null, false));
        await Create(svc, new CreateTicketRequest("T2", "D2", "complaint", "high",
            "b@b.com", "B", null, null, null, null, false));

        var result = await svc.ListAsync(new TicketListQuery());
        var total = (int)result.GetType().GetProperty("total")!.GetValue(result)!;

        Assert.Equal(2, total);
    }

    [Fact]
    public async Task GetAsync_ReturnsNullForMissing()
    {
        var svc = CreateService();
        var result = await svc.GetAsync("NONEXISTENT", Staff);
        Assert.Null(result);
    }

    [Fact]
    public async Task GetAsync_DeniesWrongTokenAndOtherAccounts()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        await Create(svc, new CreateTicketRequest("T1", "D1", "general_inquiry", "low",
            "owner@example.com", "Owner", null, null, null, null, false));

        var db = TestDbFactory.Create(dbName);
        var ticket = db.Tickets.First();

        Assert.Null(await svc.GetAsync(ticket.ReferenceNumber, new TicketRequester(false, null, "wrong-token", null)));
        Assert.Null(await svc.GetAsync(ticket.ReferenceNumber, new TicketRequester(false, null, null, "someone@else.com")));
        Assert.NotNull(await svc.GetAsync(ticket.ReferenceNumber, new TicketRequester(false, null, ticket.AccessToken, null)));
        Assert.NotNull(await svc.GetAsync(ticket.ReferenceNumber, new TicketRequester(false, null, null, "owner@example.com")));
    }

    [Fact]
    public async Task GetAsync_AllowsStaffWithoutToken()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        await Create(svc, new CreateTicketRequest("T1", "D1", "general_inquiry", "low",
            "owner@example.com", "Owner", null, null, null, null, false));

        var db = TestDbFactory.Create(dbName);
        var ticket = db.Tickets.First();

        var result = await svc.GetAsync(ticket.ReferenceNumber, Staff);
        Assert.NotNull(result);
    }

    [Fact]
    public async Task UpdateAsync_ChangesStatus()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        await Create(svc, new CreateTicketRequest("T1", "D1", "general_inquiry", "low",
            "a@b.com", "A", null, null, null, null, false));

        var db = TestDbFactory.Create(dbName);
        var ticket = db.Tickets.First();

        var result = await svc.UpdateAsync(ticket.ReferenceNumber,
            new UpdateTicketRequest(Status: "resolved", null, null, null, null, null, null, ResolutionNote: "Answered by phone"));

        Assert.NotNull(result);
        var status = result.GetType().GetProperty("Status")!.GetValue(result);
        Assert.Equal(TicketStatus.Resolved, status);
    }

    [Fact]
    public async Task UpdateAsync_Reopening_ClearsResolvedAndClosedAt()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        await Create(svc, new CreateTicketRequest("T1", "D1", "general_inquiry", "low",
            "a@b.com", "A", null, null, null, null, false));

        var db = TestDbFactory.Create(dbName);
        var reference = db.Tickets.First().ReferenceNumber;

        await svc.UpdateAsync(reference,
            new UpdateTicketRequest(Status: "closed", null, null, null, null, null, null, ResolutionNote: "Answered by phone"));
        var closed = TestDbFactory.Create(dbName).Tickets.First(t => t.ReferenceNumber == reference);
        Assert.NotNull(closed.ClosedAt);

        // Reopening must not leave a stale ResolvedAt/ClosedAt behind — otherwise a
        // ticket back in progress still counts as "resolved" in SLA/resolution-time
        // aggregates and still shows a resolution timestamp on its detail page.
        await svc.UpdateAsync(reference,
            new UpdateTicketRequest(Status: "in_progress", null, null, null, null, null, null));
        var reopened = TestDbFactory.Create(dbName).Tickets.First(t => t.ReferenceNumber == reference);
        Assert.Null(reopened.ResolvedAt);
        Assert.Null(reopened.ClosedAt);
    }

    [Fact]
    public async Task UpdateAsync_ResolvedThenClosed_KeepsOriginalResolvedAt()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        await Create(svc, new CreateTicketRequest("T1", "D1", "general_inquiry", "low",
            "a@b.com", "A", null, null, null, null, false));

        var db = TestDbFactory.Create(dbName);
        var reference = db.Tickets.First().ReferenceNumber;

        await svc.UpdateAsync(reference,
            new UpdateTicketRequest(Status: "resolved", null, null, null, null, null, null, ResolutionNote: "Answered by phone"));
        var resolved = TestDbFactory.Create(dbName).Tickets.First(t => t.ReferenceNumber == reference);
        Assert.NotNull(resolved.ResolvedAt);
        var resolvedAt = resolved.ResolvedAt;

        // Closing a resolved ticket is the normal forward path, not a reopen — it
        // must not wipe the original resolution timestamp that SLA/resolution-time
        // aggregates in DashboardService depend on.
        await svc.UpdateAsync(reference,
            new UpdateTicketRequest(Status: "closed", null, null, null, null, null, null));
        var closed = TestDbFactory.Create(dbName).Tickets.First(t => t.ReferenceNumber == reference);
        Assert.Equal(resolvedAt, closed.ResolvedAt);
        Assert.NotNull(closed.ClosedAt);
    }

    [Fact]
    public async Task UpdateAsync_ClosedDirectly_BackfillsResolvedAt()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        await Create(svc, new CreateTicketRequest("T1", "D1", "general_inquiry", "low",
            "a@b.com", "A", null, null, null, null, false));

        var db = TestDbFactory.Create(dbName);
        var reference = db.Tickets.First().ReferenceNumber;

        // Closed without ever passing through Resolved — should still count as
        // resolved for aggregates rather than looking like an open SLA breach.
        await svc.UpdateAsync(reference,
            new UpdateTicketRequest(Status: "closed", null, null, null, null, null, null, ResolutionNote: "Answered by phone"));
        var closed = TestDbFactory.Create(dbName).Tickets.First(t => t.ReferenceNumber == reference);
        Assert.NotNull(closed.ResolvedAt);
        Assert.NotNull(closed.ClosedAt);
    }

    [Fact]
    public async Task UpdateAsync_ReturnsNullForMissing()
    {
        var svc = CreateService();
        var result = await svc.UpdateAsync("NONEXISTENT",
            new UpdateTicketRequest("resolved", null, null, null, null, null, null));
        Assert.Null(result);
    }

    [Fact]
    public async Task PostStaffMessageAsync_AddsOfficerMessage()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        await Create(svc, new CreateTicketRequest("T1", "D1", "general_inquiry", "low",
            "a@b.com", "A", null, null, null, null, false));

        var db = TestDbFactory.Create(dbName);
        var ticket = db.Tickets.First();

        var result = await svc.PostStaffMessageAsync(ticket.ReferenceNumber,
            "Internal note", "Admin", "admin@test.com", isInternal: true);
        Assert.NotNull(result);

        var messages = await svc.GetMessagesAsync(ticket.ReferenceNumber, Staff);
        Assert.NotNull(messages);
    }

    [Fact]
    public async Task PostPublicComment_RequiresOwnership()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        await Create(svc, new CreateTicketRequest("T1", "D1", "general_inquiry", "low",
            "owner@b.com", "Owner", null, null, null, null, false));

        var db = TestDbFactory.Create(dbName);
        var ticket = db.Tickets.First();

        // A wrong token or another account is rejected; the owner's token is
        // accepted, and the author is always the filer with the investor role.
        Assert.Null(await svc.PostPublicCommentAsync(ticket.ReferenceNumber, "Hi", new TicketRequester(false, null, "guess", null)));
        Assert.Null(await svc.PostPublicCommentAsync(ticket.ReferenceNumber, "Hi", new TicketRequester(false, null, null, "intruder@evil.com")));
        var ok = await svc.PostPublicCommentAsync(ticket.ReferenceNumber, "Any update?", new TicketRequester(false, null, ticket.AccessToken, null));
        Assert.NotNull(ok);
        var saved = TestDbFactory.Create(dbName).TicketMessages.Single();
        Assert.Equal("Owner", saved.AuthorName);
        Assert.Equal(AuthorRole.Investor, saved.AuthorRole);
    }
}
