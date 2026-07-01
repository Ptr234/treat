using OscApi.Common;

namespace OscApi.Tests.Common;

public class PaginationTests
{
    [Fact]
    public void Normalize_NormalRange_ReturnsSkipAndTake()
    {
        var (skip, take) = Pagination.Normalize(0, 50);
        Assert.Equal(0, skip);
        Assert.Equal(50, take);
    }

    [Fact]
    public void Normalize_ReversedRange_ClampsTakeToZero()
    {
        // from > to previously produced a negative Take, which throws in EF.
        var (skip, take) = Pagination.Normalize(100, 0);
        Assert.Equal(100, skip);
        Assert.Equal(0, take);
    }

    [Fact]
    public void Normalize_NegativeFrom_ClampsSkipToZero()
    {
        var (skip, take) = Pagination.Normalize(-10, 20);
        Assert.Equal(0, skip);
        Assert.Equal(20, take);
    }

    [Fact]
    public void Normalize_UnboundedTo_CapsAtMaxPageSize()
    {
        var (skip, take) = Pagination.Normalize(0, 10_000_000);
        Assert.Equal(0, skip);
        Assert.Equal(Pagination.MaxPageSize, take);
    }
}
