using OscApi.Common;
using OscApi.Dtos.Tickets;
using OscApi.Services;
using OscApi.Tests.Helpers;

namespace OscApi.Tests.Services;

/// <summary>
/// Verifies agency_officer scoping: when an agency scope is supplied, ticket
/// list/get/update only ever touch tickets assigned to that agency.
/// </summary>
public class TicketScopingTests
{
    private static TicketService CreateService(OscApi.Data.OscDbContext db) =>
        new(db, MockEmailService.Create(), new ReferenceNumberGenerator(db), new MockSettingsService());

    private static string RefOf(object result) =>
        result.GetType().GetProperty("ReferenceNumber")!.GetValue(result)!.ToString()!;

    /// <summary>Create a ticket and assign it to an agency, returning its reference number.</summary>
    private static async Task<string> SeedTicket(TicketService svc, string title, string agencyCode)
    {
        var created = await svc.CreateAsync(new CreateTicketRequest(
            title, "desc", "general_inquiry", "medium", "investor@example.com", "Investor",
            null, null, null, null, false));
        var reference = RefOf(created);
        // Admin-level update (no scope) assigns the ticket to an agency.
        await svc.UpdateAsync(reference, new UpdateTicketRequest(
            Status: null, Priority: null, Assignee: null, AssignedAgencyCode: agencyCode,
            SatisfactionRating: null, SatisfactionComment: null, IsEscalated: null));
        return reference;
    }

    [Fact]
    public async Task ListAsync_WithAgencyScope_ReturnsOnlyThatAgency()
    {
        var db = TestDbFactory.Create();
        var svc = CreateService(db);
        await SeedTicket(svc, "UIA ticket", "UIA");
        await SeedTicket(svc, "URSB ticket", "URSB");
        await SeedTicket(svc, "Another UIA ticket", "UIA");

        var scoped = await svc.ListAsync(0, 50, "UIA");
        var total = (int)scoped.GetType().GetProperty("total")!.GetValue(scoped)!;
        Assert.Equal(2, total);

        var all = await svc.ListAsync(0, 50);
        Assert.Equal(3, (int)all.GetType().GetProperty("total")!.GetValue(all)!);
    }

    [Fact]
    public async Task UpdateAsync_OutOfScope_IsRejected_InScope_Succeeds()
    {
        var db = TestDbFactory.Create();
        var svc = CreateService(db);
        var ursbRef = await SeedTicket(svc, "URSB ticket", "URSB");

        // A UIA officer must not be able to update a URSB ticket.
        var blocked = await svc.UpdateAsync(ursbRef,
            new UpdateTicketRequest("Assigned", null, null, null, null, null, null),
            agencyScope: "UIA");
        Assert.Null(blocked);

        // The owning agency can.
        var ok = await svc.UpdateAsync(ursbRef,
            new UpdateTicketRequest("Assigned", null, null, null, null, null, null),
            agencyScope: "URSB");
        Assert.NotNull(ok);
    }

    [Fact]
    public async Task GetByRefAsync_StaffScoped_HidesOtherAgencies()
    {
        var db = TestDbFactory.Create();
        var svc = CreateService(db);
        var uiaRef = await SeedTicket(svc, "UIA ticket", "UIA");

        // Staff scoped to a different agency sees nothing.
        Assert.Null(await svc.GetByRefAsync(uiaRef, email: null, isStaff: true, agencyScope: "URSB"));
        // Scoped to the owning agency, they see it.
        Assert.NotNull(await svc.GetByRefAsync(uiaRef, email: null, isStaff: true, agencyScope: "UIA"));
        // Admin-level staff (no scope) always see it.
        Assert.NotNull(await svc.GetByRefAsync(uiaRef, email: null, isStaff: true));
    }
}
