using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.Common;
using OscApi.Dtos.Investors;
using OscApi.Models;

namespace OscApi.Controllers;

[ApiController]
[Route("api/investors")]
public class InvestorsController : ControllerBase
{
    private readonly OscDbContext _db;
    private readonly JwtService _jwt;
    private readonly EmailService _email;
    private readonly ReferenceNumberGenerator _refGen;

    public InvestorsController(OscDbContext db, JwtService jwt, EmailService email, ReferenceNumberGenerator refGen)
    {
        _db = db;
        _jwt = jwt;
        _email = email;
        _refGen = refGen;
    }

    /// <summary>List investor profiles (admin only).</summary>
    [HttpGet]
    public async Task<IActionResult> ListInvestors([FromQuery] int from = 0, [FromQuery] int to = 50, [FromQuery] string? status = null)
    {
        if (!IsAdmin()) return Unauthorized(new ApiResponse(false, "Admin access required"));

        var query = _db.InvestorProfiles.AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            if (Enum.TryParse<InvestorStatus>(status, true, out var parsed))
                query = query.Where(i => i.Status == parsed);
        }

        var total = await query.CountAsync();
        var investors = await query
            .OrderByDescending(i => i.CreatedAt)
            .Skip(from).Take(to - from)
            .Select(i => new
            {
                i.ReferenceNumber, i.Name, i.Email, i.Phone, i.Nationality,
                i.CompanyName, i.InvestorType, i.PrimarySector,
                Status = i.Status.ToString(), i.CreatedAt
            })
            .ToListAsync();

