namespace OscApi.Services;

public interface ISettingsService
{
    Task<string> GetAsync(string key, string defaultValue = "");
    Task<Dictionary<string, string>> GetAllAsync();
    Task SetAsync(string key, string value, string? description, string? updatedBy);
    Task<string[]> GetEscalationEmailsAsync();
}
