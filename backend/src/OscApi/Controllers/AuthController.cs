using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.Auth;
using OscApi.Dtos.Common;
using OscApi.Models;

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

    /// <summary>Login with email and password (admins and regular users).</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var email = request.Email.ToLowerInvariant();

        // Admins first.
        var admin = await _db.AdminUsers.FirstOrDefaultAsync(a => a.Email == email && a.IsActive);
        if (admin is not null)
        {
            if (admin.PasswordHash is null || !_password.VerifyPassword(request.Password, admin.PasswordHash))
                return Unauthorized(new ApiResponse(false, "Invalid credentials"));

            var adminToken = _jwt.CreateToken(admin.Id.ToString(), admin.Email, admin.Name, admin.Role);
            Response.Cookies.Append("osc-session", adminToken, _jwt.GetCookieOptions(_env.IsProduction()));
            return Ok(new ApiResponse<AuthResponse>(true, new AuthResponse(
                admin.Id.ToString(), admin.Email, admin.Name, admin.Role)));
        }

        // Regular users.
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email && u.IsActive);
        if (user is null || user.PasswordHash is null || !_password.VerifyPassword(request.Password, user.PasswordHash))
            return Unauthorized(new ApiResponse(false, "Invalid credentials"));

        var token = _jwt.CreateToken(user.Id.ToString(), user.Email, user.Name, user.Role, user.Picture);
        Response.Cookies.Append("osc-session", token, _jwt.GetCookieOptions(_env.IsProduction()));
        return Ok(new ApiResponse<AuthResponse>(true, new AuthResponse(
            user.Id.ToString(), user.Email, user.Name, user.Role, user.Picture)));
    }

    /// <summary>Register a new regular-user account (email + password).</summary>
    [HttpPost("signup")]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> Signup([FromBody] SignupRequest request)
    {
        var email = request.Email.ToLowerInvariant().Trim();

        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new ApiResponse(false, "Name, email and password are required"));

        if (request.Password.Length < 8 || !request.Password.Any(char.IsUpper) || !request.Password.Any(char.IsDigit))
            return BadRequest(new ApiResponse(false, "Password must be at least 8 characters and include an uppercase letter and a digit"));

        // Email must be unique across admins and users.
        if (await _db.AdminUsers.AnyAsync(a => a.Email == email) || await _db.Users.AnyAsync(u => u.Email == email))
            return Conflict(new ApiResponse(false, "An account with this email already exists"));

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = email,
            PasswordHash = _password.HashPassword(request.Password),
            Role = "user",
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = _jwt.CreateToken(user.Id.ToString(), user.Email, user.Name, user.Role);
        Response.Cookies.Append("osc-session", token, _jwt.GetCookieOptions(_env.IsProduction()));
        return Ok(new ApiResponse<AuthResponse>(true, new AuthResponse(
            user.Id.ToString(), user.Email, user.Name, user.Role)));
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

        string role, name, id;
        if (admin is not null)
        {
            role = admin.Role;
            name = admin.Name;
            id = admin.Id.ToString();
        }
        else
        {
            // Upsert a persistent regular-user record so the account is stable
            // across logins/devices (drafts and submissions can be tied to it).
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user is null)
            {
                user = new User
                {
                    Email = email,
                    Name = payload.Name ?? email,
                    Role = "user",
                    GoogleSubject = payload.Subject,
                    Picture = payload.Picture,
                };
                _db.Users.Add(user);
            }
            else
            {
                user.GoogleSubject = payload.Subject;
                if (!string.IsNullOrEmpty(payload.Picture)) user.Picture = payload.Picture;
                if (string.IsNullOrWhiteSpace(user.Name) && payload.Name is not null) user.Name = payload.Name;
            }
            await _db.SaveChangesAsync();

            role = user.Role;
            name = user.Name;
            id = user.Id.ToString();
        }

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

    /// <summary>Update the signed-in account's profile (admins and regular users).</summary>
    [HttpPatch("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] ProfileUpdateRequest request)
    {
        var token = Request.Cookies["osc-session"];
        if (string.IsNullOrEmpty(token))
            return Unauthorized(new ApiResponse(false, "Not authenticated"));

        var principal = _jwt.ValidateToken(token);
        if (principal is null)
            return Unauthorized(new ApiResponse(false, "Invalid token"));

        var role = principal.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value ?? "user";
        var userIdStr = principal.Claims.First(c => c.Type == "sub" || c.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value;
        if (!Guid.TryParse(userIdStr, out var userId))
            return BadRequest(new ApiResponse(false, "Profile is not available for this account"));

        // Resolve the underlying account (admin or regular user).
        var admin = role == "admin" ? await _db.AdminUsers.FindAsync(userId) : null;
        var user = role != "admin" ? await _db.Users.FindAsync(userId) : null;
        if (admin is null && user is null)
            return NotFound(new ApiResponse(false, "Account not found"));

        var newName = admin?.Name ?? user!.Name;
        var currentHash = admin?.PasswordHash ?? user?.PasswordHash;
        var newHash = currentHash;

        if (!string.IsNullOrWhiteSpace(request.Name))
            newName = request.Name.Trim();

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            // If the account already has a password, require the current one.
            // (Google-only accounts may set their first password without it.)
            if (currentHash is not null)
            {
                if (string.IsNullOrWhiteSpace(request.CurrentPassword) || !_password.VerifyPassword(request.CurrentPassword, currentHash))
                    return BadRequest(new ApiResponse(false, "Current password is incorrect"));

                if (request.NewPassword == request.CurrentPassword)
                    return BadRequest(new ApiResponse(false, "New password must be different from current password"));
            }

            if (request.NewPassword.Length < 8 || !request.NewPassword.Any(char.IsUpper) || !request.NewPassword.Any(char.IsDigit))
                return BadRequest(new ApiResponse(false, "New password must be at least 8 characters and include an uppercase letter and a digit"));

            newHash = _password.HashPassword(request.NewPassword);
        }

        string id, email, name, finalRole;
        string? picture = null;
        if (admin is not null)
        {
            admin.Name = newName;
            admin.PasswordHash = newHash;
            admin.UpdatedAt = DateTimeOffset.UtcNow;
            (id, email, name, finalRole) = (admin.Id.ToString(), admin.Email, admin.Name, admin.Role);
        }
        else
        {
            user!.Name = newName;
            user.PasswordHash = newHash;
            user.UpdatedAt = DateTimeOffset.UtcNow;
            (id, email, name, finalRole, picture) = (user.Id.ToString(), user.Email, user.Name, user.Role, user.Picture);
        }

        await _db.SaveChangesAsync();

        var newToken = _jwt.CreateToken(id, email, name, finalRole, picture);
        Response.Cookies.Append("osc-session", newToken, _jwt.GetCookieOptions(_env.IsProduction()));

        return Ok(new ApiResponse<AuthResponse>(true, new AuthResponse(id, email, name, finalRole, picture)));
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
