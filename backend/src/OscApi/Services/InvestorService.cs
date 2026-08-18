using Microsoft.EntityFrameworkCore;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.Investors;
using OscApi.Models;

namespace OscApi.Services;

public class InvestorService : IInvestorService
{
    private readonly OscDbContext _db;
    private readonly IEmailService _email;
    private readonly IReferenceNumberGenerator _refGen;

    public InvestorService(OscDbContext db, IEmailService email, IReferenceNumberGenerator refGen)
    {
        _db = db;
        _email = email;
        _refGen = refGen;
    }

    public async Task<object> ListAsync(int from, int to, string? status)
    {
        var query = _db.InvestorProfiles.AsQueryable();

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<InvestorStatus>(status, true, out var parsed))
            query = query.Where(i => i.Status == parsed);

        var total = await query.CountAsync();
        var (skip, take) = Pagination.Normalize(from, to);
        var investors = await query
            .OrderByDescending(i => i.CreatedAt)
            .Skip(skip).Take(take)
            .Select(i => new
            {
                i.ReferenceNumber, i.Name, i.Email, i.Phone, i.Nationality,
                i.CompanyName, i.InvestorType, i.PrimarySector,
                Status = i.Status.ToString(), i.CreatedAt, i.LinkedBusinessRegistrationRef
            })
            .ToListAsync();

