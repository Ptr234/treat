using OscApi.Common;

namespace OscApi.Tests.Common;

public class PasswordServiceTests
{
    private readonly PasswordService _svc = new();

    [Fact]
    public void HashPassword_ThenVerify_Succeeds()
    {
        var hash = _svc.HashPassword("Passw0rd1");
        Assert.True(_svc.VerifyPassword("Passw0rd1", hash));
    }

    [Fact]
    public void VerifyPassword_WithWrongPassword_Fails()
    {
        var hash = _svc.HashPassword("Passw0rd1");
        Assert.False(_svc.VerifyPassword("wrong-password", hash));
    }

    [Fact]
    public void HashPassword_IsSalted_ProducesDifferentHashes()
    {
        var h1 = _svc.HashPassword("SamePass1");
        var h2 = _svc.HashPassword("SamePass1");

        Assert.NotEqual(h1, h2);            // per-hash salt
        Assert.True(_svc.VerifyPassword("SamePass1", h1));
        Assert.True(_svc.VerifyPassword("SamePass1", h2));
    }

    [Fact]
    public void HashPassword_DoesNotStorePlaintext()
    {
        var hash = _svc.HashPassword("Sup3rSecret");
        Assert.DoesNotContain("Sup3rSecret", hash);
    }
}
