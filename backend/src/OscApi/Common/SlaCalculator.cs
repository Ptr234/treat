using OscApi.Models;

namespace OscApi.Common;

/// <summary>
/// SLA windows are counted in <b>business hours</b>: Monday–Friday, 08:00–17:00
/// East Africa Time (the OneStop Centre's published hours), skipping Ugandan
/// public holidays. A 1-hour VIP ticket filed on Saturday night is therefore due
/// at 09:00 on Monday, not breached before anyone could see it.
/// </summary>
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

    /// <summary>East Africa Time — UTC+3 all year (Uganda observes no DST).</summary>
    public static readonly TimeSpan Eat = TimeSpan.FromHours(3);
    public static readonly TimeSpan OpensAt = TimeSpan.FromHours(8);
    public static readonly TimeSpan ClosesAt = TimeSpan.FromHours(17);

    // Fixed-date public holidays (Public Holidays Act). Good Friday and Easter
    // Monday are computed; Eid al-Fitr / Eid al-Adha follow the lunar calendar
    // and are gazetted each year, so they come from configuration
    // (Sla:ExtraHolidays) via ConfigureExtraHolidays.
    private static readonly (int Month, int Day)[] FixedHolidays =
    [
        (1, 1),   // New Year's Day
        (1, 26),  // Liberation Day
        (2, 16),  // Archbishop Janani Luwum Day
        (3, 8),   // International Women's Day
        (5, 1),   // Labour Day
        (6, 3),   // Martyrs' Day
        (6, 9),   // National Heroes' Day
        (10, 9),  // Independence Day
        (12, 25), // Christmas Day
        (12, 26), // Boxing Day
    ];

    private static HashSet<DateOnly> _extraHolidays = [];

    /// <summary>Register gazetted holidays not derivable from the calendar (e.g. Eid).</summary>
    public static void ConfigureExtraHolidays(IEnumerable<DateOnly> dates) => _extraHolidays = [.. dates];

    /// <summary>Category baseline tightened by the priority ceiling, in business hours.</summary>
    public static int HoursFor(TicketCategory category, TicketPriority priority) =>
        Math.Min(SlaHours.GetValueOrDefault(category, 24), PriorityCeilingHours.GetValueOrDefault(priority, 24));

    /// <summary>
    /// Compute the SLA window as the stricter of the category's baseline and the
    /// priority ceiling, so e.g. a critical-priority ticket is always ≤ 2 business
    /// hours even in an otherwise 24h category. The deadline counts from
    /// <paramref name="from"/> (default: now) and is returned in UTC.
    /// </summary>
    public static (int Hours, DateTimeOffset Deadline) Compute(
        TicketCategory category, TicketPriority priority = TicketPriority.Medium, DateTimeOffset? from = null)
    {
        var hours = HoursFor(category, priority);
        return (hours, AddBusinessHours(from ?? DateTimeOffset.UtcNow, hours));
    }

    /// <summary>Advance <paramref name="start"/> by a number of business hours.</summary>
    public static DateTimeOffset AddBusinessHours(DateTimeOffset start, double hours)
    {
        var local = start.ToOffset(Eat);
        var remaining = TimeSpan.FromHours(hours);

        while (true)
        {
            if (!IsWorkingDay(DateOnly.FromDateTime(local.DateTime)) || local.TimeOfDay >= ClosesAt)
            {
                local = NextOpening(local);
                continue;
            }
            if (local.TimeOfDay < OpensAt)
                local = AtTime(local, OpensAt);

            var available = ClosesAt - local.TimeOfDay;
            if (remaining <= available)
                return local.Add(remaining).ToUniversalTime();

            remaining -= available;
            local = NextOpening(local);
        }
    }

    public static bool IsWorkingDay(DateOnly date)
    {
        if (date.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday) return false;
        if (FixedHolidays.Contains((date.Month, date.Day))) return false;
        var easter = EasterSunday(date.Year);
        if (date == easter.AddDays(-2) || date == easter.AddDays(1)) return false; // Good Friday, Easter Monday
        return !_extraHolidays.Contains(date);
    }

    private static DateTimeOffset AtTime(DateTimeOffset local, TimeSpan time) =>
        new(local.Date + time, local.Offset);

    private static DateTimeOffset NextOpening(DateTimeOffset local)
    {
        var day = DateOnly.FromDateTime(local.DateTime).AddDays(1);
        while (!IsWorkingDay(day)) day = day.AddDays(1);
        return new DateTimeOffset(day.ToDateTime(TimeOnly.FromTimeSpan(OpensAt)), local.Offset);
    }

    /// <summary>Gregorian Easter Sunday (anonymous / Meeus–Jones–Butcher algorithm).</summary>
    public static DateOnly EasterSunday(int year)
    {
        int a = year % 19, b = year / 100, c = year % 100, d = b / 4, e = b % 4;
        int f = (b + 8) / 25, g = (b - f + 1) / 3, h = (19 * a + b - d - g + 15) % 30;
        int i = c / 4, k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
        int m = (a + 11 * h + 22 * l) / 451;
        int month = (h + l - 7 * m + 114) / 31, day = (h + l - 7 * m + 114) % 31 + 1;
        return new DateOnly(year, month, day);
    }
}
