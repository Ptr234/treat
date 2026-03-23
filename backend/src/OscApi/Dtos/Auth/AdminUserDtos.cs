namespace OscApi.Dtos.Auth;

public record CreateAdminRequest(string Name, string Email, string Password, string Role = "admin");

public record UpdateAdminRequest(string? Name, string? Role, bool? IsActive);

public record AdminListItem(string Id, string Name, string Email, string Role, bool IsActive, DateTimeOffset CreatedAt);
