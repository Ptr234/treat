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
            inquiry.ReferenceNumber = await GenerateRefAsync("INQ"));

        _ = _email.SendContactConfirmationAsync(
            inquiry.ContactEmail, inquiry.ContactName, inquiry.ReferenceNumber,
            inquiry.AgencyName, inquiry.Subject);

        _ = _email.SendContactNotificationToAgencyAsync(
            inquiry.AgencyCode, inquiry.AgencyName, inquiry.ReferenceNumber,
            inquiry.ContactName, inquiry.ContactEmail, inquiry.Subject, inquiry.Message,
            request.AgencyEmail);

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
            appointment.ReferenceNumber = await GenerateRefAsync("APT"));

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

    private async Task<string> GenerateRefAsync(string prefix)
    {
        var fullPrefix = $"{prefix}-{DateTime.UtcNow.Year}-";
        // Take the numeric MAX of the suffix so the sequence stays correct past 9999,
        // where "…-10000" sorts below "…-9999" as text. Both tables are checked to
        // keep INQ/APT sequences from ever colliding.
        var maxNum = Math.Max(
            await MaxSuffixAsync(_db.ContactInquiries.Select(i => i.ReferenceNumber), fullPrefix),
            await MaxSuffixAsync(_db.Appointments.Select(a => a.ReferenceNumber), fullPrefix));
        return $"{fullPrefix}{maxNum + 1:D4}";
    }

    private static async Task<int> MaxSuffixAsync(IQueryable<string> references, string fullPrefix)
    {
        var matching = await references.Where(r => r.StartsWith(fullPrefix)).ToListAsync();
        return matching
            .Select(r => int.TryParse(r.Substring(fullPrefix.Length), out var n) ? n : 0)
            .DefaultIfEmpty(0)
            .Max();
    }
}