        return new { investors, total };
    }

    public async Task<InvestorDetailResponse?> GetByRefAsync(string refNumber, string? email, bool isAdmin)
    {
        var p = await _db.InvestorProfiles.FirstOrDefaultAsync(i => i.ReferenceNumber == refNumber);
        if (p is null) return null;

        if (!isAdmin && (string.IsNullOrEmpty(email) || email.ToLowerInvariant().Trim() != p.Email))
            return null;

        return new InvestorDetailResponse(
            p.ReferenceNumber, p.Name, p.Email, p.Phone, p.Nationality, p.CompanyName, p.Position,
            p.InvestorType.ToString(), p.Experience.ToString(), p.InvestmentGoal.ToString(),
            p.InvestmentAmount, p.TimeHorizon.ToString(), p.RiskTolerance.ToString(),
            p.PrimarySector, p.SecondarySectors, p.SpecificInterests,
            p.CapitalSource.ToString(), p.Timeframe.ToString(), p.SupportNeeded,
            p.Status.ToString(), p.CreatedAt, p.LinkedBusinessRegistrationRef
        );
    }

    public async Task<(InvestorResponse? Result, string? Error)> CreateAsync(CreateInvestorRequest request)
    {
        var email = request.Email.ToLowerInvariant().Trim();

        if (await _db.InvestorProfiles.AnyAsync(i => i.Email == email))
            return (null, "An investor profile with this email already exists");

        var profile = new InvestorProfile
        {
            Name = SanitizeHelper.StripHtml(request.Name),
            Email = email,
            Phone = request.Phone,
            Nationality = request.Nationality,
            CompanyName = request.CompanyName,
            Position = request.Position,
            InvestorType = Enum.Parse<InvestorType>(request.InvestorType, true),
            Experience = Enum.Parse<InvestorExperience>(request.Experience, true),
            InvestmentGoal = Enum.Parse<InvestmentGoal>(request.InvestmentGoal, true),
            InvestmentAmount = request.InvestmentAmount,
            TimeHorizon = Enum.Parse<TimeHorizon>(request.TimeHorizon.Replace("-", ""), true),
            RiskTolerance = Enum.Parse<RiskTolerance>(request.RiskTolerance, true),
            PrimarySector = request.PrimarySector,
            SecondarySectors = request.SecondarySectors?.ToArray() ?? Array.Empty<string>(),
            SpecificInterests = request.SpecificInterests,
            CapitalSource = Enum.Parse<CapitalSource>(request.CapitalSource, true),
            Timeframe = ParseTimeframe(request.Timeframe),
            SupportNeeded = request.SupportNeeded?.ToArray() ?? Array.Empty<string>(),
        };

        // Cross-agency reuse: if this investor already completed URSB registration
        // under the same email and company name, link to it so UIA doesn't ask them
        // to re-supply fundamentals URSB already collected and verified.
        if (!string.IsNullOrWhiteSpace(profile.CompanyName))
        {
            var companyName = profile.CompanyName.Trim().ToLower();
            profile.LinkedBusinessRegistrationRef = await _db.BusinessRegistrations
                .Where(r => r.Status == BusinessRegistrationStatus.CertificateIssued)
                .Where(r => r.ContactEmail == email && r.BusinessName.ToLower() == companyName)
                .Select(r => r.ReferenceNumber)
                .FirstOrDefaultAsync();
        }

        _db.InvestorProfiles.Add(profile);
        // Assign the reference number and persist with retry, so concurrent
        // submissions that generate the same number don't 500 (unique violation).
        await _db.SaveWithUniqueReferenceAsync(async () =>
            profile.ReferenceNumber = await _refGen.GenerateInvestorReferenceAsync());

        _ = _email.SendInvestorWelcomeAsync(profile.Email, profile.Name, profile.ReferenceNumber);

        return (new InvestorResponse(profile.ReferenceNumber, profile.Name, profile.Email, profile.Status.ToString()), null);
    }

    public async Task<InvestorResponse?> UpdateAsync(string refNumber, UpdateInvestorRequest request)
    {
        var profile = await _db.InvestorProfiles.FirstOrDefaultAsync(i => i.ReferenceNumber == refNumber);
        if (profile is null) return null;

        if (!string.IsNullOrWhiteSpace(request.Name)) profile.Name = SanitizeHelper.StripHtml(request.Name);
        if (!string.IsNullOrWhiteSpace(request.Phone)) profile.Phone = request.Phone;
        if (request.CompanyName is not null) profile.CompanyName = request.CompanyName;
        if (request.Position is not null) profile.Position = request.Position;
        if (!string.IsNullOrWhiteSpace(request.InvestmentAmount)) profile.InvestmentAmount = request.InvestmentAmount;
        if (!string.IsNullOrWhiteSpace(request.PrimarySector)) profile.PrimarySector = request.PrimarySector;
        if (request.SecondarySectors is not null) profile.SecondarySectors = request.SecondarySectors.ToArray();
        if (request.SpecificInterests is not null) profile.SpecificInterests = request.SpecificInterests;
        if (request.SupportNeeded is not null) profile.SupportNeeded = request.SupportNeeded.ToArray();
        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            // TryParse → 400 (via the FluentValidation middleware) instead of a
            // 500 when a client sends an unknown status string.
            if (!Enum.TryParse<InvestorStatus>(request.Status, true, out var status))
                throw new FluentValidation.ValidationException(
                    [new FluentValidation.Results.ValidationFailure("status", $"Invalid status '{request.Status}'")]);
            profile.Status = status;
        }

        await _db.SaveChangesAsync();

        return new InvestorResponse(profile.ReferenceNumber, profile.Name, profile.Email, profile.Status.ToString());
    }

    public async Task<bool> DeleteAsync(string refNumber)
    {
        var profile = await _db.InvestorProfiles.FirstOrDefaultAsync(i => i.ReferenceNumber == refNumber);
        if (profile is null) return false;

        _db.InvestorProfiles.Remove(profile);
        await _db.SaveChangesAsync();
        return true;
    }

    private static InvestorTimeframe ParseTimeframe(string value) => value switch
    {
        "immediate" => InvestorTimeframe.Immediate,
        "3-months" => InvestorTimeframe.ThreeMonths,
        "6-months" => InvestorTimeframe.SixMonths,
        "1-year" => InvestorTimeframe.OneYear,
        _ => Enum.Parse<InvestorTimeframe>(value, true),
    };
}
