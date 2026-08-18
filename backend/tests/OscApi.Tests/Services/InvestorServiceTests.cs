using OscApi.Common;
using OscApi.Dtos.BusinessRegistrations;
using OscApi.Dtos.Investors;
using OscApi.Services;
using OscApi.Tests.Helpers;

namespace OscApi.Tests.Services;

public class InvestorServiceTests
{
    private InvestorService CreateService(string? dbName = null)
    {
        var db = TestDbFactory.Create(dbName);
        var email = MockEmailService.Create();
        var refGen = new ReferenceNumberGenerator(db);
        return new InvestorService(db, email, refGen);
    }

    private BusinessRegistrationService CreateRegistrationService(string dbName)
    {
        var db = TestDbFactory.Create(dbName);
        var email = MockEmailService.Create();
        var refGen = new ReferenceNumberGenerator(db);
        return new BusinessRegistrationService(db, email, refGen);
    }

    private static CreateInvestorRequest ValidRequest(string email = "inv@example.com") => new(
        Name: "Test Investor", Email: email, Phone: "+256700000000",
        Nationality: "Ugandan", CompanyName: "Test Co", Position: "CEO",
        InvestorType: "Individual", Experience: "Beginner",
        InvestmentGoal: "Growth", InvestmentAmount: "100000",
        TimeHorizon: "ShortTerm", RiskTolerance: "Moderate",
        PrimarySector: "Agriculture", SecondarySectors: new List<string> { "Tourism" },
        SpecificInterests: "Coffee", CapitalSource: "Savings",
        Timeframe: "immediate", SupportNeeded: new List<string> { "Legal" }
    );

    [Fact]
    public async Task CreateAsync_ReturnsInvestorResponse()
    {
        var svc = CreateService();
        var (result, error) = await svc.CreateAsync(ValidRequest());

        Assert.Null(error);
        Assert.NotNull(result);
        Assert.StartsWith("INV-", result!.ReferenceNumber);
        Assert.Equal("New", result.Status);
    }

    [Fact]
    public async Task CreateAsync_RejectsDuplicateEmail()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        await svc.CreateAsync(ValidRequest("dup@test.com"));
        var (result, error) = await svc.CreateAsync(ValidRequest("dup@test.com"));

        Assert.Null(result);
        Assert.Contains("already exists", error);
    }

    [Fact]
    public async Task GetByRefAsync_ReturnsProfile()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        var (created, _) = await svc.CreateAsync(ValidRequest());

        var result = await svc.GetByRefAsync(created!.ReferenceNumber, "inv@example.com", false);
        Assert.NotNull(result);
        Assert.Equal("Test Investor", result!.Name);
    }

    [Fact]
    public async Task GetByRefAsync_DeniesWrongEmail()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        var (created, _) = await svc.CreateAsync(ValidRequest());

        var result = await svc.GetByRefAsync(created!.ReferenceNumber, "wrong@test.com", false);
        Assert.Null(result);
    }

    [Fact]
    public async Task GetByRefAsync_AdminBypassesEmail()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        var (created, _) = await svc.CreateAsync(ValidRequest());

        var result = await svc.GetByRefAsync(created!.ReferenceNumber, null, isAdmin: true);
        Assert.NotNull(result);
    }

    [Fact]
    public async Task UpdateAsync_ChangesFields()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        var (created, _) = await svc.CreateAsync(ValidRequest());

        var result = await svc.UpdateAsync(created!.ReferenceNumber,
            new UpdateInvestorRequest(Name: "Updated Name", null, null, null, null, null, null, null, null, Status: "Active"));

        Assert.NotNull(result);
        Assert.Equal("Updated Name", result!.Name);
        Assert.Equal("Active", result.Status);
    }

    [Fact]
    public async Task DeleteAsync_RemovesProfile()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        var (created, _) = await svc.CreateAsync(ValidRequest());

        var deleted = await svc.DeleteAsync(created!.ReferenceNumber);
        Assert.True(deleted);

        var result = await svc.GetByRefAsync(created.ReferenceNumber, null, true);
        Assert.Null(result);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalseForMissing()
    {
        var svc = CreateService();
        var deleted = await svc.DeleteAsync("NONEXISTENT");
        Assert.False(deleted);
    }

    [Fact]
    public async Task ListAsync_FiltersByStatus()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        var (created, _) = await svc.CreateAsync(ValidRequest("a@b.com"));
        await svc.CreateAsync(ValidRequest("b@b.com"));
        await svc.UpdateAsync(created!.ReferenceNumber,
            new UpdateInvestorRequest(null, null, null, null, null, null, null, null, null, "Active"));

        var all = await svc.ListAsync(0, 50, null);
        var active = await svc.ListAsync(0, 50, "Active");

        var allTotal = (int)all.GetType().GetProperty("total")!.GetValue(all)!;
        var activeTotal = (int)active.GetType().GetProperty("total")!.GetValue(active)!;

        Assert.Equal(2, allTotal);
        Assert.Equal(1, activeTotal);
    }

    [Fact]
    public async Task CreateAsync_LinksToCompletedUrsbRegistration_WhenEmailAndCompanyNameMatch()
    {
        var dbName = Guid.NewGuid().ToString();
        var regSvc = CreateRegistrationService(dbName);

        var registration = await regSvc.CreateAsync(new CreateBusinessRegistrationRequest(
            BusinessName: "Nakato Agro Processing Ltd", BusinessType: "Private Company",
            BusinessStructure: "Limited Liability", BusinessDescription: null, Sector: "Agriculture",
            Location: "Mbarara", Owners: [new OwnerInfo("Grace Nakato", "Ugandan", "CM1", "100")],
            InitialCapital: null, ProjectedTurnover: null, ContactName: "Grace Nakato",
            ContactEmail: "grace.nakato@example.com", ContactPhone: null));

        await regSvc.UpdateAsync(registration.ReferenceNumber,
            new UpdateBusinessRegistrationRequest(Status: "name_approved", null, null), agencyScope: null);
        await regSvc.UpdateAsync(registration.ReferenceNumber,
            new UpdateBusinessRegistrationRequest(Status: "certificate_issued", null, null), agencyScope: null);

        var invSvc = CreateService(dbName);
        var (created, error) = await invSvc.CreateAsync(new CreateInvestorRequest(
            Name: "Grace Nakato", Email: "grace.nakato@example.com", Phone: "+256772445118",
            Nationality: "Ugandan", CompanyName: "Nakato Agro Processing Ltd", Position: "Director",
            InvestorType: "Individual", Experience: "Intermediate", InvestmentGoal: "Growth",
            InvestmentAmount: "250000", TimeHorizon: "MediumTerm", RiskTolerance: "Moderate",
            PrimarySector: "Agriculture", SecondarySectors: null, SpecificInterests: null,
            CapitalSource: "Savings", Timeframe: "immediate", SupportNeeded: null));

        Assert.Null(error);
        var detail = await invSvc.GetByRefAsync(created!.ReferenceNumber, "grace.nakato@example.com", isAdmin: false);
        Assert.Equal(registration.ReferenceNumber, detail!.LinkedBusinessRegistrationRef);
    }

    [Fact]
    public async Task CreateAsync_NoLink_WhenNoMatchingUrsbRegistrationExists()
    {
        var svc = CreateService();
        var (created, error) = await svc.CreateAsync(ValidRequest("unlinked@example.com"));

        Assert.Null(error);
        var detail = await svc.GetByRefAsync(created!.ReferenceNumber, "unlinked@example.com", isAdmin: false);
        Assert.Null(detail!.LinkedBusinessRegistrationRef);
    }
}
