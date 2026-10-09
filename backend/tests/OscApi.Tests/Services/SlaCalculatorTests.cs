using OscApi.Common;
using OscApi.Models;

namespace OscApi.Tests.Services;

public class SlaCalculatorTests
{
    // Instants in East Africa Time (UTC+3), the zone the office hours are in.
    private static DateTimeOffset Eat(int y, int mo, int d, int h, int mi = 0) => new(y, mo, d, h, mi, 0, TimeSpan.FromHours(3));

    [Fact]
    public void HighPriority_TightensCategoryBaseline()
    {
        // General inquiry is 24h, but a critical priority caps it at 2h.
        var (hours, _) = SlaCalculator.Compute(TicketCategory.GeneralInquiry, TicketPriority.Critical);
        Assert.Equal(2, hours);
    }

    [Fact]
    public void LowPriority_NeverLoosensAStrictCategory()
    {
        // VIP is already 1h; a low priority must not extend it to 48h.
        var (hours, _) = SlaCalculator.Compute(TicketCategory.Vip, TicketPriority.Low);
        Assert.Equal(1, hours);
    }

    [Fact]
    public void MediumPriority_UsesCategoryBaseline()
    {
        var (hours, deadline) = SlaCalculator.Compute(TicketCategory.ProcedureQuery, TicketPriority.Medium);
        Assert.Equal(8, hours);
        Assert.True(deadline > DateTimeOffset.UtcNow);
    }

    [Fact]
    public void WeekendFiling_StartsTheClockOnMonday()
    {
        // VIP (1h) filed Saturday 23:00 is due Monday 09:00, not Sunday 00:00.
        var (_, deadline) = SlaCalculator.Compute(TicketCategory.Vip, TicketPriority.Critical, Eat(2026, 11, 7, 23));
        Assert.Equal(Eat(2026, 11, 9, 9), deadline);
    }

    [Fact]
    public void Window_CarriesOverClosingTime()
    {
        // Friday 16:30 + 2 business hours: 30 min Friday, 90 min Monday → 09:30.
        Assert.Equal(Eat(2026, 11, 9, 9, 30), SlaCalculator.AddBusinessHours(Eat(2026, 11, 6, 16, 30), 2));
    }

    [Fact]
    public void LongWindow_SpansWorkingDays()
    {
        // Thursday 10:00 + 24h (9h days): 7h Thu, 9h Fri, 8h Mon → Monday 16:00.
        Assert.Equal(Eat(2026, 11, 9, 16), SlaCalculator.AddBusinessHours(Eat(2026, 11, 5, 10), 24));
    }

    [Fact]
    public void BeforeOpening_StartsAtEight()
    {
        Assert.Equal(Eat(2026, 11, 5, 9), SlaCalculator.AddBusinessHours(Eat(2026, 11, 5, 6), 1));
    }

    [Fact]
    public void PublicHolidays_AreSkipped()
    {
        // Independence Day (Fri 9 Oct 2026): Thursday 16:00 + 2h → 1h Thursday, 1h Monday 12 Oct.
        Assert.Equal(Eat(2026, 10, 12, 9), SlaCalculator.AddBusinessHours(Eat(2026, 10, 8, 16), 2));
        // Easter 2026 is 5 April: Good Friday (3rd) and Easter Monday (6th) are holidays.
        Assert.False(SlaCalculator.IsWorkingDay(new DateOnly(2026, 4, 3)));
        Assert.False(SlaCalculator.IsWorkingDay(new DateOnly(2026, 4, 6)));
        Assert.True(SlaCalculator.IsWorkingDay(new DateOnly(2026, 4, 7)));
    }

    [Fact]
    public void EasterSunday_KnownYears()
    {
        Assert.Equal(new DateOnly(2025, 4, 20), SlaCalculator.EasterSunday(2025));
        Assert.Equal(new DateOnly(2026, 4, 5), SlaCalculator.EasterSunday(2026));
        Assert.Equal(new DateOnly(2027, 3, 28), SlaCalculator.EasterSunday(2027));
    }

    [Fact]
    public void Deadline_IsReturnedInUtc()
    {
        // Npgsql only writes timestamptz values with a zero offset.
        var (_, deadline) = SlaCalculator.Compute(TicketCategory.Complaint, TicketPriority.High, Eat(2026, 11, 5, 10));
        Assert.Equal(TimeSpan.Zero, deadline.Offset);
    }
}
