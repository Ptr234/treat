using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using OscApi.Common;
using OscApi.Dtos.Common;
using OscApi.Dtos.Investors;
using OscApi.Services;

namespace OscApi.Controllers;

[ApiController]
[Route("api/investors")]
public class InvestorsController : ControllerBase
{
    private readonly IInvestorService _investors;

    public InvestorsController(IInvestorService investors)
    {
        _investors = investors;
    }

    /// <summary>List investor profiles (admin-level staff only).</summary>
    [HttpGet]
    public async Task<IActionResult> ListInvestors([FromQuery] int from = 0, [FromQuery] int to = 50, [FromQuery] string? status = null)
    {
        if (!User.IsAdminLevel()) return StatusCode(403, new ApiResponse(false, "Admin access required"));
        var result = await _investors.ListAsync(from, to, status);
        return Ok(new ApiResponse<object>(true, result));
    }

    /// <summary>Get investor profile by reference number.</summary>
    [HttpGet("{refNumber}")]
    public async Task<IActionResult> GetInvestor(string refNumber, [FromQuery] string? email)
    {
        var isAdmin = User.IsAdminLevel();
        var result = await _investors.GetByRefAsync(refNumber, email, isAdmin);
        if (result is null)
            return isAdmin
                ? NotFound(new ApiResponse(false, "Investor profile not found"))
                : StatusCode(403, new ApiResponse(false, "Email does not match profile"));
        return Ok(new ApiResponse<InvestorDetailResponse>(true, result));
    }

    /// <summary>Create a new investor profile.</summary>
    [HttpPost]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> CreateInvestor([FromBody] CreateInvestorRequest request)
    {
        var (result, error) = await _investors.CreateAsync(request);
        if (error is not null)
            return Conflict(new ApiResponse(false, error));
        return Created($"/api/investors/{result!.ReferenceNumber}",
            new ApiResponse<InvestorResponse>(true, result));
    }

    /// <summary>Update an investor profile (admin-level staff only).</summary>
    [HttpPatch("{refNumber}")]
    public async Task<IActionResult> UpdateInvestor(string refNumber, [FromBody] UpdateInvestorRequest request)
    {
        if (!User.IsAdminLevel()) return StatusCode(403, new ApiResponse(false, "Admin access required"));
        var result = await _investors.UpdateAsync(refNumber, request);
        if (result is null) return NotFound(new ApiResponse(false, "Investor profile not found"));
        return Ok(new ApiResponse<InvestorResponse>(true, result));
    }

    /// <summary>Delete an investor profile (admin-level staff only).</summary>
    [HttpDelete("{refNumber}")]
    public async Task<IActionResult> DeleteInvestor(string refNumber)
    {
        if (!User.IsAdminLevel()) return StatusCode(403, new ApiResponse(false, "Admin access required"));
        var deleted = await _investors.DeleteAsync(refNumber);
        if (!deleted) return NotFound(new ApiResponse(false, "Investor profile not found"));
        return Ok(new ApiResponse(true));
    }
}
