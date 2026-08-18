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

        var result = await svc.CreateAsync(request);

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

        var r1 = await svc.CreateAsync(req);
        var r2 = await svc.CreateAsync(req with { Title = "T2" });

        var ref1 = r1.GetType().GetProperty("ReferenceNumber")!.GetValue(r1)!.ToString()!;
        var ref2 = r2.GetType().GetProperty("ReferenceNumber")!.GetValue(r2)!.ToString()!;

        Assert.EndsWith("0001", ref1);
        Assert.EndsWith("0002", ref2);
    }

    [Fact]
    public async Task CreateAsync_EmptyPriority_DefaultsToMediumWithoutThrowing()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        // An empty priority string slipped past validation and used to throw in
        // Enum.Parse; it must now default to medium.
        var req = new CreateTicketRequest("T1", "D1", "general_inquiry", Priority: "",
            "a@b.com", "A", null, null, null, null, false);

        var result = await svc.CreateAsync(req);
        Assert.NotNull(result);

        var db = TestDbFactory.Create(dbName);
        var ticket = db.Tickets.First();
        Assert.Equal(TicketPriority.Medium, ticket.Priority);
    }

    [Fact]
    public async Task CreateAsync_ReferenceSequence_IsCorrectPast9999()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);
        var year = DateTime.UtcNow.Year;

        var req = new CreateTicketRequest("T1", "D1", "general_inquiry", "low",
            "a@b.com", "A", null, null, null, null, false);
        await svc.CreateAsync(req);

        // Force the latest reference to the 4-digit ceiling. Lexicographic ordering
        // would then pick "…-9999" over "…-10000"; the numeric max must not.
        using (var seed = TestDbFactory.Create(dbName))
        {
            var t = seed.Tickets.First();
            t.ReferenceNumber = $"UIA-{year}-9999";
            seed.SaveChanges();
        }

        var next = await svc.CreateAsync(req with { Title = "T2" });
        var nextRef = next.GetType().GetProperty("ReferenceNumber")!.GetValue(next)!.ToString()!;
        Assert.Equal($"UIA-{year}-10000", nextRef);
    }

    [Fact]
    public async Task ListAsync_ReturnsTicketsAndTotal()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        await svc.CreateAsync(new CreateTicketRequest("T1", "D1", "general_inquiry", "low",
            "a@b.com", "A", null, null, null, null, false));
        await svc.CreateAsync(new CreateTicketRequest("T2", "D2", "complaint", "high",
            "b@b.com", "B", null, null, null, null, false));

        var result = await svc.ListAsync(0, 50);
        var total = (int)result.GetType().GetProperty("total")!.GetValue(result)!;

        Assert.Equal(2, total);
    }

    [Fact]
    public async Task GetByRefAsync_ReturnsNullForMissing()
    {
        var svc = CreateService();
        var result = await svc.GetByRefAsync("NONEXISTENT", null, true);
        Assert.Null(result);
    }

    [Fact]
    public async Task GetByRefAsync_DeniesWrongEmail()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        await svc.CreateAsync(new CreateTicketRequest("T1", "D1", "general_inquiry", "low",
            "owner@example.com", "Owner", null, null, null, null, false));

        var db = TestDbFactory.Create(dbName);
        var ticket = db.Tickets.First();

        var result = await svc.GetByRefAsync(ticket.ReferenceNumber, "wrong@example.com", false);
        Assert.Null(result);
    }

    [Fact]
    public async Task GetByRefAsync_AllowsAdminWithoutEmail()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        await svc.CreateAsync(new CreateTicketRequest("T1", "D1", "general_inquiry", "low",
            "owner@example.com", "Owner", null, null, null, null, false));

        var db = TestDbFactory.Create(dbName);
        var ticket = db.Tickets.First();

        var result = await svc.GetByRefAsync(ticket.ReferenceNumber, null, isStaff: true);
        Assert.NotNull(result);
    }

    [Fact]
    public async Task UpdateAsync_ChangesStatus()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        await svc.CreateAsync(new CreateTicketRequest("T1", "D1", "general_inquiry", "low",
            "a@b.com", "A", null, null, null, null, false));

        var db = TestDbFactory.Create(dbName);
        var ticket = db.Tickets.First();

        var result = await svc.UpdateAsync(ticket.ReferenceNumber,
            new UpdateTicketRequest(Status: "resolved", null, null, null, null, null, null));

        Assert.NotNull(result);
        var status = result.GetType().GetProperty("Status")!.GetValue(result);
        Assert.Equal(TicketStatus.Resolved, status);
    }

    [Fact]
    public async Task UpdateAsync_Reopening_ClearsResolvedAndClosedAt()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        await svc.CreateAsync(new CreateTicketRequest("T1", "D1", "general_inquiry", "low",
            "a@b.com", "A", null, null, null, null, false));

        var db = TestDbFactory.Create(dbName);
        var reference = db.Tickets.First().ReferenceNumber;

        await svc.UpdateAsync(reference,
            new UpdateTicketRequest(Status: "closed", null, null, null, null, null, null));
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

        await svc.CreateAsync(new CreateTicketRequest("T1", "D1", "general_inquiry", "low",
            "a@b.com", "A", null, null, null, null, false));

        var db = TestDbFactory.Create(dbName);
        var ticket = db.Tickets.First();

        var result = await svc.PostStaffMessageAsync(ticket.ReferenceNumber,
            "Internal note", "Admin", "admin@test.com", isInternal: true);
        Assert.NotNull(result);

        var messages = await svc.GetMessagesAsync(ticket.ReferenceNumber, null, isStaff: true);
        Assert.NotNull(messages);
    }

    [Fact]
    public async Task PostPublicComment_RequiresMatchingEmail()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        await svc.CreateAsync(new CreateTicketRequest("T1", "D1", "general_inquiry", "low",
            "owner@b.com", "Owner", null, null, null, null, false));

        var db = TestDbFactory.Create(dbName);
        var reference = db.Tickets.First().ReferenceNumber;

        // Wrong email is rejected; the owner's email is accepted and forces the investor role.
        Assert.Null(await svc.PostPublicCommentAsync(reference, "Hi", "Owner", "intruder@evil.com"));
        var ok = await svc.PostPublicCommentAsync(reference, "Any update?", "Owner", "OWNER@b.com");
        Assert.NotNull(ok);
    }
}
