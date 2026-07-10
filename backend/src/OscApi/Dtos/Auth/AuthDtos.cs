namespace OscApi.Dtos.Auth;

public record LoginRequest(string Email, string Password, string? MfaCode = null);

/// <summary>Returned by login when the admin has MFA enabled and no valid code was supplied yet.</summary>
public record MfaChallengeResponse(bool MfaRequired = true);

/// <summary>Returned by the enrol endpoint: the shared secret and its otpauth QR URI.</summary>
public record MfaEnrollResponse(string Secret, string OtpauthUri);

public record MfaVerifyRequest(string Code);

public record MfaDisableRequest(string Password, string Code);

public record MfaStatusResponse(bool Enabled);

public record SignupRequest(string Name, string Email, string Password);

public record GoogleAuthRequest(string IdToken, string? MfaCode = null);

public record ProfileUpdateRequest(string? Name, string? CurrentPassword, string? NewPassword);

public record AuthResponse(string Id, string Email, string Name, string Role, string? Picture = null, string? AgencyCode = null);

public record PasswordResetRequest(string Email);

public record PasswordResetVerifyRequest(string Token, string NewPassword);
