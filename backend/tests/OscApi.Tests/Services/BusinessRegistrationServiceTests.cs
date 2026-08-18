using OscApi.Common;
using OscApi.Dtos.BusinessRegistrations;
using OscApi.Services;
using OscApi.Tests.Helpers;

namespace OscApi.Tests.Services;

public class BusinessRegistrationServiceTests
{
    private BusinessRegistrationService CreateService(string? dbName = null)
    {
        var db = TestDbFactory.Create(dbName);
        var email = MockEmailService.Create();
        var refGen = new ReferenceNumberGenerator(db);
        return new BusinessRegistrationService(db, email, refGen);
    }

    private static CreateBusinessRegistrationRequest ValidRequest(string businessName = "Nakato Agro Processing Ltd", string email = "grace@example.com") => new(
        BusinessName: businessName, BusinessType: "Private Company", BusinessStructure: "Limited Liability",
        BusinessDescription: "Agro-processing", Sector: "Agriculture", Location: "Mbarara",
        Owners: [new OwnerInfo("Grace Nakato", "Ugandan", "CM12345", "100")],
        InitialCapital: "UGX 5,000,000", ProjectedTurnover: "UGX 20,000,000",
        ContactName: "Grace Nakato", ContactEmail: email, ContactPhone: "+256772445118"
    );

    [Fact]
    public async Task CreateAsync_ReturnsReferenceNumber_AndStatusReceived()
    {
        var svc = CreateService();
        var result = await svc.CreateAsync(ValidRequest());

        Assert.StartsWith("REG-", result.ReferenceNumber);
        Assert.Equal("Received", result.Status);
    }

