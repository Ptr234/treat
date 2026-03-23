namespace OscApi.Dtos.Settings;

public record UpdateSettingRequest(string Value, string? Description);

public record SettingResponse(string Key, string Value, string? Description, DateTimeOffset UpdatedAt, string? UpdatedBy);

public record EscalationSettingsResponse(
    string EscalationEmails,
    string DefaultAssignee,
    string EscalationMessage
);
