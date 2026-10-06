using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.Auth;
using OscApi.Dtos.Common;
using OscApi.Models;

namespace OscApi.Controllers;

[ApiController]
[Route("api/v1/admin/users")]
[Authorize(Policy = "AdminOnly")]
public class AdminUsersController : ControllerBase
{
    private readonly OscDbContext _db;
    private readonly IPasswordService _password;

    public AdminUsersController(OscDbContext db, IPasswordService password)
    {
        _db = db;
        _password = password;
    }

    /// <summary>List all admin users.</summary>
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var users = await _db.AdminUsers
            .OrderBy(u => u.Name)
            .Select(u => new AdminListItem(
                u.Id.ToString(), u.Name, u.Email, u.Role, u.IsActive, u.CreatedAt, u.AgencyCode))
            .ToListAsync();

        return Ok(new ApiResponse<object>(true, users));
    }

    /// <summary>Create a new admin/officer user.</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAdminRequest request)
    {
        var email = request.Email.ToLowerInvariant().Trim();

        if (await _db.AdminUsers.AnyAsync(u => u.Email == email))
            return Problem(detail: "A user with this email already exists", statusCode: StatusCodes.Status409Conflict);

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
            return Problem(detail: "Password must be at least 8 characters", statusCode: StatusCodes.Status400BadRequest);

        if (!request.Password.Any(char.IsUpper) || !request.Password.Any(char.IsDigit))
            return Problem(detail: "Password must contain at least one uppercase letter and one digit", statusCode: StatusCodes.Status400BadRequest);

        // Resolve/validate the requested role and its agency scope.
        var role = NormalizeRole(request.Role);
        if (role is null)
            return Problem(detail: "Role must be one of: dg, admin, agency_officer", statusCode: StatusCodes.Status400BadRequest);

        var agencyCode = role == Roles.AgencyOfficer ? request.AgencyCode?.Trim().ToUpperInvariant() : null;
        if (role == Roles.AgencyOfficer && string.IsNullOrWhiteSpace(agencyCode))
            return Problem(detail: "An agency code is required for agency officer accounts", statusCode: StatusCodes.Status400BadRequest);

        var user = new AdminUser
        {
            Name = SanitizeHelper.StripHtml(request.Name),
            Email = email,
            PasswordHash = _password.HashPassword(request.Password),
            Role = role,
            AgencyCode = agencyCode,
            IsActive = true,
        };

        _db.AdminUsers.Add(user);
        await _db.SaveChangesAsync();

        return Created($"/api/v1/admin/users/{user.Id}", new ApiResponse<AdminListItem>(true,
            new AdminListItem(user.Id.ToString(), user.Name, user.Email, user.Role, user.IsActive, user.CreatedAt, user.AgencyCode)));
    }

    /// <summary>Update an admin user (name, role, active status).</summary>
    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAdminRequest request)
    {
        var user = await _db.AdminUsers.FindAsync(id);
        if (user is null) return Problem(detail: "User not found", statusCode: StatusCodes.Status404NotFound);

        // Prevent deactivating yourself
        var currentUserId = User.FindFirst("sub")?.Value
            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (request.IsActive == false && user.Id.ToString() == currentUserId)
            return Problem(detail: "You cannot deactivate your own account", statusCode: StatusCodes.Status400BadRequest);

        if (!string.IsNullOrWhiteSpace(request.Name))
            user.Name = SanitizeHelper.StripHtml(request.Name);

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            var role = NormalizeRole(request.Role);
            if (role is null)
                return Problem(detail: "Role must be one of: dg, admin, agency_officer", statusCode: StatusCodes.Status400BadRequest);
            user.Role = role;
        }

        // Keep the agency scope consistent with the (possibly updated) role.
        if (user.Role == Roles.AgencyOfficer)
        {
            if (request.AgencyCode is not null)
                user.AgencyCode = request.AgencyCode.Trim().ToUpperInvariant();
            if (string.IsNullOrWhiteSpace(user.AgencyCode))
                return Problem(detail: "An agency code is required for agency officer accounts", statusCode: StatusCodes.Status400BadRequest);
        }
        else
        {
            // Admin-level roles are never agency-scoped.
            user.AgencyCode = null;
        }

        if (request.IsActive.HasValue)
            user.IsActive = request.IsActive.Value;

        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<AdminListItem>(true,
            new AdminListItem(user.Id.ToString(), user.Name, user.Email, user.Role, user.IsActive, user.CreatedAt, user.AgencyCode)));
    }

    /// <summary>Delete an admin user (cannot delete yourself).</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var currentUserId = User.FindFirst("sub")?.Value
            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (id.ToString() == currentUserId)
            return Problem(detail: "You cannot delete your own account", statusCode: StatusCodes.Status400BadRequest);

        var user = await _db.AdminUsers.FindAsync(id);
        if (user is null) return Problem(detail: "User not found", statusCode: StatusCodes.Status404NotFound);

        _db.AdminUsers.Remove(user);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse(true));
    }

    /// <summary>
    /// Map a requested role string to a canonical back-office role, tolerating the
    /// legacy "officer" alias, or null if it isn't an allowed back-office role.
    /// </summary>
    private static string? NormalizeRole(string? role)
    {
        var r = role?.Trim().ToLowerInvariant();
        if (r == "officer") return Roles.AgencyOfficer; // legacy alias
        return Roles.BackOfficeRoles.Contains(r) ? r : null;
    }
}
