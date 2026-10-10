using OscApi.Controllers;

namespace OscApi.Tests.Common;

/// <summary>
/// The assistant must not quote legal/financial figures from the model's memory
/// (it stated a pre-2019 minimum capital in a production test); only figures
/// configured as verified may be stated.
/// </summary>
public class ChatbotPromptTests
{
    [Fact]
    public void WithoutVerifiedFacts_ForbidsStatingFigures_AndPointsToTheAgency()
    {
        var prompt = ChatbotController.BuildSystemPrompt("en");

        Assert.Contains("do NOT state specific amounts", prompt);
        Assert.Contains("minimum investment or capital requirements", prompt);
        Assert.Contains("+256 414 301 000", prompt);
        Assert.Contains("none are configured", prompt);
    }

    [Fact]
    public void VerifiedFacts_AreListedAsTheOnlyStatableFigures()
    {
        var prompt = ChatbotController.BuildSystemPrompt("sw", ["Example verified fact one", "Example verified fact two"]);

        Assert.Contains("no other figures", prompt);
        Assert.Contains("- Example verified fact one", prompt);
        Assert.Contains("- Example verified fact two", prompt);
        Assert.DoesNotContain("none are configured", prompt);
        Assert.Contains("Respond in Swahili.", prompt);
    }
}
