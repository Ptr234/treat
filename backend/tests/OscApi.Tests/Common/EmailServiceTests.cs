using OscApi.Common;

namespace OscApi.Tests.Common;

public class EmailServiceTests
{
    [Theory]
    [InlineData("anonymous@feedback.invalid")]
    [InlineData("someone@host.local")]
    [InlineData("a@b.test")]
    [InlineData("a@example.example")]
    [InlineData("a@machine.localhost.")]
    [InlineData("A@FEEDBACK.INVALID")]
    public void IsUndeliverable_ReservedTlds(string address) =>
        Assert.True(EmailService.IsUndeliverable(address));

    [Theory]
    [InlineData("investor@gmail.com")]
    [InlineData("officer@uia.go.ug")]
    [InlineData("someone@invalid.com")]
    [InlineData("someone@example.com")]
    public void IsUndeliverable_RealDomains(string address) =>
        Assert.False(EmailService.IsUndeliverable(address));
}
