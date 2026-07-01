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

    // A high urgency can only tighten the deadline, never loosen the category's.
    private static readonly Dictionary<TicketPriority, int> PriorityCeilingHours = new()
    {
        [TicketPriority.Critical] = 2,
        [TicketPriority.High] = 8,
        [TicketPriority.Medium] = 24,
        [TicketPriority.Low] = 48,
    };

    /// <summary>
    /// Compute the SLA window as the stricter of the category's baseline and the
    /// priority ceiling, so e.g. a critical-priority ticket is always ≤ 2h even
    /// in an otherwise 24h category.
    /// </summary>
    public static (int Hours, DateTimeOffset Deadline) Compute(TicketCategory category, TicketPriority priority = TicketPriority.Medium)
    {
        var baseHours = SlaHours.GetValueOrDefault(category, 24);
        var ceiling = PriorityCeilingHours.GetValueOrDefault(priority, 24);
        var hours = Math.Min(baseHours, ceiling);
        return (hours, DateTimeOffset.UtcNow.AddHours(hours));
    }
}
