using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.BusinessRegistrations;
using OscApi.Models;

namespace OscApi.Services;

public class BusinessRegistrationService : IBusinessRegistrationService
{
    private readonly OscDbContext _db;
    private readonly IEmailService _email;
    private readonly IReferenceNumberGenerator _refGen;

    /// <summary>Only URSB handles business registration today.</summary>
    private const string OwningAgencyCode = "URSB";

    public BusinessRegistrationService(OscDbContext db, IEmailService email, IReferenceNumberGenerator refGen)
    {
        _db = db;
        _email = email;
        _refGen = refGen;
    }

    public async Task<NameCheckResponse> CheckNameAsync(string name)
    {
        var normalized = name.Trim();
        if (normalized.Length == 0)
            return new NameCheckResponse(false, name, null);

        // A name is unavailable while it's live in the pipeline or already registered;
        // a name freed up by rejection can be reused.
        var blockingStatuses = new[]
        {
            BusinessRegistrationStatus.Received,
            BusinessRegistrationStatus.UnderReview,
            BusinessRegistrationStatus.NameApproved,
            BusinessRegistrationStatus.CertificateIssued,
        };

        var conflict = await _db.BusinessRegistrations
            .Where(r => blockingStatuses.Contains(r.Status))
            .Where(r => r.BusinessName.ToLower() == normalized.ToLower())
            .Select(r => r.ReferenceNumber)
            .FirstOrDefaultAsync();

        return new NameCheckResponse(conflict is null, normalized, conflict);
    }

    public async Task<BusinessRegistrationResponse> CreateAsync(CreateBusinessRegistrationRequest request)
    {
        var registration = new BusinessRegistration
        {
            BusinessName = SanitizeHelper.StripHtml(request.BusinessName),
            BusinessType = SanitizeHelper.StripHtml(request.BusinessType),
            BusinessStructure = SanitizeHelper.StripHtml(request.BusinessStructure),
            BusinessDescription = request.BusinessDescription is null ? null : SanitizeHelper.StripHtml(request.BusinessDescription),
            Sector = SanitizeHelper.StripHtml(request.Sector),
            Location = SanitizeHelper.StripHtml(request.Location),
            OwnersJson = JsonSerializer.Serialize(request.Owners.Select(o => o with
            {
                Name = SanitizeHelper.StripHtml(o.Name),
                Nationality = SanitizeHelper.StripHtml(o.Nationality),
            })),
            InitialCapital = request.InitialCapital,
            ProjectedTurnover = request.ProjectedTurnover,
            ContactName = SanitizeHelper.StripHtml(request.ContactName),
            ContactEmail = request.ContactEmail.ToLowerInvariant().Trim(),
            ContactPhone = request.ContactPhone,
            AssignedAgencyCode = OwningAgencyCode,
        };

        _db.BusinessRegistrations.Add(registration);
        await _db.SaveWithUniqueReferenceAsync(async () =>
            registration.ReferenceNumber = await _refGen.GenerateBusinessRegistrationReferenceAsync());

        _ = _email.SendBusinessRegistrationReceivedAsync(
            registration.ContactEmail, registration.ContactName, registration.ReferenceNumber, registration.BusinessName);

        return new BusinessRegistrationResponse(
            registration.ReferenceNumber, registration.BusinessName, registration.Status.ToString(), registration.CreatedAt);
    }

    public async Task<object> ListAsync(int from, int to, string? agencyScope)
    {
        // A non-URSB agency officer has no visibility into this registry at all.
        if (!string.IsNullOrEmpty(agencyScope) && agencyScope != OwningAgencyCode)
            return new { registrations = Array.Empty<object>(), total = 0 };

        var query = _db.BusinessRegistrations.AsQueryable();
        var total = await query.CountAsync();
        var (skip, take) = Pagination.Normalize(from, to);

        var registrations = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip(skip).Take(take)
            .Select(r => new
            {
                r.ReferenceNumber, r.BusinessName, r.BusinessType, r.Sector,
                r.ContactName, r.ContactEmail, Status = r.Status.ToString(),
                r.CreatedAt, r.CertificateIssuedAt,
            })
            .ToListAsync();

        return new { registrations, total };
    }

    public async Task<BusinessRegistrationDetailResponse?> GetByRefAsync(string refNumber, string? email, bool isStaff)
    {
        var r = await _db.BusinessRegistrations.FirstOrDefaultAsync(x => x.ReferenceNumber == refNumber);
        if (r is null) return null;

        if (!isStaff && (string.IsNullOrEmpty(email) || email.ToLowerInvariant().Trim() != r.ContactEmail))
            return null;

        return ToDetailResponse(r);
    }

