using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using OscApi.Common;
using OscApi.Dtos.Common;
using OscApi.Dtos.Investors;
using OscApi.Services;

namespace OscApi.Controllers;

[ApiController]
[Route("api/v1/investors")]
public class InvestorsController : ControllerBase
{
    private readonly IInvestorService _investors;

    public InvestorsController(IInvestorService investors)
    {
        _investors = investors;
    }

    /// <summary>List investor profiles (admin-level staff only).</summary>
    [Authorize(Policy = Roles.AdminOnlyPolicy)]
    [HttpGet]
    public async Task<IActionResult> ListInvestors([FromQuery] int from = 0, [FromQuery] int to = 50, [FromQuery] string? status = null)
    {
        var result = await _investors.ListAsync(from, to, status);
        return Ok(new ApiResponse<object>(true, result));
    }

    /// <summary>Get investor profile by reference number.</summary>
    [HttpGet("{refNumber}")]
    public async Task<IActionResult> GetInvestor(string refNumber, [FromQuery] string? email)
    {
        // MFA-complete admin session only — a bare role check would let a
        // back-office session that never finished MFA read any profile.
        var isAdmin = User.IsAdminSession();
        var result = await _investors.GetByRefAsync(refNumber, email, isAdmin);
        if (result is null)
            return isAdmin
                ? Problem(detail: "Investor profile not found", statusCode: StatusCodes.Status404NotFound)
                : Problem(detail: "Email does not match profile", statusCode: 403);
        return Ok(new ApiResponse<InvestorDetailResponse>(true, result));
    }

    /// <summary>Create a new investor profile.</summary>
    [HttpPost]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> CreateInvestor([FromBody] CreateInvestorRequest request)
    {
        var (result, existing) = await _investors.CreateAsync(request);
        // A repeat submission isn't an error for the investor: the onboarding
        // wizard tells them their existing reference has been emailed to them.
        if (existing)
            return Ok(new ApiResponse<CreateInvestorResponse>(true, new CreateInvestorResponse(null, Existing: true)));
        return Created($"/api/v1/investors/{result!.ReferenceNumber}",
            new ApiResponse<CreateInvestorResponse>(true, new CreateInvestorResponse(result.ReferenceNumber, Existing: false)));
    }

    /// <summary>Update an investor profile (admin-level staff only).</summary>
    [Authorize(Policy = Roles.AdminOnlyPolicy)]
    [HttpPatch("{refNumber}")]
    public async Task<IActionResult> UpdateInvestor(string refNumber, [FromBody] UpdateInvestorRequest request)
    {
        var result = await _investors.UpdateAsync(refNumber, request);
        if (result is null) return Problem(detail: "Investor profile not found", statusCode: StatusCodes.Status404NotFound);
        return Ok(new ApiResponse<InvestorResponse>(true, result));
    }

    /// <summary>Delete an investor profile (admin-level staff only).</summary>
    [Authorize(Policy = Roles.AdminOnlyPolicy)]
    [HttpDelete("{refNumber}")]
    public async Task<IActionResult> DeleteInvestor(string refNumber)
    {
        var deleted = await _investors.DeleteAsync(refNumber);
        if (!deleted) return Problem(detail: "Investor profile not found", statusCode: StatusCodes.Status404NotFound);
        return Ok(new ApiResponse(true));
    }
}
