using OscApi.Dtos.Investors;
using OscApi.Validators;

namespace OscApi.Tests.Validators;

public class CreateInvestorValidatorTests
{
    private readonly CreateInvestorValidator _validator = new();

    private static CreateInvestorRequest Valid() => new(
        Name: "Jane Investor",
        Email: "jane@example.com",
        Phone: "+256700000000",
        Nationality: "Ugandan",
        CompanyName: "Test Co",
        Position: "CEO",
        InvestorType: "foreign",
        Experience: "intermediate",
        InvestmentGoal: "growth",
        InvestmentAmount: "1000000",
        TimeHorizon: "long-term",
        RiskTolerance: "moderate",
        PrimarySector: "Manufacturing",
        SecondarySectors: null,
        SpecificInterests: null,
        CapitalSource: "savings",
        Timeframe: "6-months",
        SupportNeeded: null);

    [Fact]
    public void Valid_FormValues_PassValidation()
    {
        var result = _validator.Validate(Valid());
        Assert.True(result.IsValid, string.Join("; ", result.Errors.Select(e => e.ErrorMessage)));
    }

    [Theory]
    [InlineData("5+ years")]      // human text, not an enum
    [InlineData("expert")]
    [InlineData("")]
    public void Invalid_Experience_FailsWithMessage(string experience)
    {
        var result = _validator.Validate(Valid() with { Experience = experience });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "Experience");
    }

    [Theory]
    [InlineData(nameof(CreateInvestorRequest.InvestorType), "corporation")]
    [InlineData(nameof(CreateInvestorRequest.InvestmentGoal), "profit")]
    [InlineData(nameof(CreateInvestorRequest.TimeHorizon), "forever")]
    [InlineData(nameof(CreateInvestorRequest.RiskTolerance), "reckless")]
    [InlineData(nameof(CreateInvestorRequest.CapitalSource), "crypto")]
    [InlineData(nameof(CreateInvestorRequest.Timeframe), "someday")]
    public void Invalid_EnumFields_AreRejected(string field, string badValue)
    {
        var req = Valid();
        req = field switch
        {
            nameof(CreateInvestorRequest.InvestorType) => req with { InvestorType = badValue },
            nameof(CreateInvestorRequest.InvestmentGoal) => req with { InvestmentGoal = badValue },
            nameof(CreateInvestorRequest.TimeHorizon) => req with { TimeHorizon = badValue },
            nameof(CreateInvestorRequest.RiskTolerance) => req with { RiskTolerance = badValue },
            nameof(CreateInvestorRequest.CapitalSource) => req with { CapitalSource = badValue },
            nameof(CreateInvestorRequest.Timeframe) => req with { Timeframe = badValue },
            _ => req,
        };

        var result = _validator.Validate(req);
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == field);
    }

    [Fact]
    public void EnumValues_AreCaseInsensitive()
    {
        var result = _validator.Validate(Valid() with { InvestorType = "FOREIGN", Experience = "Advanced" });
        Assert.True(result.IsValid);
    }
}
