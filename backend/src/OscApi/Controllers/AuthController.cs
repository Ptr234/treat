using Microsoft.AspNetCore.Mvc;
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
    private readonly IWebHostEnvironment _env;

    public AuthController(OscDbContext db, JwtService jwt, PasswordService password, IWebHostEnvironment env)
    {
        _db = db;
        _jwt = jwt;
        _password = password;
        _env = env;
    }

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

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("osc-session", new CookieOptions { Path = "/" });
        return Ok(new ApiResponse(true));
    }

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

        if (!string.IsNullOrWhiteSpace(request.Password))
            admin.PasswordHash = _password.HashPassword(request.Password);

        admin.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync();

        var newToken = _jwt.CreateToken(admin.Id.ToString(), admin.Email, admin.Name, admin.Role);
        Response.Cookies.Append("osc-session", newToken, _jwt.GetCookieOptions(_env.IsProduction()));

        return Ok(new ApiResponse<AuthResponse>(true, new AuthResponse(
            admin.Id.ToString(), admin.Email, admin.Name, admin.Role)));
    }
}
