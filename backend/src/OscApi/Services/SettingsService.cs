using Microsoft.EntityFrameworkCore;
using OscApi.Data;
using OscApi.Models;

namespace OscApi.Services;

public class SettingsService : ISettingsService
{
    private readonly OscDbContext _db;

    // Default settings keys
    public const string EscalationEmailsKey = "escalation.emails";
    public const string EscalationDefaultAssigneeKey = "escalation.default_assignee";
    public const string EscalationMessageKey = "escalation.notification_message";

    public SettingsService(OscDbContext db)
    {
        _db = db;
    }

    public async Task<string> GetAsync(string key, string defaultValue = "")
    {
        var setting = await _db.SystemSettings.FindAsync(key);
        return setting?.Value ?? defaultValue;
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
    }

    public async Task<string[]> GetEscalationEmailsAsync()
    {
        var emailsSetting = await GetAsync(EscalationEmailsKey, "");
        if (string.IsNullOrWhiteSpace(emailsSetting))
            return Array.Empty<string>();

        return emailsSetting
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(e => e.Contains('@'))
            .ToArray();
    }
}
