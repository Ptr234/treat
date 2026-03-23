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
    private readonly EmailService _email;
    private readonly ReferenceNumberGenerator _refGen;

    public InvestorsController(OscDbContext db, EmailService email, ReferenceNumberGenerator refGen)
    {
        _db = db;
        _email = email;
        _refGen = refGen;
    }

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

    private static InvestorTimeframe ParseTimeframe(string value) => value switch
    {
        "immediate" => InvestorTimeframe.Immediate,
        "3-months" => InvestorTimeframe.ThreeMonths,
        "6-months" => InvestorTimeframe.SixMonths,
        "1-year" => InvestorTimeframe.OneYear,
        _ => Enum.Parse<InvestorTimeframe>(value, true),
    };
}
