using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OscApi.Data;
using OscApi.Dtos.Common;
using OscApi.Dtos.Settings;
using OscApi.Services;

namespace OscApi.Controllers;

[ApiController]
[Route("api/v1/settings")]
[Authorize(Policy = "AdminOnly")]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settings;
    private readonly OscDbContext _db;

    public SettingsController(ISettingsService settings, OscDbContext db)
    {
        _settings = settings;
        _db = db;
    }

    /// <summary>Get all system settings.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var all = await _settings.GetAllAsync();
        return Ok(new ApiResponse<object>(true, all));
    }

    /// <summary>Get escalation settings specifically.</summary>
    [HttpGet("escalation")]
    public async Task<IActionResult> GetEscalation()
    {
        var emails = await _settings.GetAsync(SettingsService.EscalationEmailsKey);
        var assignee = await _settings.GetAsync(SettingsService.EscalationDefaultAssigneeKey);
        var message = await _settings.GetAsync(SettingsService.EscalationMessageKey,
            "A ticket has been escalated and requires immediate attention.");

        return Ok(new ApiResponse<EscalationSettingsResponse>(true,
            new EscalationSettingsResponse(emails, assignee, message)));
    }

    /// <summary>Update a single setting by key.</summary>
    [HttpPut("{key}")]
    public async Task<IActionResult> UpdateSetting(string key, [FromBody] UpdateSettingRequest request)
    {
        var adminName = User.FindFirst("name")?.Value ?? "Admin";
        await _settings.SetAsync(key, request.Value, request.Description, adminName);

        return Ok(new ApiResponse(true));
    }

    /// <summary>Batch-update escalation settings.</summary>
    [HttpPut("escalation")]
    public async Task<IActionResult> UpdateEscalation([FromBody] EscalationSettingsResponse request)
    {
        var adminName = User.FindFirst("name")?.Value ?? "Admin";

        // Validate emails
        if (!string.IsNullOrWhiteSpace(request.EscalationEmails))
        {
            var emails = request.EscalationEmails.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            foreach (var email in emails)
            {
                if (!email.Contains('@'))
                    return Problem(detail: $"Invalid email address: {email}", statusCode: StatusCodes.Status400BadRequest);
            }
        }

        // Escalations assign this person automatically, so it must be a real,
        // active staff account — not a free-text name nobody is notified as.
        var defaultAssignee = request.DefaultAssignee?.Trim().ToLowerInvariant() ?? "";
        if (defaultAssignee.Length > 0
            && !await _db.AdminUsers.AnyAsync(u => u.Email == defaultAssignee && u.IsActive))
            return Problem(detail: "The default escalation officer must be the email of an active staff account",
                statusCode: StatusCodes.Status400BadRequest);

        await _settings.SetAsync(SettingsService.EscalationEmailsKey,
            request.EscalationEmails, "Comma-separated escalation notification emails", adminName);

        await _settings.SetAsync(SettingsService.EscalationDefaultAssigneeKey,
            defaultAssignee, "Default officer (staff email) assigned to escalated tickets", adminName);

        await _settings.SetAsync(SettingsService.EscalationMessageKey,
            request.EscalationMessage, "Custom message included in escalation notifications", adminName);

        return Ok(new ApiResponse(true));
    }
}
