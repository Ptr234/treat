using OscApi.Common;

namespace OscApi.Tests.Common;

public class MoneyParserTests
{
    [Theory]
    // The shapes the onboarding wizard and ticket form actually produce.
    [InlineData("USD 4,000,000", 4_000_000)]
    [InlineData("USD 25,000,000", 25_000_000)]
    [InlineData("USD 750,000", 750_000)]
    [InlineData("$120,000", 120_000)]
    [InlineData("120000", 120_000)]
    // Shorthand an investor might type free-hand.
    [InlineData("5m", 5_000_000)]
    [InlineData("2.5M USD", 2_500_000)]
    [InlineData("500k", 500_000)]
    [InlineData("1.2 billion", 1_200_000_000)]
    [InlineData("USD 3 million", 3_000_000)]
    public void ParseUsd_reads_the_amount(string raw, decimal expected)
    {
        Assert.Equal(expected, MoneyParser.ParseUsd(raw));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("to be confirmed")]
    [InlineData("N/A")]
    public void ParseUsd_returns_null_when_there_is_no_figure(string? raw)
    {
        Assert.Null(MoneyParser.ParseUsd(raw));
    }

    [Fact]
    public void ParseUsd_rejects_zero_so_it_cannot_masquerade_as_a_real_amount()
    {
        Assert.Null(MoneyParser.ParseUsd("USD 0"));
    }

    [Fact]
    public void SumUsd_skips_unreadable_entries_rather_than_counting_them_as_zero()
    {
        var values = new[] { "USD 1,000,000", "to be confirmed", null, "500k", "" };
        Assert.Equal(1_500_000m, MoneyParser.SumUsd(values));
    }

    [Fact]
    public void SumUsd_of_nothing_is_zero()
    {
        Assert.Equal(0m, MoneyParser.SumUsd(Array.Empty<string?>()));
    }
}

public class AgencyDirectoryTests
{
    [Theory]
    [InlineData("UIA", "Uganda Investment Authority")]
    [InlineData("URSB", "Uganda Registration Services Bureau")]
    [InlineData("ursb", "Uganda Registration Services Bureau")]
    public void NameFor_resolves_known_codes_case_insensitively(string code, string expected)
    {
        Assert.Equal(expected, AgencyDirectory.NameFor(code));
    }

    [Fact]
    public void NameFor_falls_back_to_the_code_when_the_agency_is_unknown()
    {
        Assert.Equal("XYZ", AgencyDirectory.NameFor("XYZ"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void NameFor_labels_a_missing_code_as_unassigned(string? code)
    {
        Assert.Equal("Unassigned", AgencyDirectory.NameFor(code));
    }
}
