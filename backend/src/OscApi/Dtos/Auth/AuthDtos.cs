namespace OscApi.Dtos.Auth;

public record LoginRequest(string Email, string Password);

public record GoogleAuthRequest(string IdToken);

public record ProfileUpdateRequest(string? Name, string? CurrentPassword, string? NewPassword);

public record AuthResponse(string Id, string Email, string Name, string Role, string? Picture = null);

public record PasswordResetRequest(string Email);

public record PasswordResetVerifyRequest(string Token, string NewPassword);
