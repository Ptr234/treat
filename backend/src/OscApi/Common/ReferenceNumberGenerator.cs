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
        var year = DateTime.UtcNow.Year;
        var prefix = $"UIA-{year}-";

        var lastRef = await _db.Tickets
            .Where(t => t.ReferenceNumber.StartsWith(prefix))
            .OrderByDescending(t => t.ReferenceNumber)
            .Select(t => t.ReferenceNumber)
            .FirstOrDefaultAsync();

        var nextNumber = 1;
        if (lastRef is not null)
        {
            var numPart = lastRef.Replace(prefix, "");
            if (int.TryParse(numPart, out var parsed))
                nextNumber = parsed + 1;
        }

        return $"{prefix}{nextNumber:D4}";
    }

    public async Task<string> GenerateInvestorReferenceAsync()
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"INV-{year}-";

        var lastRef = await _db.InvestorProfiles
            .Where(i => i.ReferenceNumber.StartsWith(prefix))
            .OrderByDescending(i => i.ReferenceNumber)
            .Select(i => i.ReferenceNumber)
            .FirstOrDefaultAsync();

        var nextNumber = 1;
        if (lastRef is not null)
        {
            var numPart = lastRef.Replace(prefix, "");
            if (int.TryParse(numPart, out var parsed))
                nextNumber = parsed + 1;
        }

        return $"{prefix}{nextNumber:D4}";
    }
}
