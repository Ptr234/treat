using OscApi.Models;

namespace OscApi.Common;

public static class SlaCalculator
{
    private static readonly Dictionary<TicketCategory, int> SlaHours = new()
    {
        [TicketCategory.GeneralInquiry] = 24,
        [TicketCategory.ProcedureQuery] = 8,
        [TicketCategory.ApplicationSupport] = 4,
        [TicketCategory.LicenseDelay] = 2,
        [TicketCategory.Complaint] = 2,
        [TicketCategory.Vip] = 1,
    };

    public static (int Hours, DateTimeOffset Deadline) Compute(TicketCategory category)
    {
        var hours = SlaHours.GetValueOrDefault(category, 24);
        return (hours, DateTimeOffset.UtcNow.AddHours(hours));
    }
}
