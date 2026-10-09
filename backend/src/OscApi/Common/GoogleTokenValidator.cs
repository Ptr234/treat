using Google.Apis.Auth;

namespace OscApi.Common;

/// <summary>
/// Verifies a Google Sign-In ID token (signature, expiry, audience). An interface
/// so the sign-in rules that follow — account status, MFA, roles — can be tested
/// without a real Google-signed token.
/// </summary>
public interface IGoogleTokenValidator
{
    /// <summary>The verified payload; throws <see cref="InvalidJwtException"/> on an invalid token.</summary>
    Task<GoogleJsonWebSignature.Payload> ValidateAsync(string idToken, string clientId);
}

public class GoogleTokenValidator : IGoogleTokenValidator
{
    public Task<GoogleJsonWebSignature.Payload> ValidateAsync(string idToken, string clientId) =>
        GoogleJsonWebSignature.ValidateAsync(idToken,
            new GoogleJsonWebSignature.ValidationSettings { Audience = [clientId] });
}
