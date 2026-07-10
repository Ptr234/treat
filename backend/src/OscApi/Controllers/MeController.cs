using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.Common;
using OscApi.Models;

namespace OscApi.Controllers;

/// <summary>
/// Self-service endpoints for the signed-in user (any authenticated account).
/// Submissions are matched by the user's login email; drafts are owned by it.
/// </summary>
[ApiController]
[Route("api/me")]
[Authorize]
public class MeController : ControllerBase
{
    private readonly OscDbContext _db;

    public MeController(OscDbContext db) => _db = db;

    private string? Email => User.FindFirstValue(ClaimTypes.Email)?.ToLowerInvariant();

    /// <summary>All submissions belonging to the signed-in user, matched by email.</summary>
    [HttpGet("submissions")]
    public async Task<IActionResult> GetSubmissions()
    {
        var email = Email;
        if (string.IsNullOrEmpty(email)) return Unauthorized(new ApiResponse(false, "Not authenticated"));

        var tickets = await _db.Tickets.AsNoTracking()
            .Where(t => t.ContactEmail == email)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new
            {
                t.ReferenceNumber,
                t.Title,
                category = t.Category.ToString(),
                priority = t.Priority.ToString(),
                status = t.Status.ToString(),
                t.SlaDeadlineAt,
                t.IsEscalated,
                t.CreatedAt,
            })
            .ToListAsync();

