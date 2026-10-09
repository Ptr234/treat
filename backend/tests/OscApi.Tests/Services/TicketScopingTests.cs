using FluentValidation;
using OscApi.Common;
using OscApi.Dtos.Tickets;
using OscApi.Services;
using OscApi.Tests.Helpers;

namespace OscApi.Tests.Services;

/// <summary>
/// Verifies agency_officer scoping: when an agency scope is supplied, ticket
/// list/get/update only ever touch tickets assigned to that agency — and that
/// the public side is gated on ticket ownership.
/// </summary>
public class TicketScopingTests
{
    private static TicketService CreateService(OscApi.Data.OscDbContext db) =>
        new(db, MockEmailService.Create(), new ReferenceNumberGenerator(db), new MockSettingsService());

    private static string Prop(object result, string name) =>
        result.GetType().GetProperty(name)!.GetValue(result)!.ToString()!;

    private static TicketRequester StaffIn(string? agency) => new(true, agency, null, null);
    private static TicketRequester Public(string? token) => new(false, null, token, null);

    private static Task<object> FilePublicly(TicketService svc, string email) =>
        svc.CreateAsync(new CreateTicketRequest(
            "T", "d", "general_inquiry", null, email, "Owner", null, null, null, null, false), isStaff: false);

    /// <summary>Create a ticket and assign it to an agency, returning its reference number.</summary>
    private static async Task<string> SeedTicket(TicketService svc, string title, string agencyCode)
    {
        var created = await svc.CreateAsync(new CreateTicketRequest(
            title, "desc", "general_inquiry", "medium", "investor@example.com", "Investor",
            null, null, null, null, false), isStaff: true);
        var reference = Prop(created, "ReferenceNumber");
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

        var scoped = await svc.ListAsync(new TicketListQuery(), "UIA");
        Assert.Equal(2, (int)scoped.GetType().GetProperty("total")!.GetValue(scoped)!);

        var all = await svc.ListAsync(new TicketListQuery());
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
    public async Task UpdateAsync_AgencyCodeIsStoredUpperCase_SoOfficersStillSeeIt()
    {
        var db = TestDbFactory.Create();
        var svc = CreateService(db);
        var reference = await SeedTicket(svc, "lower-case assignment", "ursb");

        Assert.NotNull(await svc.GetAsync(reference, StaffIn("URSB")));
    }

    [Fact]
    public async Task PublicUpdate_EscalatesOnlyForTheOwner()
    {
        var db = TestDbFactory.Create();
        var svc = CreateService(db);
        var created = await FilePublicly(svc, "owner@example.com");
        var reference = Prop(created, "ReferenceNumber");
        var token = Prop(created, "AccessToken");

        // A guessed token cannot escalate.
        Assert.Null(await svc.PublicUpdateAsync(reference,
            new PublicTicketUpdateRequest("guess", IsEscalated: true, null, null), Public("guess")));

        // The owner can.
        var ok = await svc.PublicUpdateAsync(reference,
            new PublicTicketUpdateRequest(token, IsEscalated: true, null, null), Public(token));
        Assert.NotNull(ok);
    }

    [Fact]
    public async Task PublicUpdate_RatingRequiresResolvedTicket()
    {
        var db = TestDbFactory.Create();
        var svc = CreateService(db);
        var created = await FilePublicly(svc, "owner@example.com");
        var reference = Prop(created, "ReferenceNumber");
        var token = Prop(created, "AccessToken");

        // A brand-new ticket cannot be rated (a 400, not a silent 403).
        await Assert.ThrowsAsync<ValidationException>(() => svc.PublicUpdateAsync(reference,
            new PublicTicketUpdateRequest(token, null, SatisfactionRating: 5, null), Public(token)));

        // Once resolved, the owner can rate it.
        await svc.UpdateAsync(reference,
            new UpdateTicketRequest("resolved", null, null, null, null, null, null));
        var ok = await svc.PublicUpdateAsync(reference,
            new PublicTicketUpdateRequest(token, null, SatisfactionRating: 5, "Great"), Public(token));
        Assert.NotNull(ok);
    }

    [Fact]
    public async Task GetAsync_StaffScoped_HidesOtherAgencies()
    {
        var db = TestDbFactory.Create();
        var svc = CreateService(db);
        var uiaRef = await SeedTicket(svc, "UIA ticket", "UIA");

        // Staff scoped to a different agency sees nothing.
        Assert.Null(await svc.GetAsync(uiaRef, StaffIn("URSB")));
        // Scoped to the owning agency, they see it.
        Assert.NotNull(await svc.GetAsync(uiaRef, StaffIn("UIA")));
        // Admin-level staff (no scope) always see it.
        Assert.NotNull(await svc.GetAsync(uiaRef, StaffIn(null)));
    }
}