        return Ok(new ApiResponse<object>(true, new { investors, total }));
    }

    /// <summary>Get investor profile by reference number.</summary>
    [HttpGet("{refNumber}")]
    public async Task<IActionResult> GetInvestor(string refNumber, [FromQuery] string? email)
    {
        var profile = await _db.InvestorProfiles.FirstOrDefaultAsync(i => i.ReferenceNumber == refNumber);
        if (profile is null)
            return NotFound(new ApiResponse(false, "Investor profile not found"));

        var isAdmin = IsAdmin();

        // Public access requires email verification
        if (!isAdmin)
        {
            if (string.IsNullOrEmpty(email) || email.ToLowerInvariant().Trim() != profile.Email)
                return StatusCode(403, new ApiResponse(false, "Email does not match profile"));
        }

        return Ok(new ApiResponse<InvestorDetailResponse>(true, new InvestorDetailResponse(
            profile.ReferenceNumber, profile.Name, profile.Email, profile.Phone,
            profile.Nationality, profile.CompanyName, profile.Position,
            profile.InvestorType.ToString(), profile.Experience.ToString(),
            profile.InvestmentGoal.ToString(), profile.InvestmentAmount,
            profile.TimeHorizon.ToString(), profile.RiskTolerance.ToString(),
            profile.PrimarySector, profile.SecondarySectors, profile.SpecificInterests,
            profile.CapitalSource.ToString(), profile.Timeframe.ToString(),
            profile.SupportNeeded, profile.Status.ToString(), profile.CreatedAt
        )));
    }

    /// <summary>Create a new investor profile.</summary>
    [HttpPost]
    public async Task<IActionResult> CreateInvestor([FromBody] CreateInvestorRequest request)
    {
        var email = request.Email.ToLowerInvariant().Trim();

        var exists = await _db.InvestorProfiles.AnyAsync(i => i.Email == email);
        if (exists)
            return Conflict(new ApiResponse(false, "An investor profile with this email already exists"));

        var refNumber = await _refGen.GenerateInvestorReferenceAsync();

        var profile = new InvestorProfile
        {
            ReferenceNumber = refNumber,
            Name = SanitizeHelper.StripHtml(request.Name),
            Email = email,
            Phone = request.Phone,
            Nationality = request.Nationality,
            CompanyName = request.CompanyName,
            Position = request.Position,
            InvestorType = Enum.Parse<InvestorType>(request.InvestorType, true),
            Experience = Enum.Parse<InvestorExperience>(request.Experience, true),
            InvestmentGoal = Enum.Parse<InvestmentGoal>(request.InvestmentGoal, true),
            InvestmentAmount = request.InvestmentAmount,
            TimeHorizon = Enum.Parse<TimeHorizon>(request.TimeHorizon.Replace("-", ""), true),
            RiskTolerance = Enum.Parse<RiskTolerance>(request.RiskTolerance, true),
            PrimarySector = request.PrimarySector,
            SecondarySectors = request.SecondarySectors?.ToArray() ?? Array.Empty<string>(),
            SpecificInterests = request.SpecificInterests,
            CapitalSource = Enum.Parse<CapitalSource>(request.CapitalSource, true),
            Timeframe = ParseTimeframe(request.Timeframe),
            SupportNeeded = request.SupportNeeded?.ToArray() ?? Array.Empty<string>(),
        };

        _db.InvestorProfiles.Add(profile);
        await _db.SaveChangesAsync();

        _ = _email.SendInvestorWelcomeAsync(profile.Email, profile.Name, profile.ReferenceNumber);

        return Created($"/api/investors/{refNumber}", new ApiResponse<InvestorResponse>(true,
            new InvestorResponse(refNumber, profile.Name, profile.Email, profile.Status.ToString())));
    }

    /// <summary>Update an investor profile (admin or profile owner).</summary>
    [HttpPatch("{refNumber}")]
    public async Task<IActionResult> UpdateInvestor(string refNumber, [FromBody] UpdateInvestorRequest request)
    {
        var profile = await _db.InvestorProfiles.FirstOrDefaultAsync(i => i.ReferenceNumber == refNumber);
        if (profile is null)
            return NotFound(new ApiResponse(false, "Investor profile not found"));

        var isAdmin = IsAdmin();
        if (!isAdmin)
            return Unauthorized(new ApiResponse(false, "Admin access required"));

        if (!string.IsNullOrWhiteSpace(request.Name))
            profile.Name = SanitizeHelper.StripHtml(request.Name);
        if (!string.IsNullOrWhiteSpace(request.Phone))
            profile.Phone = request.Phone;
        if (request.CompanyName is not null)
            profile.CompanyName = request.CompanyName;
        if (request.Position is not null)
            profile.Position = request.Position;
        if (!string.IsNullOrWhiteSpace(request.InvestmentAmount))
            profile.InvestmentAmount = request.InvestmentAmount;
        if (!string.IsNullOrWhiteSpace(request.PrimarySector))
            profile.PrimarySector = request.PrimarySector;
        if (request.SecondarySectors is not null)
            profile.SecondarySectors = request.SecondarySectors.ToArray();
        if (request.SpecificInterests is not null)
            profile.SpecificInterests = request.SpecificInterests;
        if (request.SupportNeeded is not null)
            profile.SupportNeeded = request.SupportNeeded.ToArray();
        if (!string.IsNullOrWhiteSpace(request.Status))
            profile.Status = Enum.Parse<InvestorStatus>(request.Status, true);

        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<InvestorResponse>(true,
            new InvestorResponse(profile.ReferenceNumber, profile.Name, profile.Email, profile.Status.ToString())));
    }

    /// <summary>Delete an investor profile (admin only).</summary>
    [HttpDelete("{refNumber}")]
    public async Task<IActionResult> DeleteInvestor(string refNumber)
    {
        if (!IsAdmin()) return Unauthorized(new ApiResponse(false, "Admin access required"));

        var profile = await _db.InvestorProfiles.FirstOrDefaultAsync(i => i.ReferenceNumber == refNumber);
        if (profile is null)
            return NotFound(new ApiResponse(false, "Investor profile not found"));

        _db.InvestorProfiles.Remove(profile);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse(true));
    }

    private bool IsAdmin()
    {
        var token = Request.Cookies["osc-session"];
        if (string.IsNullOrEmpty(token)) return false;
        var principal = _jwt.ValidateToken(token);
        return principal?.Claims.Any(c =>
            c.Type == System.Security.Claims.ClaimTypes.Role && c.Value == "admin") ?? false;
    }

    private static InvestorTimeframe ParseTimeframe(string value) => value switch
    {
        "immediate" => InvestorTimeframe.Immediate,
        "3-months" => InvestorTimeframe.ThreeMonths,
        "6-months" => InvestorTimeframe.SixMonths,
        "1-year" => InvestorTimeframe.OneYear,
        _ => Enum.Parse<InvestorTimeframe>(value, true),
    };
}