        var inquiries = await _db.ContactInquiries.AsNoTracking()
            .Where(i => i.ContactEmail == email)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new
            {
                i.ReferenceNumber,
                i.AgencyCode,
                i.AgencyName,
                i.ServiceType,
                i.Subject,
                status = i.Status.ToString(),
                i.CreatedAt,
            })
            .ToListAsync();

        var appointments = await _db.Appointments.AsNoTracking()
            .Where(a => a.ContactEmail == email)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new
            {
                a.ReferenceNumber,
                a.AgencyCode,
                a.AgencyName,
                a.ServiceType,
                preferredDate = a.PreferredDate,
                a.PreferredTime,
                meetingType = a.MeetingType.ToString(),
                status = a.Status.ToString(),
                a.CreatedAt,
            })
            .ToListAsync();

        var investor = await _db.InvestorProfiles.AsNoTracking()
            .Where(p => p.Email == email)
            .Select(p => new
            {
                p.ReferenceNumber,
                status = p.Status.ToString(),
                p.PrimarySector,
                p.InvestmentAmount,
                investorType = p.InvestorType.ToString(),
                p.CreatedAt,
            })
            .FirstOrDefaultAsync();

        return Ok(new ApiResponse<object>(true, new { tickets, inquiries, appointments, investor }));
    }

    /// <summary>Get the signed-in user's saved draft for a form, if any.</summary>
    [HttpGet("drafts/{formType}")]
    public async Task<IActionResult> GetDraft(string formType)
    {
        var email = Email;
        if (string.IsNullOrEmpty(email)) return Unauthorized(new ApiResponse(false, "Not authenticated"));

        var draft = await _db.FormDrafts.AsNoTracking()
            .FirstOrDefaultAsync(d => d.UserEmail == email && d.FormType == formType);
        if (draft is null) return Ok(new ApiResponse<object>(true, null));

        JsonElement data;
        try { data = JsonSerializer.Deserialize<JsonElement>(draft.Data); }
        catch { return Ok(new ApiResponse<object>(true, null)); }

        return Ok(new ApiResponse<object>(true, new { formType = draft.FormType, data, updatedAt = draft.UpdatedAt }));
    }

    /// <summary>Create or update the signed-in user's draft for a form.</summary>
    [HttpPut("drafts/{formType}")]
    public async Task<IActionResult> SaveDraft(string formType, [FromBody] JsonElement data)
    {
        var email = Email;
        if (string.IsNullOrEmpty(email)) return Unauthorized(new ApiResponse(false, "Not authenticated"));

        if (string.IsNullOrWhiteSpace(formType) || formType.Length > 50)
            return BadRequest(new ApiResponse(false, "Invalid form type"));

        var raw = data.ValueKind == JsonValueKind.Undefined ? "{}" : data.GetRawText();
        if (raw.Length > 100_000)
            return BadRequest(new ApiResponse(false, "Draft is too large"));

        var draft = await _db.FormDrafts.FirstOrDefaultAsync(d => d.UserEmail == email && d.FormType == formType);
        if (draft is null)
        {
            draft = new FormDraft { UserEmail = email, FormType = formType, Data = raw };
            _db.FormDrafts.Add(draft);
        }
        else
        {
            draft.Data = raw;
            draft.UpdatedAt = DateTimeOffset.UtcNow;
        }

        await _db.SaveChangesAsync();
        return Ok(new ApiResponse(true, "Draft saved"));
    }

    /// <summary>Delete the signed-in user's draft for a form (e.g. after submission).</summary>
    [HttpDelete("drafts/{formType}")]
    public async Task<IActionResult> DeleteDraft(string formType)
    {
        var email = Email;
        if (string.IsNullOrEmpty(email)) return Unauthorized(new ApiResponse(false, "Not authenticated"));

        var draft = await _db.FormDrafts.FirstOrDefaultAsync(d => d.UserEmail == email && d.FormType == formType);
        if (draft is not null)
        {
            _db.FormDrafts.Remove(draft);
            await _db.SaveChangesAsync();
        }

        return Ok(new ApiResponse(true));
    }

    /// <summary>Get the signed-in user's profile.</summary>
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var email = Email;
        if (string.IsNullOrEmpty(email)) return Unauthorized(new ApiResponse(false, "Not authenticated"));

        var isBackOffice = Roles.BackOfficeRoles.Contains(User.GetRole());
        var name = isBackOffice
            ? (await _db.AdminUsers.AsNoTracking().Where(a => a.Email == email).Select(a => a.Name).FirstOrDefaultAsync())
            : (await _db.Users.AsNoTracking().Where(u => u.Email == email).Select(u => u.Name).FirstOrDefaultAsync());

        return Ok(new ApiResponse<object>(true, new { email, name }));
    }

    /// <summary>
    /// Update the signed-in user's profile. Only the display name can be changed
    /// here — email is the account's login identity and is never mutable via this
    /// endpoint (changing it would let a caller redirect ownership of submissions).
    /// </summary>
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] JsonElement data)
    {
        var email = Email;
        if (string.IsNullOrEmpty(email)) return Unauthorized(new ApiResponse(false, "Not authenticated"));

        if (data.ValueKind != JsonValueKind.Object || !data.TryGetProperty("name", out var nameProp)
            || nameProp.ValueKind != JsonValueKind.String)
            return Ok(new ApiResponse<object>(true, new { email }));

        var name = nameProp.GetString()!.Trim();
        if (name.Length < 2 || name.Length > 100)
            return BadRequest(new ApiResponse(false, "Name must be 2-100 characters"));

        var isBackOffice = Roles.BackOfficeRoles.Contains(User.GetRole());
        if (isBackOffice)
        {
            var admin = await _db.AdminUsers.FirstOrDefaultAsync(a => a.Email == email);
            if (admin is null) return NotFound(new ApiResponse(false, "Account not found"));
            admin.Name = name;
            admin.UpdatedAt = DateTimeOffset.UtcNow;
        }
        else
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user is null) return NotFound(new ApiResponse(false, "Account not found"));
            user.Name = name;
        }

        await _db.SaveChangesAsync();
        return Ok(new ApiResponse<object>(true, new { email, name }));
    }

    /// <summary>Delete the signed-in user's account.</summary>
    [HttpPost("delete-account")]
    public async Task<IActionResult> DeleteAccount()
    {
        var email = Email;
        if (string.IsNullOrEmpty(email)) return Unauthorized(new ApiResponse(false, "Not authenticated"));

        // Delete investor profile
        var investor = await _db.InvestorProfiles.FirstOrDefaultAsync(p => p.Email == email);
        if (investor is not null)
        {
            _db.InvestorProfiles.Remove(investor);
        }

        // Delete form drafts
        var drafts = await _db.FormDrafts.Where(d => d.UserEmail == email).ToListAsync();
        _db.FormDrafts.RemoveRange(drafts);

        // Deactivate or delete user account
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is not null)
        {
            user.IsActive = false;
            _db.Users.Update(user);
        }

        await _db.SaveChangesAsync();
        return Ok(new ApiResponse(true, "Account deleted"));
    }
}
