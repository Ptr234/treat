using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using OscApi.Data;
using OscApi.Models;

namespace OscApi.Services;

public class SettingsService : ISettingsService
{
    private readonly OscDbContext _db;
    private readonly IMemoryCache _cache;

    // Default settings keys
    public const string EscalationEmailsKey = "escalation.emails";
    public const string EscalationDefaultAssigneeKey = "escalation.default_assignee";
    public const string EscalationMessageKey = "escalation.notification_message";

    private const int CacheDurationMinutes = 60;

    public SettingsService(OscDbContext db, IMemoryCache cache)
    {
        _db = db;
        _cache = cache;
    }

    public async Task<string> GetAsync(string key, string defaultValue = "")
    {
        var cacheKey = $"settings:{key}";
        if (_cache.TryGetValue(cacheKey, out string? cachedValue))
            return cachedValue ?? defaultValue;

        var setting = await _db.SystemSettings.FindAsync(key);
        var value = setting?.Value ?? defaultValue;
        _cache.Set(cacheKey, value, TimeSpan.FromMinutes(CacheDurationMinutes));
        return value;
    }

    public async Task<Dictionary<string, string>> GetAllAsync()
    {
        return await _db.SystemSettings
            .ToDictionaryAsync(s => s.Key, s => s.Value);
    }

    public async Task SetAsync(string key, string value, string? description, string? updatedBy)
    {
        var setting = await _db.SystemSettings.FindAsync(key);
        if (setting is null)
        {
            setting = new SystemSetting
            {
                Key = key,
                Value = value,
                Description = description,
                UpdatedBy = updatedBy,
            };
            _db.SystemSettings.Add(setting);
        }
        else
        {
            setting.Value = value;
            if (description is not null) setting.Description = description;
            setting.UpdatedBy = updatedBy;
            setting.UpdatedAt = DateTimeOffset.UtcNow;
        }

        await _db.SaveChangesAsync();

        // Invalidate cache on update
        _cache.Remove($"settings:{key}");
        _cache.Remove("settings:escalation_emails");
    }

    public async Task<string[]> GetEscalationEmailsAsync()
    {
        var cacheKey = "settings:escalation_emails";
        if (_cache.TryGetValue(cacheKey, out string[]? cachedEmails))
            return cachedEmails ?? Array.Empty<string>();

        var emailsSetting = await GetAsync(EscalationEmailsKey, "");
        if (string.IsNullOrWhiteSpace(emailsSetting))
        {
            _cache.Set(cacheKey, Array.Empty<string>(), TimeSpan.FromMinutes(CacheDurationMinutes));
            return Array.Empty<string>();
        }

        var emails = emailsSetting
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(e => e.Contains('@'))
            .ToArray();

        _cache.Set(cacheKey, emails, TimeSpan.FromMinutes(CacheDurationMinutes));
        return emails;
    }
}
