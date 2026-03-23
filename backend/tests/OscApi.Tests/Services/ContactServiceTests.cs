using OscApi.Dtos.Contact;
using OscApi.Services;
using OscApi.Tests.Helpers;

namespace OscApi.Tests.Services;

public class ContactServiceTests
{
    private ContactService CreateService(string? dbName = null)
    {
        var db = TestDbFactory.Create(dbName);
        var email = MockEmailService.Create();
        return new ContactService(db, email);
    }

    private static CreateContactInquiryRequest ValidInquiry() => new(
        AgencyCode: "UIA", AgencyName: "Uganda Investment Authority",
        AgencyEmail: "info@ugandainvestment.go.ug",
        Name: "Jane Doe", Email: "jane@example.com", Phone: "+256700111222",
        Company: "TestCo", ServiceType: "Investment Facilitation",
        Subject: "Inquiry about investing", Message: "I want to invest in agriculture",
        Urgency: "normal"
    );

    private static CreateAppointmentRequest ValidAppointment() => new(
        AgencyCode: "URSB", AgencyName: "Uganda Registration Services Bureau",
        AgencyEmail: "ursb@ursb.go.ug",
        Name: "John Doe", Email: "john@example.com", Phone: "+256700333444",
        Company: null, ServiceType: "Company Registration",
        Purpose: "Register my new company", Duration: 60,
        MeetingType: "in-person", PreferredDate: "2026-04-15",
        PreferredTime: "10:00", AlternativeDate: "2026-04-16",
        AlternativeTime: "14:00", SpecialRequirements: null
    );

    [Fact]
    public async Task CreateInquiryAsync_ReturnsReference()
    {
        var svc = CreateService();
        var result = await svc.CreateInquiryAsync(ValidInquiry());

        Assert.StartsWith("INQ-", result.ReferenceNumber);
        Assert.Equal("UIA", result.AgencyCode);
        Assert.Equal("Pending", result.Status);
    }

    [Fact]
    public async Task CreateAppointmentAsync_ReturnsReference()
    {
        var svc = CreateService();
        var result = await svc.CreateAppointmentAsync(ValidAppointment());

        Assert.StartsWith("APT-", result.ReferenceNumber);
        Assert.Equal("URSB", result.AgencyCode);
        Assert.Equal("Requested", result.Status);
    }

    [Fact]
    public async Task CreateInquiryAsync_SequentialRefs()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        var r1 = await svc.CreateInquiryAsync(ValidInquiry());
        var r2 = await svc.CreateInquiryAsync(ValidInquiry() with { Email = "b@b.com" });

        Assert.EndsWith("0001", r1.ReferenceNumber);
        Assert.EndsWith("0002", r2.ReferenceNumber);
    }

    [Fact]
    public async Task ListInquiriesAsync_ReturnsAllAndFilters()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        await svc.CreateInquiryAsync(ValidInquiry());
        await svc.CreateInquiryAsync(ValidInquiry() with { AgencyCode = "URSB", AgencyName = "URSB", Email = "x@y.com" });

        var all = await svc.ListInquiriesAsync(0, 50, null);
        var uia = await svc.ListInquiriesAsync(0, 50, "UIA");

        var allTotal = (int)all.GetType().GetProperty("total")!.GetValue(all)!;
        var uiaTotal = (int)uia.GetType().GetProperty("total")!.GetValue(uia)!;

        Assert.Equal(2, allTotal);
        Assert.Equal(1, uiaTotal);
    }

    [Fact]
    public async Task ListAppointmentsAsync_ReturnsAll()
    {
        var dbName = Guid.NewGuid().ToString();
        var svc = CreateService(dbName);

        await svc.CreateAppointmentAsync(ValidAppointment());

        var result = await svc.ListAppointmentsAsync(0, 50, null);
        var total = (int)result.GetType().GetProperty("total")!.GetValue(result)!;

        Assert.Equal(1, total);
    }

    [Fact]
    public async Task CreateAppointmentAsync_ParsesMeetingType()
    {
        var svc = CreateService();

        var virtual_ = await svc.CreateAppointmentAsync(ValidAppointment() with { MeetingType = "virtual" });
        var phone = await svc.CreateAppointmentAsync(ValidAppointment() with { MeetingType = "phone", Email = "p@p.com" });

        Assert.Equal("Requested", virtual_.Status);
        Assert.Equal("Requested", phone.Status);
    }
}
