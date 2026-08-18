using Microsoft.EntityFrameworkCore;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.Contact;
using OscApi.Models;

namespace OscApi.Services;

public class ContactService : IContactService
{
    private readonly OscDbContext _db;
    private readonly IEmailService _email;
    private readonly IReferenceNumberGenerator _refGen;

    public ContactService(OscDbContext db, IEmailService email, IReferenceNumberGenerator refGen)
    {
        _db = db;
        _email = email;
        _refGen = refGen;
    }

    public async Task<ContactInquiryResponse> CreateInquiryAsync(CreateContactInquiryRequest request)
    {
        var inquiry = new ContactInquiry
        {
            AgencyCode = SanitizeHelper.StripHtml(request.AgencyCode),
            AgencyName = SanitizeHelper.StripHtml(request.AgencyName),
            ContactName = SanitizeHelper.StripHtml(request.Name),
            ContactEmail = request.Email.ToLowerInvariant().Trim(),
            ContactPhone = request.Phone,
            Company = request.Company,
            ServiceType = SanitizeHelper.StripHtml(request.ServiceType),
            Subject = SanitizeHelper.StripHtml(request.Subject),
            Message = SanitizeHelper.StripHtml(request.Message),
            Urgency = Enum.Parse<ContactUrgency>(request.Urgency, true),
        };

        _db.ContactInquiries.Add(inquiry);
        await _db.SaveWithUniqueReferenceAsync(async () =>
            inquiry.ReferenceNumber = await _refGen.GenerateInquiryReferenceAsync());

        // Send both emails in parallel to avoid sequential latency
        var confirmationTask = _email.SendContactConfirmationAsync(
            inquiry.ContactEmail, inquiry.ContactName, inquiry.ReferenceNumber,
            inquiry.AgencyName, inquiry.Subject);

        var notificationTask = _email.SendContactNotificationToAgencyAsync(
            inquiry.AgencyCode, inquiry.AgencyName, inquiry.ReferenceNumber,
            inquiry.ContactName, inquiry.ContactEmail, inquiry.Subject, inquiry.Message,
            request.AgencyEmail);

        _ = Task.WhenAll(confirmationTask, notificationTask);

        return new ContactInquiryResponse(
            inquiry.ReferenceNumber, inquiry.AgencyCode, inquiry.ContactName,
            inquiry.Status.ToString(), inquiry.CreatedAt);
    }

    public async Task<AppointmentResponse> CreateAppointmentAsync(CreateAppointmentRequest request)
    {
        var appointment = new Appointment
        {
            AgencyCode = SanitizeHelper.StripHtml(request.AgencyCode),
            AgencyName = SanitizeHelper.StripHtml(request.AgencyName),
            ContactName = SanitizeHelper.StripHtml(request.Name),
            ContactEmail = request.Email.ToLowerInvariant().Trim(),
            ContactPhone = request.Phone,
            Company = request.Company,
            ServiceType = SanitizeHelper.StripHtml(request.ServiceType),
            Purpose = SanitizeHelper.StripHtml(request.Purpose),
            DurationMinutes = request.Duration,
            MeetingType = Enum.Parse<MeetingType>(request.MeetingType.Replace("-", ""), true),
            PreferredDate = DateOnly.Parse(request.PreferredDate),
            PreferredTime = request.PreferredTime,
            AlternativeDate = string.IsNullOrEmpty(request.AlternativeDate) ? null : DateOnly.Parse(request.AlternativeDate),
            AlternativeTime = request.AlternativeTime,
            SpecialRequirements = request.SpecialRequirements,
        };

        _db.Appointments.Add(appointment);
        await _db.SaveWithUniqueReferenceAsync(async () =>
            appointment.ReferenceNumber = await _refGen.GenerateAppointmentReferenceAsync());

        // Send both emails in parallel to avoid sequential latency
        var confirmationTask = _email.SendAppointmentConfirmationAsync(
            appointment.ContactEmail, appointment.ContactName, appointment.ReferenceNumber,
            appointment.AgencyName, appointment.PreferredDate.ToString("dd MMM yyyy"),
            appointment.PreferredTime);

        var notificationTask = _email.SendAppointmentNotificationToAgencyAsync(
            appointment.AgencyCode, appointment.AgencyName, appointment.ReferenceNumber,
            appointment.ContactName, appointment.ContactEmail, appointment.ContactPhone,
            appointment.ServiceType, appointment.Purpose,
            appointment.PreferredDate.ToString("dd MMM yyyy"), appointment.PreferredTime,
            appointment.DurationMinutes, appointment.MeetingType.ToString(),
            request.AgencyEmail);

        _ = Task.WhenAll(confirmationTask, notificationTask);

        return new AppointmentResponse(
            appointment.ReferenceNumber, appointment.AgencyCode, appointment.ContactName,
            appointment.PreferredDate.ToString("yyyy-MM-dd"), appointment.PreferredTime,
            appointment.Status.ToString(), appointment.CreatedAt);
    }

    public async Task<object> ListInquiriesAsync(int from, int to, string? agencyCode)
    {
        var query = _db.ContactInquiries.AsQueryable();
        if (!string.IsNullOrEmpty(agencyCode))
            query = query.Where(i => i.AgencyCode == agencyCode);

        var total = await query.CountAsync();
        var (skip, take) = Pagination.Normalize(from, to);
        var items = await query
            .OrderByDescending(i => i.CreatedAt)
            .Skip(skip).Take(take)
            .Select(i => new
            {
                i.ReferenceNumber, i.AgencyCode, i.AgencyName,
                i.ContactName, i.ContactEmail, i.ServiceType, i.Subject,
                i.Urgency, i.Status, i.CreatedAt
            })
            .ToListAsync();

        return new { inquiries = items, total };
    }

    public async Task<object> ListAppointmentsAsync(int from, int to, string? agencyCode)
    {
        var query = _db.Appointments.AsQueryable();
        if (!string.IsNullOrEmpty(agencyCode))
            query = query.Where(a => a.AgencyCode == agencyCode);

        var total = await query.CountAsync();
        var (skip, take) = Pagination.Normalize(from, to);
        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip(skip).Take(take)
            .Select(a => new
            {
                a.ReferenceNumber, a.AgencyCode, a.AgencyName,
                a.ContactName, a.ContactEmail, a.ServiceType,
                a.PreferredDate, a.PreferredTime, a.DurationMinutes,
                a.MeetingType, a.Status, a.CreatedAt
            })
            .ToListAsync();

        return new { appointments = items, total };
    }
}