    public async Task<BusinessRegistrationDetailResponse?> UpdateAsync(string refNumber, UpdateBusinessRegistrationRequest request, string? agencyScope)
    {
        if (!string.IsNullOrEmpty(agencyScope) && agencyScope != OwningAgencyCode)
            return null;

        var r = await _db.BusinessRegistrations.FirstOrDefaultAsync(x => x.ReferenceNumber == refNumber);
        if (r is null) return null;

        if (request.ReviewNotes is not null)
            r.ReviewNotes = SanitizeHelper.StripHtml(request.ReviewNotes);

        var previousStatus = r.Status;
        var statusChanged = false;

        if (request.Status is not null)
        {
            if (!Enum.TryParse<BusinessRegistrationStatus>(ToPascalCase(request.Status), true, out var status))
                throw new FluentValidation.ValidationException(
                    [new FluentValidation.Results.ValidationFailure("status", $"Invalid status '{request.Status}'")]);

            // A certificate can only be issued once a name has actually been
            // approved — this is the one real business rule the ticket-based flow
            // never had, and it's the whole point of this being its own workflow.
            if (status == BusinessRegistrationStatus.CertificateIssued && r.Status != BusinessRegistrationStatus.NameApproved)
                throw new FluentValidation.ValidationException(
                    [new FluentValidation.Results.ValidationFailure("status", "A certificate can only be issued for a registration whose name has been approved")]);

            if (status == BusinessRegistrationStatus.Rejected && string.IsNullOrWhiteSpace(request.RejectionReason) && string.IsNullOrWhiteSpace(r.RejectionReason))
                throw new FluentValidation.ValidationException(
                    [new FluentValidation.Results.ValidationFailure("rejectionReason", "A rejection reason is required")]);

            r.Status = status;
            statusChanged = status != previousStatus;

            if (status is BusinessRegistrationStatus.NameApproved or BusinessRegistrationStatus.NameRejected)
                r.NameDecisionAt = DateTimeOffset.UtcNow;

            if (status == BusinessRegistrationStatus.CertificateIssued && r.CertificateNumber is null)
            {
                r.CertificateNumber = await _refGen.GenerateCertificateNumberAsync();
                r.CertificateIssuedAt = DateTimeOffset.UtcNow;
            }
        }

        if (request.RejectionReason is not null)
            r.RejectionReason = SanitizeHelper.StripHtml(request.RejectionReason);

        await _db.SaveChangesAsync();

        if (statusChanged)
        {
            if (r.Status == BusinessRegistrationStatus.CertificateIssued)
                _ = _email.SendBusinessRegistrationCertificateIssuedAsync(
                    r.ContactEmail, r.ContactName, r.ReferenceNumber, r.BusinessName, r.CertificateNumber!);
            else
                _ = _email.SendBusinessRegistrationStatusUpdateAsync(
                    r.ContactEmail, r.ContactName, r.ReferenceNumber, r.BusinessName, r.Status.ToString());
        }

        return ToDetailResponse(r);
    }

    public async Task<CertificateResponse?> GetCertificateAsync(string refNumber, string? email, bool isStaff)
    {
        var r = await _db.BusinessRegistrations.FirstOrDefaultAsync(x => x.ReferenceNumber == refNumber);
        if (r is null || r.Status != BusinessRegistrationStatus.CertificateIssued || r.CertificateNumber is null)
            return null;

        if (!isStaff && (string.IsNullOrEmpty(email) || email.ToLowerInvariant().Trim() != r.ContactEmail))
            return null;

        return new CertificateResponse(
            r.ReferenceNumber, r.CertificateNumber, r.BusinessName, r.BusinessType, r.BusinessStructure,
            r.Location, DeserializeOwners(r.OwnersJson), r.CertificateIssuedAt!.Value);
    }

    private static BusinessRegistrationDetailResponse ToDetailResponse(BusinessRegistration r)
    {
        var terminalAt = r.Status switch
        {
            BusinessRegistrationStatus.CertificateIssued => r.CertificateIssuedAt,
            BusinessRegistrationStatus.Rejected or BusinessRegistrationStatus.NameRejected => r.UpdatedAt,
            _ => (DateTimeOffset?)null,
        };
        var processingHours = ((terminalAt ?? DateTimeOffset.UtcNow) - r.CreatedAt).TotalHours;

        return new BusinessRegistrationDetailResponse(
            r.ReferenceNumber, r.BusinessName, r.BusinessType, r.BusinessStructure, r.BusinessDescription,
            r.Sector, r.Location, DeserializeOwners(r.OwnersJson), r.InitialCapital, r.ProjectedTurnover,
            r.ContactName, r.ContactEmail, r.ContactPhone, r.Status.ToString(), r.AssignedAgencyCode,
            r.ReviewNotes, r.RejectionReason, r.NameDecisionAt, r.CertificateNumber, r.CertificateIssuedAt,
            r.CreatedAt, Math.Round(processingHours, 1));
    }

    private static List<OwnerInfo> DeserializeOwners(string json) =>
        JsonSerializer.Deserialize<List<OwnerInfo>>(json) ?? [];

    private static string ToPascalCase(string snakeCase) =>
        string.Join("", snakeCase.Split('_').Select(s => s.Length > 0 ? char.ToUpper(s[0]) + s[1..] : s));
}
