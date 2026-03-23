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

        var result = await svc.GetByRefAsync(ticket.ReferenceNumber, null, isAdmin: true);
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
    public async Task UpdateAsync_ReturnsNullForMissing()
    {
        var svc = CreateService();
        var result = await svc.UpdateAsync("NONEXISTENT",
            new UpdateTicketRequest("resolved", null, null, null, null, null, null));
        Assert.Null(result);
    }

    [Fact]
    public async Task PostMessageAsync_AddsMessage()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        await svc.CreateAsync(new CreateTicketRequest("T1", "D1", "general_inquiry", "low",
            "a@b.com", "A", null, null, null, null, false));

        var db = TestDbFactory.Create(dbName);
        var ticket = db.Tickets.First();

        var result = await svc.PostMessageAsync(ticket.ReferenceNumber,
            new TicketMessageRequest("Hello", "Admin", "Officer", "admin@test.com", false));

        Assert.NotNull(result);

        var messages = await svc.GetMessagesAsync(ticket.ReferenceNumber, null, true);
        Assert.NotNull(messages);
    }
}