    [Fact]
    public async Task CreateAsync_StoresTheRealApplicantEmail_NotAPlaceholder()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);
        await svc.CreateAsync(ValidRequest(email: "real.applicant@example.com"));

        var db = TestDbFactory.Create(dbName);
        var stored = db.BusinessRegistrations.First();
        Assert.Equal("real.applicant@example.com", stored.ContactEmail);

        // And the applicant can immediately track it using that same email —
        // the whole point of not hardcoding a placeholder contact address.
        var detail = await svc.GetByRefAsync(stored.ReferenceNumber, "real.applicant@example.com", isStaff: false);
        Assert.NotNull(detail);
    }

    [Fact]
    public async Task CheckNameAsync_AvailableForNewName()
    {
        var svc = CreateService();
        var result = await svc.CheckNameAsync("Brand New Traders Ltd");
        Assert.True(result.Available);
        Assert.Null(result.ConflictingReferenceNumber);
    }

    [Fact]
    public async Task CheckNameAsync_UnavailableWhileRegistrationIsLive()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);
        var created = await svc.CreateAsync(ValidRequest(businessName: "Kampala Steel Works"));

        var check = await svc.CheckNameAsync("kampala steel works"); // case-insensitive
        Assert.False(check.Available);
        Assert.Equal(created.ReferenceNumber, check.ConflictingReferenceNumber);
    }

    [Fact]
    public async Task CheckNameAsync_AvailableAgainAfterRejection()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);
        var created = await svc.CreateAsync(ValidRequest(businessName: "Freed Up Traders Ltd"));

        await svc.UpdateAsync(created.ReferenceNumber,
            new UpdateBusinessRegistrationRequest(Status: "rejected", ReviewNotes: null, RejectionReason: "Duplicate submission"),
            agencyScope: null);

        var check = await svc.CheckNameAsync("Freed Up Traders Ltd");
        Assert.True(check.Available);
    }

    [Fact]
    public async Task UpdateAsync_NameApproved_StampsNameDecisionAt()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);
        var created = await svc.CreateAsync(ValidRequest());

        var result = await svc.UpdateAsync(created.ReferenceNumber,
            new UpdateBusinessRegistrationRequest(Status: "name_approved", ReviewNotes: "Name is available", RejectionReason: null),
            agencyScope: null);

        Assert.NotNull(result);
        Assert.Equal("NameApproved", result!.Status);
        Assert.NotNull(result.NameDecisionAt);
    }

    [Fact]
    public async Task UpdateAsync_CertificateIssued_RequiresPriorNameApproval()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);
        var created = await svc.CreateAsync(ValidRequest());

        // Still "Received" — jumping straight to CertificateIssued must be rejected.
        await Assert.ThrowsAsync<FluentValidation.ValidationException>(() =>
            svc.UpdateAsync(created.ReferenceNumber,
                new UpdateBusinessRegistrationRequest(Status: "certificate_issued", ReviewNotes: null, RejectionReason: null),
                agencyScope: null));
    }

    [Fact]
    public async Task UpdateAsync_CertificateIssued_AfterNameApproval_GeneratesCertificateNumber()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);
        var created = await svc.CreateAsync(ValidRequest());

        await svc.UpdateAsync(created.ReferenceNumber,
            new UpdateBusinessRegistrationRequest(Status: "name_approved", null, null), agencyScope: null);
        var issued = await svc.UpdateAsync(created.ReferenceNumber,
            new UpdateBusinessRegistrationRequest(Status: "certificate_issued", null, null), agencyScope: null);

        Assert.NotNull(issued);
        Assert.Equal("CertificateIssued", issued!.Status);
        Assert.NotNull(issued.CertificateNumber);
        Assert.StartsWith("URSB-CERT-", issued.CertificateNumber);
        Assert.NotNull(issued.CertificateIssuedAt);

        var cert = await svc.GetCertificateAsync(created.ReferenceNumber, email: null, isStaff: true);
        Assert.NotNull(cert);
        Assert.Equal(issued.CertificateNumber, cert!.CertificateNumber);
    }

    [Fact]
    public async Task UpdateAsync_Rejected_RequiresAReason()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);
        var created = await svc.CreateAsync(ValidRequest());

        await Assert.ThrowsAsync<FluentValidation.ValidationException>(() =>
            svc.UpdateAsync(created.ReferenceNumber,
                new UpdateBusinessRegistrationRequest(Status: "rejected", null, RejectionReason: null),
                agencyScope: null));
    }

    [Fact]
    public async Task ListAsync_UrsbOfficer_SeesTheRegistry()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);
        await svc.CreateAsync(ValidRequest());

        var result = await svc.ListAsync(0, 50, agencyScope: "URSB");
        var total = (int)result.GetType().GetProperty("total")!.GetValue(result)!;
        Assert.Equal(1, total);
    }

    [Fact]
    public async Task ListAsync_OtherAgencyOfficer_SeesNothing()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);
        await svc.CreateAsync(ValidRequest());

        // This is URSB's own registry — a UIA officer has no visibility into it.
        var result = await svc.ListAsync(0, 50, agencyScope: "UIA");
        var total = (int)result.GetType().GetProperty("total")!.GetValue(result)!;
        Assert.Equal(0, total);
    }

    [Fact]
    public async Task UpdateAsync_OtherAgencyOfficer_CannotTouchTheRegistry()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);
        var created = await svc.CreateAsync(ValidRequest());

        var result = await svc.UpdateAsync(created.ReferenceNumber,
            new UpdateBusinessRegistrationRequest(Status: "name_approved", null, null), agencyScope: "UIA");
        Assert.Null(result);
    }

    [Fact]
    public async Task GetByRefAsync_DeniesWrongEmail()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);
        var created = await svc.CreateAsync(ValidRequest(email: "owner@example.com"));

        var result = await svc.GetByRefAsync(created.ReferenceNumber, "wrong@example.com", isStaff: false);
        Assert.Null(result);
    }

    [Fact]
    public async Task GetCertificateAsync_NotAvailableBeforeIssuance()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);
        var created = await svc.CreateAsync(ValidRequest());

        var cert = await svc.GetCertificateAsync(created.ReferenceNumber, email: null, isStaff: true);
        Assert.Null(cert);
    }
}
