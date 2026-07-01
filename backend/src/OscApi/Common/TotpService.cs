using OtpNet;

namespace OscApi.Common;

/// <summary>
/// Time-based one-time password (TOTP, RFC 6238) helper for admin multi-factor auth.
/// Secrets are base32-encoded so they can be stored as text and rendered into the
/// standard otpauth:// URI that authenticator apps (Google Authenticator, Authy…) consume.
/// </summary>
public class TotpService
{
    // Shown as the account issuer inside authenticator apps.
    private const string Issuer = "OSC Digital Tool";

    /// <summary>Generate a fresh random base32 secret (160-bit, the RFC-recommended size).</summary>
    public string GenerateSecret()
    {
        var key = KeyGeneration.GenerateRandomKey(20);
        return Base32Encoding.ToString(key);
    }

    /// <summary>
    /// Build the otpauth:// provisioning URI for a secret, which the enrolment UI
    /// renders as a QR code. The label carries the issuer and the admin's email.
    /// </summary>
    public string BuildOtpauthUri(string email, string base32Secret)
    {
        var issuer = Uri.EscapeDataString(Issuer);
        var label = Uri.EscapeDataString($"{Issuer}:{email}");
        return $"otpauth://totp/{label}?secret={base32Secret}&issuer={issuer}&algorithm=SHA1&digits=6&period=30";
    }

    /// <summary>
    /// Verify a 6-digit code against a base32 secret. Allows a ±1 step (±30s) window
    /// to tolerate clock drift between the server and the authenticator device.
    /// </summary>
    public bool Verify(string? base32Secret, string? code)
    {
        if (string.IsNullOrWhiteSpace(base32Secret) || string.IsNullOrWhiteSpace(code))
            return false;

        code = code.Trim().Replace(" ", "");
        if (code.Length != 6 || !code.All(char.IsDigit))
            return false;

        try
        {
            var totp = new Totp(Base32Encoding.ToBytes(base32Secret));
            return totp.VerifyTotp(code, out _, new VerificationWindow(previous: 1, future: 1));
        }
        catch
        {
            return false;
        }
    }
}
