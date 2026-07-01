using OscApi.Data;
using Microsoft.EntityFrameworkCore;

namespace OscApi.Common;

public class ReferenceNumberGenerator
{
    private readonly OscDbContext _db;

    public ReferenceNumberGenerator(OscDbContext db)
    {
        _db = db;
    }

    public async Task<string> GenerateTicketReferenceAsync()
    {
        var prefix = $"UIA-{DateTime.UtcNow.Year}-";
        var next = await NextNumberAsync(_db.Tickets.Select(t => t.ReferenceNumber), prefix);
        return $"{prefix}{next:D4}";
    }

    public async Task<string> GenerateInvestorReferenceAsync()
    {
        var prefix = $"INV-{DateTime.UtcNow.Year}-";
        var next = await NextNumberAsync(_db.InvestorProfiles.Select(i => i.ReferenceNumber), prefix);
        return $"{prefix}{next:D4}";
    }

    /// <summary>
    /// Compute the next sequence number for a reference prefix. Fetches only the
    /// references matching the prefix (a LIKE on the DB) and takes the numeric MAX of
    /// their suffixes in memory. Parsing the suffix as an int — rather than ordering
    /// the strings — keeps this correct past 9999, where "UIA-2026-10000" sorts
    /// *below* "UIA-2026-9999" as text. Provider-agnostic (works on Postgres and the
    /// in-memory test provider). Callers must persist under
    /// <see cref="DbRetry.SaveWithUniqueReferenceAsync"/> to survive the race where
    /// two requests read the same MAX concurrently.
    /// </summary>
    private static async Task<int> NextNumberAsync(IQueryable<string> references, string prefix)
    {
        var matching = await references.Where(r => r.StartsWith(prefix)).ToListAsync();
        return matching
            .Select(r => int.TryParse(r.Substring(prefix.Length), out var n) ? n : 0)
            .DefaultIfEmpty(0)
            .Max() + 1;
    }
}
