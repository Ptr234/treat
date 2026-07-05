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
    private readonly TotpService _totp;
    private readonly IWebHostEnvironment _env;

    public AuthController(OscDbContext db, JwtService jwt, PasswordService password, EmailService email, TotpService totp, IWebHostEnvironment env)
    {
        _db = db;
        _jwt = jwt;
        _password = password;
        _email = email;
        _totp = totp;
        _env = env;
    }

    /// <summary>Append a best-effort audit entry (never throws into the request).</summary>
    private async Task AuditAsync(string email, string role, string action, string? details, int status)
    {
        try
        {
            _db.AuditLogs.Add(new AuditLog
            {
                ActorEmail = email,
                ActorRole = role,
                Action = action,
                Details = details,
                StatusCode = status,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            });
            await _db.SaveChangesAsync();
        }
        catch { /* audit is best-effort */ }
    }

    /// <summary>Login with email and password (admins and regular users).</summary>
    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new ApiResponse(false, "Email and password are required"));

        var email = request.Email.ToLowerInvariant();

        // Admins first.
        var admin = await _db.AdminUsers.FirstOrDefaultAsync(a => a.Email == email && a.IsActive);
        if (admin is not null)
        {
            if (admin.PasswordHash is null || !_password.VerifyPassword(request.Password, admin.PasswordHash))
            {
                await AuditAsync(email, admin.Role, "auth.login.failed", "Invalid password", 401);
                return Unauthorized(new ApiResponse(false, "Invalid credentials"));
            }

            // Multi-factor: password is correct, but if the admin enrolled in TOTP
            // a valid code is required before a session is issued.
            if (admin.MfaEnabled)
            {
                if (string.IsNullOrWhiteSpace(request.MfaCode))
                {
                    await AuditAsync(admin.Email, admin.Role, "auth.login.mfa_required", "Password OK, awaiting TOTP", 200);
                    return Ok(new ApiResponse<MfaChallengeResponse>(true, new MfaChallengeResponse()));
                }

                if (!_totp.Verify(admin.MfaSecret, request.MfaCode))
                {
                    await AuditAsync(admin.Email, admin.Role, "auth.login.failed", "Invalid MFA code", 401);
                    return Unauthorized(new ApiResponse(false, "Invalid authentication code"));
                }
            }

            var adminToken = _jwt.CreateToken(admin.Id.ToString(), admin.Email, admin.Name, admin.Role, picture: null, agencyCode: admin.AgencyCode);
            Response.Cookies.Append("osc-session", adminToken, _jwt.GetCookieOptions(_env.IsProduction()));
            await AuditAsync(admin.Email, admin.Role, "auth.login", "Successful sign-in", 200);
            return Ok(new ApiResponse<AuthResponse>(true, new AuthResponse(
                admin.Id.ToString(), admin.Email, admin.Name, admin.Role, Picture: null, AgencyCode: admin.AgencyCode)));
        }

        // Regular users.
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email && u.IsActive);
        if (user is null || user.PasswordHash is null || !_password.VerifyPassword(request.Password, user.PasswordHash))
        {
            await AuditAsync(email, "user", "auth.login.failed", "Invalid credentials", 401);
            return Unauthorized(new ApiResponse(false, "Invalid credentials"));
        }

        var token = _jwt.CreateToken(user.Id.ToString(), user.Email, user.Name, user.Role, user.Picture);
        Response.Cookies.Append("osc-session", token, _jwt.GetCookieOptions(_env.IsProduction()));
        await AuditAsync(user.Email, user.Role, "auth.login", "Successful sign-in", 200);
        return Ok(new ApiResponse<AuthResponse>(true, new AuthResponse(
            user.Id.ToString(), user.Email, user.Name, user.Role, user.Picture)));
    }

    /// <summary>Register a new regular-user account (email + password).</summary>
    [HttpPost("signup")]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> Signup([FromBody] SignupRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new ApiResponse(false, "Name, email and password are required"));

        var email = request.Email.ToLowerInvariant().Trim();

        // Validate email format - simple regex to allow only standard email characters
        if (!System.Text.RegularExpressions.Regex.IsMatch(email, @"^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"))
            return BadRequest(new ApiResponse(false, "Invalid email format"));

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
    [EnableRateLimiting("login")]
    public async Task<IActionResult> GoogleAuth([FromBody] GoogleAuthRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.IdToken))
            return BadRequest(new ApiResponse(false, "Google credential is required"));

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
        // Delete with the same attributes (Path/Domain/Secure) the cookie was set
        // with — a mismatched Domain would leave the session cookie alive.
        Response.Cookies.Delete("osc-session", _jwt.GetCookieOptions(_env.IsProduction()));
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
            claims.FirstOrDefault(c => c.Type == "picture")?.Value,
            claims.FirstOrDefault(c => c.Type == "agency_code")?.Value
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

        // Resolve the underlying account. All back-office roles (admin, dg,
        // agency_officer) live in admin_users; everyone else is a regular user.
        var isBackOffice = Roles.BackOfficeRoles.Contains(role);
        var admin = isBackOffice ? await _db.AdminUsers.FindAsync(userId) : null;
        var user = isBackOffice ? null : await _db.Users.FindAsync(userId);
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
        string? agencyCode = null;
        if (admin is not null)
        {
            admin.Name = newName;
            admin.PasswordHash = newHash;
            admin.UpdatedAt = DateTimeOffset.UtcNow;
            (id, email, name, finalRole, agencyCode) = (admin.Id.ToString(), admin.Email, admin.Name, admin.Role, admin.AgencyCode);
        }
        else
        {
            user!.Name = newName;
            user.PasswordHash = newHash;
            user.UpdatedAt = DateTimeOffset.UtcNow;
            (id, email, name, finalRole, picture) = (user.Id.ToString(), user.Email, user.Name, user.Role, user.Picture);
        }

        await _db.SaveChangesAsync();

        var newToken = _jwt.CreateToken(id, email, name, finalRole, picture, agencyCode);
        Response.Cookies.Append("osc-session", newToken, _jwt.GetCookieOptions(_env.IsProduction()));

        return Ok(new ApiResponse<AuthResponse>(true, new AuthResponse(id, email, name, finalRole, picture, agencyCode)));
    }

    /// <summary>Resolve the signed-in back-office account from the session cookie, or null.</summary>
    private async Task<AdminUser?> ResolveAdminAsync()
    {
        var token = Request.Cookies["osc-session"];
        if (string.IsNullOrEmpty(token)) return null;

        var principal = _jwt.ValidateToken(token);
        if (principal is null) return null;

        // Any back-office role (admin, dg, agency_officer) has an admin_users record
        // and may manage its own MFA — not just the literal "admin" role.
        var role = principal.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;
        if (!Roles.BackOfficeRoles.Contains(role)) return null;

        var idStr = principal.Claims.First(c => c.Type == "sub" || c.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value;
        return Guid.TryParse(idStr, out var id) ? await _db.AdminUsers.FindAsync(id) : null;
    }

    /// <summary>Whether the signed-in admin currently has TOTP enabled.</summary>
    [HttpGet("mfa/status")]
    public async Task<IActionResult> MfaStatus()
    {
        var admin = await ResolveAdminAsync();
        if (admin is null) return Unauthorized(new ApiResponse(false, "Admin session required"));
        return Ok(new ApiResponse<MfaStatusResponse>(true, new MfaStatusResponse(admin.MfaEnabled)));
    }

    /// <summary>
    /// Begin TOTP enrolment: generate a fresh secret (stored but not yet active) and
    /// return it with an otpauth URI for the authenticator app / QR code. Requires the
    /// admin to confirm with <c>mfa/verify</c> before MFA takes effect.
    /// </summary>
    [HttpPost("mfa/enroll")]
    public async Task<IActionResult> MfaEnroll()
    {
        var admin = await ResolveAdminAsync();
        if (admin is null) return Unauthorized(new ApiResponse(false, "Admin session required"));
        if (admin.MfaEnabled)
            return BadRequest(new ApiResponse(false, "MFA is already enabled. Disable it first to re-enrol."));

        var secret = _totp.GenerateSecret();
        admin.MfaSecret = secret;
        admin.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync();

        var uri = _totp.BuildOtpauthUri(admin.Email, secret);
        return Ok(new ApiResponse<MfaEnrollResponse>(true, new MfaEnrollResponse(secret, uri)));
    }

    /// <summary>Confirm enrolment by verifying a code against the pending secret, activating MFA.</summary>
    [HttpPost("mfa/verify")]
    public async Task<IActionResult> MfaVerify([FromBody] MfaVerifyRequest request)
    {
        var admin = await ResolveAdminAsync();
        if (admin is null) return Unauthorized(new ApiResponse(false, "Admin session required"));
        if (string.IsNullOrWhiteSpace(admin.MfaSecret))
            return BadRequest(new ApiResponse(false, "Start enrolment first"));

        if (!_totp.Verify(admin.MfaSecret, request.Code))
            return BadRequest(new ApiResponse(false, "Invalid authentication code"));

        admin.MfaEnabled = true;
        admin.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync();
        await AuditAsync(admin.Email, admin.Role, "auth.mfa.enabled", "TOTP enabled", 200);

        return Ok(new ApiResponse<MfaStatusResponse>(true, new MfaStatusResponse(true)));
    }

    /// <summary>Disable MFA. Requires the current password and a valid TOTP code.</summary>
    [HttpPost("mfa/disable")]
    public async Task<IActionResult> MfaDisable([FromBody] MfaDisableRequest request)
    {
        var admin = await ResolveAdminAsync();
        if (admin is null) return Unauthorized(new ApiResponse(false, "Admin session required"));
        if (!admin.MfaEnabled)
            return BadRequest(new ApiResponse(false, "MFA is not enabled"));

        if (admin.PasswordHash is null || !_password.VerifyPassword(request.Password, admin.PasswordHash))
            return BadRequest(new ApiResponse(false, "Current password is incorrect"));

        if (!_totp.Verify(admin.MfaSecret, request.Code))
            return BadRequest(new ApiResponse(false, "Invalid authentication code"));

        admin.MfaEnabled = false;
        admin.MfaSecret = null;
        admin.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync();
        await AuditAsync(admin.Email, admin.Role, "auth.mfa.disabled", "TOTP disabled", 200);

        return Ok(new ApiResponse<MfaStatusResponse>(true, new MfaStatusResponse(false)));
    }

    /// <summary>Request a password reset link via email.</summary>
    [HttpPost("password-reset")]
    [EnableRateLimiting("password-reset")]
    public async Task<IActionResult> RequestPasswordReset([FromBody] PasswordResetRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new ApiResponse(false, "Email is required"));

        // Always return success to prevent email enumeration
        var resetEmail = request.Email.ToLowerInvariant().Trim();
        var admin = await _db.AdminUsers
            .FirstOrDefaultAsync(a => a.Email == resetEmail && a.IsActive);

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
        // Same complexity rule as signup/profile-change, so a reset can't
        // downgrade an account to a weaker password.
        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 8
            || !request.NewPassword.Any(char.IsUpper) || !request.NewPassword.Any(char.IsDigit))
            return BadRequest(new ApiResponse(false, "Password must be at least 8 characters and include an uppercase letter and a digit"));

        if (string.IsNullOrWhiteSpace(request.Token))
            return BadRequest(new ApiResponse(false, "Invalid or expired reset token"));

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
