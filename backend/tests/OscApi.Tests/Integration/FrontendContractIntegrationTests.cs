using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using OscApi.Data;
using OscApi.Models;
using OtpNet;

namespace OscApi.Tests.Integration;

/// <summary>
/// Pins the request/response shapes the Next.js frontend actually sends and
/// reads, so a backend change can't silently break a form or a dashboard view.
/// </summary>
public class FrontendContractIntegrationTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    public FrontendContractIntegrationTests(ApiFactory factory) => _factory = factory;

    private static string? _adminMfaSecret;
    private static string Code(string secret) => new Totp(Base32Encoding.ToBytes(secret)).ComputeTotp();

    private static JsonElement Data(string json) => JsonDocument.Parse(json).RootElement.GetProperty("data");

    private static async Task<HttpClient> AdminClient(ApiFactory factory)
    {
        var client = factory.CreateClient();
        object body = _adminMfaSecret is null
            ? new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword }
            : new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword, mfaCode = Code(_adminMfaSecret) };
        var login = await client.PostAsJsonAsync("/api/v1/auth/login", body);
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        if (_adminMfaSecret is null)
        {
            var enroll = await client.PostAsync("/api/v1/auth/mfa/enroll", null);
            _adminMfaSecret = Data(await enroll.Content.ReadAsStringAsync()).GetProperty("secret").GetString()!;
            await client.PostAsJsonAsync("/api/v1/auth/mfa/verify", new { code = Code(_adminMfaSecret) });
        }
        return client;
    }

    private static async Task<HttpClient> OfficerClient(ApiFactory factory, HttpClient admin, string agencyCode)
    {
        var email = $"officer-{Guid.NewGuid():N}@uia.go.ug";
        var create = await admin.PostAsJsonAsync("/api/v1/admin/users", new
        {
            name = $"{agencyCode} Officer", email, password = "Officer@2026!", role = "agency_officer", agencyCode,
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);

        var officer = factory.CreateClient();
        var login = await officer.PostAsJsonAsync("/api/v1/auth/login", new { email, password = "Officer@2026!" });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        var enroll = await officer.PostAsync("/api/v1/auth/mfa/enroll", null);
        var secret = Data(await enroll.Content.ReadAsStringAsync()).GetProperty("secret").GetString()!;
        await officer.PostAsJsonAsync("/api/v1/auth/mfa/verify", new { code = Code(secret) });
        return officer;
    }

    // ── Contact forms ────────────────────────────────────────────────────────

    [Fact]
    public async Task SupportPageInquiry_WithoutPhone_IsAccepted()
    {
        // Shape sent by app/support/page.tsx (phone is optional on that form).
        var res = await _factory.CreateClient().PostAsJsonAsync("/api/v1/contact/inquiries", new
        {
            agencyCode = "UIA", agencyName = "Uganda Investment Authority",
            name = "Amina Nansubuga", email = "amina@example.com", phone = (string?)null,
            serviceType = "Investment Licensing", subject = "Investment Licensing",
            message = "How do I apply for an investment licence?", urgency = "normal",
        });

        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        Assert.StartsWith("INQ-", Data(await res.Content.ReadAsStringAsync()).GetProperty("referenceNumber").GetString());
    }

    [Fact]
    public async Task AnonymousFeedback_IsAccepted()
    {
        // Shape sent by components/forms/FeedbackForm.tsx when "anonymous" is ticked.
        var res = await _factory.CreateClient().PostAsJsonAsync("/api/v1/contact/inquiries", new
        {
            agencyCode = "UIA", agencyName = "Uganda Investment Authority",
            name = "Anonymous", email = "anonymous@feedback.invalid", phone = (string?)null,
            serviceType = "Feedback: Usability Issue", subject = "[usability] Menu is hard to find",
            message = "Rating: 3/5\n\nThe menu is hard to find on mobile.", urgency = "normal",
        });

        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
    }

    [Fact]
    public async Task EventRegistration_IsAcceptedAsAppointment()
    {
        // Shape sent by app/events/[id]/EventDetailClient.tsx.
        var res = await _factory.CreateClient().PostAsJsonAsync("/api/v1/contact/appointments", new
        {
            agencyCode = "UIA", agencyName = "Uganda Investment Authority",
            name = "Okello David", email = "okello@example.com", phone = "+256772000111",
            company = "Okello Farms Ltd", serviceType = "Event Registration",
            purpose = "Event registration: Uganda Investment Summit\nOrganization: Okello Farms Ltd",
            duration = 60, meetingType = "in-person",
            preferredDate = "2026-11-12", preferredTime = "09:00",
        });

        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
    }

    [Fact]
    public async Task Appointment_StillRequiresPhone()
    {
        var res = await _factory.CreateClient().PostAsJsonAsync("/api/v1/contact/appointments", new
        {
            agencyCode = "UIA", agencyName = "Uganda Investment Authority",
            name = "No Phone", email = "nophone@example.com", phone = "",
            serviceType = "Consultation", purpose = "Discuss licensing",
            duration = 30, meetingType = "virtual", preferredDate = "2026-11-12", preferredTime = "10:00",
        });

        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    // ── Investor onboarding ──────────────────────────────────────────────────

    private static object InvestorBody(string email) => new
    {
        name = "Grace Atim", email, phone = "+256700111222", nationality = "Ugandan",
        companyName = (string?)null, position = (string?)null,
        investorType = "individual", experience = "beginner", investmentGoal = "growth",
        investmentAmount = "100000-500000", timeHorizon = "medium-term", riskTolerance = "moderate",
        primarySector = "agriculture", secondarySectors = Array.Empty<string>(), specificInterests = "",
        capitalSource = "savings", timeframe = "3-months", supportNeeded = Array.Empty<string>(),
    };

    [Fact]
    public async Task InvestorOnboarding_RepeatSubmission_ReportsExistingWithoutLeakingReference()
    {
        var client = _factory.CreateClient();
        var email = $"investor-{Guid.NewGuid():N}@example.com";

        var first = await client.PostAsJsonAsync("/api/v1/investors", InvestorBody(email));
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        var firstData = Data(await first.Content.ReadAsStringAsync());
        Assert.False(firstData.GetProperty("existing").GetBoolean());
        Assert.StartsWith("INV-", firstData.GetProperty("referenceNumber").GetString());

        var repeat = await client.PostAsJsonAsync("/api/v1/investors", InvestorBody(email.ToUpperInvariant()));
        Assert.Equal(HttpStatusCode.OK, repeat.StatusCode);
        var repeatData = Data(await repeat.Content.ReadAsStringAsync());
        Assert.True(repeatData.GetProperty("existing").GetBoolean());
        Assert.False(repeatData.TryGetProperty("referenceNumber", out _)); // null → omitted
    }

    // ── Agency chat attachments ──────────────────────────────────────────────

    [Fact]
    public async Task AgencyMessage_AttachmentsArePersistedAndReturned()
    {
        var admin = await AdminClient(_factory);
        var channel = "general";
        var url = $"https://cdn.sanity.io/files/proj/production/{Guid.NewGuid():N}.pdf";

        var post = await admin.PostAsJsonAsync("/api/v1/messages", new
        {
            channel, content = "Licence draft attached",
            attachments = new[] { new { url, originalFilename = "licence-draft.pdf" } },
        });
        Assert.Equal(HttpStatusCode.Created, post.StatusCode);
        Assert.Equal(url, Data(await post.Content.ReadAsStringAsync())
            .GetProperty("attachments")[0].GetProperty("url").GetString());

        var get = await admin.GetAsync($"/api/v1/messages?channel={channel}");
        var messages = Data(await get.Content.ReadAsStringAsync()).GetProperty("messages").EnumerateArray().ToList();
        var saved = messages.Single(m => m.GetProperty("content").GetString() == "Licence draft attached");
        var attachment = saved.GetProperty("attachments")[0];
        Assert.Equal(url, attachment.GetProperty("url").GetString());
        Assert.Equal("licence-draft.pdf", attachment.GetProperty("originalFilename").GetString());
    }

    [Theory]
    [InlineData("javascript:alert(1)")]
    [InlineData("https://evil.example.com/file.pdf")]
    [InlineData("http://cdn.sanity.io/files/p/d/x.pdf")]
    public async Task AgencyMessage_RejectsNonSanityAttachmentUrls(string url)
    {
        var admin = await AdminClient(_factory);
        var res = await admin.PostAsJsonAsync("/api/v1/messages", new
        {
            channel = "general", content = "bad link",
            attachments = new[] { new { url, originalFilename = "x.pdf" } },
        });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task AgencyMessage_RejectsMoreThanThreeAttachments()
    {
        var admin = await AdminClient(_factory);
        var attachments = Enumerable.Range(0, 4)
            .Select(i => new { url = $"https://cdn.sanity.io/files/p/d/{i}.pdf", originalFilename = $"{i}.pdf" });
        var res = await admin.PostAsJsonAsync("/api/v1/messages", new { channel = "general", content = "too many", attachments });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    // ── Chat enquiries ───────────────────────────────────────────────────────

    [Fact]
    public async Task ChatEnquiries_RowsAndTranscriptCarryAnId()
    {
        var sessionId = $"s-{Guid.NewGuid():N}";
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<OscDbContext>();
            db.ChatEnquiries.Add(new ChatEnquiry
            {
                SessionId = sessionId, UserMessage = "Hello", BotResponse = "Hi there",
                Language = ChatLanguage.En, Tier = ChatTier.Ai,
            });
            await db.SaveChangesAsync();
        }

        var admin = await AdminClient(_factory);
        var list = Data(await (await admin.GetAsync("/api/v1/dashboard/enquiries")).Content.ReadAsStringAsync());
        var row = list.GetProperty("enquiries").EnumerateArray().Single(e => e.GetProperty("sessionId").GetString() == sessionId);
        Assert.False(string.IsNullOrEmpty(row.GetProperty("_id").GetString()));

        var transcript = Data(await (await admin.GetAsync($"/api/v1/dashboard/enquiries/sessions/{sessionId}")).Content.ReadAsStringAsync());
        Assert.False(string.IsNullOrEmpty(transcript[0].GetProperty("_id").GetString()));
    }

    // ── Business registration visibility ─────────────────────────────────────

    [Fact]
    public async Task RegistrationDetail_IsHiddenFromOtherAgencies_ButVisibleToUrsb()
    {
        var reference = $"REG-2026-{Guid.NewGuid():N}"[..20];
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<OscDbContext>();
            db.BusinessRegistrations.Add(new BusinessRegistration
            {
                ReferenceNumber = reference, BusinessName = "Scope Test Ltd",
                BusinessType = "limited-company", BusinessStructure = "private",
                Sector = "ICT", Location = "Kampala", AssignedAgencyCode = "URSB",
                ContactName = "Applicant", ContactEmail = "scope-owner@example.com",
            });
            await db.SaveChangesAsync();
        }

        var admin = await AdminClient(_factory);
        var uiaOfficer = await OfficerClient(_factory, admin, "UIA");
        var ursbOfficer = await OfficerClient(_factory, admin, "URSB");

        Assert.Equal(HttpStatusCode.Forbidden, (await uiaOfficer.GetAsync($"/api/v1/business-registrations/{reference}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await uiaOfficer.GetAsync($"/api/v1/business-registrations/{reference}/payment")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await ursbOfficer.GetAsync($"/api/v1/business-registrations/{reference}")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await ursbOfficer.GetAsync($"/api/v1/business-registrations/{reference}/payment")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await admin.GetAsync($"/api/v1/business-registrations/{reference}")).StatusCode);
    }
}
