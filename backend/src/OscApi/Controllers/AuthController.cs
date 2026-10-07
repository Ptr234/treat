using System.Security.Cryptography;
using System.Text;
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
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly OscDbContext _db;
    private readonly IJwtService _jwt;
    private readonly IPasswordService _password;
    private readonly IEmailService _email;
    private readonly ITotpService _totp;
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthController> _logger;

    public AuthController(OscDbContext db, IJwtService jwt, IPasswordService password, IEmailService email, ITotpService totp, IWebHostEnvironment env, IConfiguration config, ILogger<AuthController> logger)
    {
        _db = db;
        _jwt = jwt;
        _password = password;
        _email = email;
        _totp = totp;
        _env = env;
        _config = config;
        _logger = logger;
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

    /// <summary>Hash a password-reset token for storage/lookup — never persist the raw token.</summary>
    private static string HashResetToken(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    /// <summary>Login with email and password (admins and regular users).</summary>
    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return Problem(detail: "Email and password are required", statusCode: StatusCodes.Status400BadRequest);

        var email = request.Email.ToLowerInvariant();

        // Admins first.
        var admin = await _db.AdminUsers.FirstOrDefaultAsync(a => a.Email == email && a.IsActive);
        if (admin is not null)
        {
            if (admin.PasswordHash is null || !_password.VerifyPassword(request.Password, admin.PasswordHash))
            {
                await AuditAsync(email, admin.Role, "auth.login.failed", "Invalid password", 401);
                return Problem(detail: "Invalid credentials", statusCode: StatusCodes.Status401Unauthorized);
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
                    return Problem(detail: "Invalid authentication code", statusCode: StatusCodes.Status401Unauthorized);
                }
            }

            var adminToken = _jwt.CreateToken(admin.Id.ToString(), admin.Email, admin.Name, admin.Role, picture: null, agencyCode: admin.AgencyCode, mfaEnabled: admin.MfaEnabled);
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
            return Problem(detail: "Invalid credentials", statusCode: StatusCodes.Status401Unauthorized);
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
            return Problem(detail: "Name, email and password are required", statusCode: StatusCodes.Status400BadRequest);

        var email = request.Email.ToLowerInvariant().Trim();

        // Validate email format - simple regex to allow only standard email characters
        if (!System.Text.RegularExpressions.Regex.IsMatch(email, @"^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"))
            return Problem(detail: "Invalid email format", statusCode: StatusCodes.Status400BadRequest);

        if (request.Password.Length < 8 || !request.Password.Any(char.IsUpper) || !request.Password.Any(char.IsDigit))
            return Problem(detail: "Password must be at least 8 characters and include an uppercase letter and a digit", statusCode: StatusCodes.Status400BadRequest);

        // Email must be unique across admins and users.
        if (await _db.AdminUsers.AnyAsync(a => a.Email == email) || await _db.Users.AnyAsync(u => u.Email == email))
            return Problem(detail: "An account with this email already exists", statusCode: StatusCodes.Status409Conflict);

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
            return Problem(detail: "Google credential is required", statusCode: StatusCodes.Status400BadRequest);

        // Read through IConfiguration like every other setting, so "Google:ClientId"
        // in appsettings and the Google__ClientId environment convention both work.
        // The bare GOOGLE_CLIENT_ID variable is still honoured for deployments that
        // were configured before this was wired to configuration.
        var clientId = _config["Google:ClientId"]
            ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID");
        if (string.IsNullOrEmpty(clientId))
            return Problem(detail: "Google OAuth not configured", statusCode: 500);

        Google.Apis.Auth.GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await Google.Apis.Auth.GoogleJsonWebSignature.ValidateAsync(request.IdToken,
                new Google.Apis.Auth.GoogleJsonWebSignature.ValidationSettings { Audience = [clientId] });
        }
        catch (Exception ex)
        {
            // Swallowing this without logging previously meant a genuine failure on our
            // side (e.g. a transient failure fetching Google's signing keys) was
            // indistinguishable from a visitor presenting a bad/expired token — both
            // just returned "Invalid Google token" with nothing in the logs to tell
            // them apart.
            _logger.LogWarning(ex, "Google ID token validation failed");
            return Problem(detail: "Invalid Google token", statusCode: StatusCodes.Status401Unauthorized);
        }

        // Accounts here are matched to admin and user records *by email address*.
        // An unverified Google email is not proof of ownership, so accepting one
        // would let anyone who registers a Google account bearing a staff address
        // sign in as that member of staff.
        if (!payload.EmailVerified || string.IsNullOrWhiteSpace(payload.Email))
        {
            await AuditAsync(payload.Email ?? "(unknown)", "user", "auth.login.failed",
                "Google account e-mail is not verified", 401);
            return Problem(detail: "Your Google account e-mail address is not verified",
                statusCode: StatusCodes.Status401Unauthorized);
        }

        var email = payload.Email.ToLowerInvariant();
        var admin = await _db.AdminUsers.FirstOrDefaultAsync(a => a.Email == email && a.IsActive);

        string role, name, id;
        if (admin is not null)
        {
            // Google sign-in authenticates identity, not the second factor: an admin who
            // enrolled in TOTP must still supply a valid code, exactly as with password login.
            if (admin.MfaEnabled)
            {
                if (string.IsNullOrWhiteSpace(request.MfaCode))
                {
                    await AuditAsync(admin.Email, admin.Role, "auth.login.mfa_required", "Google token OK, awaiting TOTP", 200);
                    return Ok(new ApiResponse<MfaChallengeResponse>(true, new MfaChallengeResponse()));
                }

                if (!_totp.Verify(admin.MfaSecret, request.MfaCode))
                {
                    await AuditAsync(admin.Email, admin.Role, "auth.login.failed", "Invalid MFA code (Google)", 401);
                    return Problem(detail: "Invalid authentication code", statusCode: StatusCodes.Status401Unauthorized);
                }
            }

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

        var token = _jwt.CreateToken(id, email, name, role, payload.Picture, mfaEnabled: admin?.MfaEnabled ?? false);
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
            return Problem(detail: "Not authenticated", statusCode: StatusCodes.Status401Unauthorized);

        var principal = _jwt.ValidateToken(token);
        if (principal is null)
            return Problem(detail: "Invalid token", statusCode: StatusCodes.Status401Unauthorized);

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
            return Problem(detail: "Not authenticated", statusCode: StatusCodes.Status401Unauthorized);

        var principal = _jwt.ValidateToken(token);
        if (principal is null)
            return Problem(detail: "Invalid token", statusCode: StatusCodes.Status401Unauthorized);

        var role = principal.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value ?? "user";
        var userIdStr = principal.Claims.First(c => c.Type == "sub" || c.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value;
        if (!Guid.TryParse(userIdStr, out var userId))
            return Problem(detail: "Profile is not available for this account", statusCode: StatusCodes.Status400BadRequest);

        // Resolve the underlying account. All back-office roles (admin, dg,
        // agency_officer) live in admin_users; everyone else is a regular user.
        var isBackOffice = Roles.BackOfficeRoles.Contains(role);
        var admin = isBackOffice ? await _db.AdminUsers.FindAsync(userId) : null;
        var user = isBackOffice ? null : await _db.Users.FindAsync(userId);
        if (admin is null && user is null)
            return Problem(detail: "Account not found", statusCode: StatusCodes.Status404NotFound);

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
                    return Problem(detail: "Current password is incorrect", statusCode: StatusCodes.Status400BadRequest);

                if (request.NewPassword == request.CurrentPassword)
                    return Problem(detail: "New password must be different from current password", statusCode: StatusCodes.Status400BadRequest);
            }

            if (request.NewPassword.Length < 8 || !request.NewPassword.Any(char.IsUpper) || !request.NewPassword.Any(char.IsDigit))
                return Problem(detail: "New password must be at least 8 characters and include an uppercase letter and a digit", statusCode: StatusCodes.Status400BadRequest);

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

        var newToken = _jwt.CreateToken(id, email, name, finalRole, picture, agencyCode, mfaEnabled: admin?.MfaEnabled ?? false);
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
        if (admin is null) return Problem(detail: "Admin session required", statusCode: StatusCodes.Status401Unauthorized);
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
        if (admin is null) return Problem(detail: "Admin session required", statusCode: StatusCodes.Status401Unauthorized);
        if (admin.MfaEnabled)
            return Problem(detail: "MFA is already enabled. Disable it first to re-enrol.", statusCode: StatusCodes.Status400BadRequest);

        var secret = _totp.GenerateSecret();
        admin.MfaSecret = secret;
        admin.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync();

        var uri = _totp.BuildOtpauthUri(admin.Email, secret);
        return Ok(new ApiResponse<MfaEnrollResponse>(true, new MfaEnrollResponse(secret, uri)));
    }

    /// <summary>Confirm enrolment by verifying a code against the pending secret, activating MFA.</summary>
    [HttpPost("mfa/verify")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> MfaVerify([FromBody] MfaVerifyRequest request)
    {
        var admin = await ResolveAdminAsync();
        if (admin is null) return Problem(detail: "Admin session required", statusCode: StatusCodes.Status401Unauthorized);
        if (string.IsNullOrWhiteSpace(admin.MfaSecret))
            return Problem(detail: "Start enrolment first", statusCode: StatusCodes.Status400BadRequest);

        if (!_totp.Verify(admin.MfaSecret, request.Code))
            return Problem(detail: "Invalid authentication code", statusCode: StatusCodes.Status400BadRequest);

        admin.MfaEnabled = true;
        admin.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync();
        await AuditAsync(admin.Email, admin.Role, "auth.mfa.enabled", "TOTP enabled", 200);

        // Back-office roles require mfa_enabled=true in the token to use Staff/
        // AdminOnly endpoints (see MfaCompleteHandler) — reissue now so this same
        // browser session is unblocked immediately, without a fresh login.
        var refreshedToken = _jwt.CreateToken(admin.Id.ToString(), admin.Email, admin.Name, admin.Role,
            picture: null, agencyCode: admin.AgencyCode, mfaEnabled: true);
        Response.Cookies.Append("osc-session", refreshedToken, _jwt.GetCookieOptions(_env.IsProduction()));

        return Ok(new ApiResponse<MfaStatusResponse>(true, new MfaStatusResponse(true)));
    }

    /// <summary>Disable MFA. Requires the current password and a valid TOTP code.</summary>
    [HttpPost("mfa/disable")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> MfaDisable([FromBody] MfaDisableRequest request)
    {
        var admin = await ResolveAdminAsync();
        if (admin is null) return Problem(detail: "Admin session required", statusCode: StatusCodes.Status401Unauthorized);
        if (!admin.MfaEnabled)
            return Problem(detail: "MFA is not enabled", statusCode: StatusCodes.Status400BadRequest);

        if (admin.PasswordHash is null || !_password.VerifyPassword(request.Password, admin.PasswordHash))
            return Problem(detail: "Current password is incorrect", statusCode: StatusCodes.Status400BadRequest);

        if (!_totp.Verify(admin.MfaSecret, request.Code))
            return Problem(detail: "Invalid authentication code", statusCode: StatusCodes.Status400BadRequest);

        admin.MfaEnabled = false;
        admin.MfaSecret = null;
        admin.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync();
        await AuditAsync(admin.Email, admin.Role, "auth.mfa.disabled", "TOTP disabled", 200);

        // Disabling MFA immediately drops this session back to "setup required" for
        // Staff/AdminOnly endpoints — you cannot turn off MFA and keep unrestricted
        // access on the same token.
        var refreshedToken = _jwt.CreateToken(admin.Id.ToString(), admin.Email, admin.Name, admin.Role,
            picture: null, agencyCode: admin.AgencyCode, mfaEnabled: false);
        Response.Cookies.Append("osc-session", refreshedToken, _jwt.GetCookieOptions(_env.IsProduction()));

        return Ok(new ApiResponse<MfaStatusResponse>(true, new MfaStatusResponse(false)));
    }

    /// <summary>Request a password reset link via email.</summary>
    [HttpPost("password-reset")]
    [EnableRateLimiting("password-reset")]
    public async Task<IActionResult> RequestPasswordReset([FromBody] PasswordResetRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return Problem(detail: "Email is required", statusCode: StatusCodes.Status400BadRequest);

        // Always return success to prevent email enumeration
        var resetEmail = request.Email.ToLowerInvariant().Trim();
        var admin = await _db.AdminUsers
            .FirstOrDefaultAsync(a => a.Email == resetEmail && a.IsActive);

        if (admin is not null)
        {
            // The raw token is only ever sent by email; the DB stores its hash, so a
            // read-only compromise of the database can't be used to reset a password.
            var resetToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
            admin.PasswordResetToken = HashResetToken(resetToken);
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
            return Problem(detail: "Password must be at least 8 characters and include an uppercase letter and a digit", statusCode: StatusCodes.Status400BadRequest);

        if (string.IsNullOrWhiteSpace(request.Token))
            return Problem(detail: "Invalid or expired reset token", statusCode: StatusCodes.Status400BadRequest);

        var tokenHash = HashResetToken(request.Token);
        var admin = await _db.AdminUsers
            .FirstOrDefaultAsync(a => a.PasswordResetToken == tokenHash && a.IsActive);

        if (admin is null || admin.PasswordResetExpiresAt is null || admin.PasswordResetExpiresAt < DateTimeOffset.UtcNow)
            return Problem(detail: "Invalid or expired reset token", statusCode: StatusCodes.Status400BadRequest);

        admin.PasswordHash = _password.HashPassword(request.NewPassword);
        admin.PasswordResetToken = null;
        admin.PasswordResetExpiresAt = null;
        admin.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse(true, "Password has been reset successfully"));
    }
}
