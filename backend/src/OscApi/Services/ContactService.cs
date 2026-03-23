using Microsoft.EntityFrameworkCore;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.Contact;
using OscApi.Models;

namespace OscApi.Services;

public class ContactService : IContactService
{
    private readonly OscDbContext _db;
    private readonly EmailService _email;

    public ContactService(OscDbContext db, EmailService email)
    {
        _db = db;
        _email = email;
    }

    public async Task<ContactInquiryResponse> CreateInquiryAsync(CreateContactInquiryRequest request)
    {
        var refNumber = await GenerateRefAsync("INQ");

        var inquiry = new ContactInquiry
        {
            ReferenceNumber = refNumber,
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
        await _db.SaveChangesAsync();

        _ = _email.SendContactConfirmationAsync(
            inquiry.ContactEmail, inquiry.ContactName, inquiry.ReferenceNumber,
            inquiry.AgencyName, inquiry.Subject);

        _ = _email.SendContactNotificationToAgencyAsync(
            inquiry.AgencyCode, inquiry.AgencyName, inquiry.ReferenceNumber,
            inquiry.ContactName, inquiry.ContactEmail, inquiry.Subject, inquiry.Message,
            request.AgencyEmail);

        return new ContactInquiryResponse(
            refNumber, inquiry.AgencyCode, inquiry.ContactName,
            inquiry.Status.ToString(), inquiry.CreatedAt);
    }

    public async Task<AppointmentResponse> CreateAppointmentAsync(CreateAppointmentRequest request)
    {
        var refNumber = await GenerateRefAsync("APT");

        var appointment = new Appointment
        {
            ReferenceNumber = refNumber,
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
        await _db.SaveChangesAsync();

        _ = _email.SendAppointmentConfirmationAsync(
            appointment.ContactEmail, appointment.ContactName, appointment.ReferenceNumber,
            appointment.AgencyName, appointment.PreferredDate.ToString("dd MMM yyyy"),
            appointment.PreferredTime);

        _ = _email.SendAppointmentNotificationToAgencyAsync(
            appointment.AgencyCode, appointment.AgencyName, appointment.ReferenceNumber,
            appointment.ContactName, appointment.ContactEmail, appointment.ContactPhone,
            appointment.ServiceType, appointment.Purpose,
            appointment.PreferredDate.ToString("dd MMM yyyy"), appointment.PreferredTime,
            appointment.DurationMinutes, appointment.MeetingType.ToString(),
            request.AgencyEmail);

        return new AppointmentResponse(
            refNumber, appointment.AgencyCode, appointment.ContactName,
            appointment.PreferredDate.ToString("yyyy-MM-dd"), appointment.PreferredTime,
            appointment.Status.ToString(), appointment.CreatedAt);
    }

    public async Task<object> ListInquiriesAsync(int from, int to, string? agencyCode)
    {
        var query = _db.ContactInquiries.AsQueryable();
        if (!string.IsNullOrEmpty(agencyCode))
            query = query.Where(i => i.AgencyCode == agencyCode);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(i => i.CreatedAt)
            .Skip(from).Take(to - from)
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
        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip(from).Take(to - from)
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

    private async Task<string> GenerateRefAsync(string prefix)
    {
        var year = DateTime.UtcNow.Year;
        var fullPrefix = $"{prefix}-{year}-";

        // Check both tables for the prefix to avoid collisions
        var lastInq = await _db.ContactInquiries
            .Where(i => i.ReferenceNumber.StartsWith(fullPrefix))
            .OrderByDescending(i => i.ReferenceNumber)
            .Select(i => i.ReferenceNumber)
            .FirstOrDefaultAsync();

        var lastApt = await _db.Appointments
            .Where(a => a.ReferenceNumber.StartsWith(fullPrefix))
            .OrderByDescending(a => a.ReferenceNumber)
            .Select(a => a.ReferenceNumber)
            .FirstOrDefaultAsync();

        var maxNum = 0;
        foreach (var lastRef in new[] { lastInq, lastApt })
        {
            if (lastRef is not null && int.TryParse(lastRef.Replace(fullPrefix, ""), out var parsed) && parsed > maxNum)
                maxNum = parsed;
        }

        return $"{fullPrefix}{maxNum + 1:D4}";
    }
}
