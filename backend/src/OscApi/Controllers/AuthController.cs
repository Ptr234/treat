using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.Auth;
using OscApi.Dtos.Common;

namespace OscApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly OscDbContext _db;
    private readonly JwtService _jwt;
    private readonly PasswordService _password;
    private readonly EmailService _email;
    private readonly IWebHostEnvironment _env;

    public AuthController(OscDbContext db, JwtService jwt, PasswordService password, EmailService email, IWebHostEnvironment env)
    {
        _db = db;
        _jwt = jwt;
        _password = password;
        _email = email;
        _env = env;
    }

    /// <summary>Login with email and password.</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var admin = await _db.AdminUsers
            .FirstOrDefaultAsync(a => a.Email == request.Email.ToLowerInvariant() && a.IsActive);

        if (admin is null || admin.PasswordHash is null)
            return Unauthorized(new ApiResponse(false, "Invalid credentials"));

        if (!_password.VerifyPassword(request.Password, admin.PasswordHash))
            return Unauthorized(new ApiResponse(false, "Invalid credentials"));

        var token = _jwt.CreateToken(admin.Id.ToString(), admin.Email, admin.Name, admin.Role);
        Response.Cookies.Append("osc-session", token, _jwt.GetCookieOptions(_env.IsProduction()));

        return Ok(new ApiResponse<AuthResponse>(true, new AuthResponse(
            admin.Id.ToString(), admin.Email, admin.Name, admin.Role)));
    }

    /// <summary>Authenticate via Google OAuth.</summary>
    [HttpPost("google")]
    public async Task<IActionResult> GoogleAuth([FromBody] GoogleAuthRequest request)
    {
        var clientId = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID");
        if (string.IsNullOrEmpty(clientId))
            return StatusCode(500, new ApiResponse(false, "Google OAuth not configured"));

        Google.Apis.Auth.GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await Google.Apis.Auth.GoogleJsonWebSignature.ValidateAsync(request.IdToken,
                new Google.Apis.Auth.GoogleJsonWebSignature.ValidationSettings { Audience = [clientId] });
        }
        catch
        {
            return Unauthorized(new ApiResponse(false, "Invalid Google token"));
        }

        var email = payload.Email.ToLowerInvariant();
        var admin = await _db.AdminUsers.FirstOrDefaultAsync(a => a.Email == email && a.IsActive);

        var role = admin is not null ? admin.Role : "user";
        var name = admin?.Name ?? payload.Name ?? email;
        var id = admin?.Id.ToString() ?? payload.Subject;

        var token = _jwt.CreateToken(id, email, name, role, payload.Picture);
        Response.Cookies.Append("osc-session", token, _jwt.GetCookieOptions(_env.IsProduction()));

        return Ok(new ApiResponse<AuthResponse>(true, new AuthResponse(id, email, name, role, payload.Picture)));
    }

    /// <summary>Logout (clear session cookie).</summary>
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("osc-session", new CookieOptions { Path = "/" });
        return Ok(new ApiResponse(true));
    }

    /// <summary>Get current authenticated user.</summary>
    [HttpGet("me")]
    public IActionResult Me()
    {
        var token = Request.Cookies["osc-session"];
        if (string.IsNullOrEmpty(token))
            return Unauthorized(new ApiResponse(false, "Not authenticated"));

        var principal = _jwt.ValidateToken(token);
        if (principal is null)
            return Unauthorized(new ApiResponse(false, "Invalid token"));

        var claims = principal.Claims.ToList();
        return Ok(new ApiResponse<AuthResponse>(true, new AuthResponse(
            claims.First(c => c.Type == "sub" || c.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value,
            claims.First(c => c.Type == "email" || c.Type == System.Security.Claims.ClaimTypes.Email).Value,
            claims.FirstOrDefault(c => c.Type == "name")?.Value ?? "",
            claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value ?? "user",
            claims.FirstOrDefault(c => c.Type == "picture")?.Value
        )));
    }

    /// <summary>Update profile (admin only).</summary>
    [HttpPatch("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] ProfileUpdateRequest request)
    {
        var token = Request.Cookies["osc-session"];
        if (string.IsNullOrEmpty(token))
            return Unauthorized(new ApiResponse(false, "Not authenticated"));

        var principal = _jwt.ValidateToken(token);
        if (principal is null)
            return Unauthorized(new ApiResponse(false, "Invalid token"));

        var role = principal.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;
        if (role != "admin")
            return StatusCode(403, new ApiResponse(false, "Admin access required"));

        var userId = principal.Claims.First(c => c.Type == "sub" || c.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value;
        var admin = await _db.AdminUsers.FindAsync(Guid.Parse(userId));
        if (admin is null)
            return NotFound(new ApiResponse(false, "Admin not found"));

        if (!string.IsNullOrWhiteSpace(request.Name))
            admin.Name = request.Name;

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            // Require current password verification
            if (string.IsNullOrWhiteSpace(request.CurrentPassword))
                return BadRequest(new ApiResponse(false, "Current password is required to set a new password"));

            if (admin.PasswordHash is null || !_password.VerifyPassword(request.CurrentPassword, admin.PasswordHash))
                return BadRequest(new ApiResponse(false, "Current password is incorrect"));

            // Enforce password policy
            if (request.NewPassword.Length < 8)
                return BadRequest(new ApiResponse(false, "New password must be at least 8 characters"));

            if (!request.NewPassword.Any(char.IsUpper) || !request.NewPassword.Any(char.IsDigit))
                return BadRequest(new ApiResponse(false, "New password must contain at least one uppercase letter and one digit"));

            if (request.NewPassword == request.CurrentPassword)
                return BadRequest(new ApiResponse(false, "New password must be different from current password"));

            admin.PasswordHash = _password.HashPassword(request.NewPassword);
        }

        admin.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync();

        var newToken = _jwt.CreateToken(admin.Id.ToString(), admin.Email, admin.Name, admin.Role);
        Response.Cookies.Append("osc-session", newToken, _jwt.GetCookieOptions(_env.IsProduction()));

        return Ok(new ApiResponse<AuthResponse>(true, new AuthResponse(
            admin.Id.ToString(), admin.Email, admin.Name, admin.Role)));
    }

    /// <summary>Request a password reset link via email.</summary>
    [HttpPost("password-reset")]
    [EnableRateLimiting("password-reset")]
    public async Task<IActionResult> RequestPasswordReset([FromBody] PasswordResetRequest request)
    {
        // Always return success to prevent email enumeration
        var admin = await _db.AdminUsers
            .FirstOrDefaultAsync(a => a.Email == request.Email.ToLowerInvariant() && a.IsActive);

        if (admin is not null)
        {
            var resetToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
            admin.PasswordResetToken = resetToken;
            admin.PasswordResetExpiresAt = DateTimeOffset.UtcNow.AddHours(1);
            admin.UpdatedAt = DateTimeOffset.UtcNow;
            await _db.SaveChangesAsync();

            _ = _email.SendPasswordResetAsync(admin.Email, admin.Name, resetToken);
        }

        return Ok(new ApiResponse(true, "If the email exists, a reset link has been sent"));
    }

    /// <summary>Verify a password reset token and set a new password.</summary>
    [HttpPost("password-reset/verify")]
    [EnableRateLimiting("password-reset")]
    public async Task<IActionResult> VerifyPasswordReset([FromBody] PasswordResetVerifyRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 8)
            return BadRequest(new ApiResponse(false, "Password must be at least 8 characters"));

        var admin = await _db.AdminUsers
            .FirstOrDefaultAsync(a => a.PasswordResetToken == request.Token && a.IsActive);

        if (admin is null || admin.PasswordResetExpiresAt is null || admin.PasswordResetExpiresAt < DateTimeOffset.UtcNow)
            return BadRequest(new ApiResponse(false, "Invalid or expired reset token"));

        admin.PasswordHash = _password.HashPassword(request.NewPassword);
        admin.PasswordResetToken = null;
        admin.PasswordResetExpiresAt = null;
        admin.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse(true, "Password has been reset successfully"));
    }
}
