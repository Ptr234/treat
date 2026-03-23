using OscApi.Services;

namespace OscApi.Tests.Helpers;

public class MockSettingsService : ISettingsService
{
    private readonly Dictionary<string, string> _store = new();

    public Task<string> GetAsync(string key, string defaultValue = "")
        => Task.FromResult(_store.TryGetValue(key, out var val) ? val : defaultValue);

    public Task<Dictionary<string, string>> GetAllAsync()
        => Task.FromResult(new Dictionary<string, string>(_store));

    public Task SetAsync(string key, string value, string? description, string? updatedBy)
    {
        _store[key] = value;
        return Task.CompletedTask;
    }

    public Task<string[]> GetEscalationEmailsAsync()
        => Task.FromResult(Array.Empty<string>());
}
