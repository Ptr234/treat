using OscApi.Common;
using OscApi.Models;

namespace OscApi.Tests.Services;

public class SlaCalculatorTests
{
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
}
