using OscApi.Data;
using Microsoft.EntityFrameworkCore;

namespace OscApi.Common;

public interface IReferenceNumberGenerator
{
    Task<string> GenerateTicketReferenceAsync();
    Task<string> GenerateInvestorReferenceAsync();
    Task<string> GenerateInquiryReferenceAsync();
    Task<string> GenerateAppointmentReferenceAsync();
    Task<string> GenerateBusinessRegistrationReferenceAsync();
    Task<string> GenerateCertificateNumberAsync();
}

public class ReferenceNumberGenerator : IReferenceNumberGenerator
{
    private readonly OscDbContext _db;

    public ReferenceNumberGenerator(OscDbContext db)
    {
        _db = db;
    }

    public Task<string> GenerateTicketReferenceAsync() =>
        GenerateReferenceAsync("UIA", _db.Tickets.Select(t => t.ReferenceNumber));

    public Task<string> GenerateInvestorReferenceAsync() =>
        GenerateReferenceAsync("INV", _db.InvestorProfiles.Select(i => i.ReferenceNumber));

    // INQ and APT both check the other's table too, so the two sequences can
    // never collide even if a future change moved either kind of record into
    // a shared table.
    public Task<string> GenerateInquiryReferenceAsync() =>
        GenerateReferenceAsync("INQ",
            _db.ContactInquiries.Select(i => i.ReferenceNumber),
            _db.Appointments.Select(a => a.ReferenceNumber));

    public Task<string> GenerateAppointmentReferenceAsync() =>
        GenerateReferenceAsync("APT",
            _db.ContactInquiries.Select(i => i.ReferenceNumber),
            _db.Appointments.Select(a => a.ReferenceNumber));

    public Task<string> GenerateBusinessRegistrationReferenceAsync() =>
        GenerateReferenceAsync("REG", _db.BusinessRegistrations.Select(r => r.ReferenceNumber));

    public Task<string> GenerateCertificateNumberAsync() =>
        GenerateReferenceAsync("URSB-CERT", _db.BusinessRegistrations
            .Where(r => r.CertificateNumber != null)
            .Select(r => r.CertificateNumber!));

    /// <summary>
    /// Compute the next sequence number for a reference prefix across one or more
    /// reference-number columns. Fetches only the references matching the prefix (a
    /// LIKE on the DB) and takes the numeric MAX of their suffixes in memory. Parsing
    /// the suffix as an int — rather than ordering the strings — keeps this correct
    /// past 9999, where "UIA-2026-10000" sorts *below* "UIA-2026-9999" as text.
    /// Provider-agnostic (works on Postgres and the in-memory test provider). Callers
    /// must persist under <see cref="DbRetry.SaveWithUniqueReferenceAsync"/> to survive
    /// the race where two requests read the same MAX concurrently.
    /// </summary>
    private static async Task<string> GenerateReferenceAsync(string prefix, params IQueryable<string>[] referenceSources)
    {
        var fullPrefix = $"{prefix}-{DateTime.UtcNow.Year}-";
        var maxNum = 0;
        foreach (var source in referenceSources)
            maxNum = Math.Max(maxNum, await MaxSuffixAsync(source, fullPrefix));
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
