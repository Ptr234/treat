using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using OscApi.Common;
using OscApi.Dtos.BusinessRegistrations;
using OscApi.Dtos.Common;
using OscApi.Services;

namespace OscApi.Controllers;

/// <summary>
/// URSB's business registration registry — a tracked transaction with its own
/// status lifecycle and certificate issuance, distinct from the general support
/// ticket system. See BusinessRegistrationStatus for the state machine.
/// </summary>
[ApiController]
[Route("api/business-registrations")]
public class BusinessRegistrationsController : ControllerBase
{
    private readonly IBusinessRegistrationService _registrations;

    public BusinessRegistrationsController(IBusinessRegistrationService registrations)
    {
        _registrations = registrations;
    }

    private string? ResolveAgencyScope(out bool misconfigured)
    {
        misconfigured = false;
        if (!User.IsAgencyOfficer()) return null;
        var code = User.GetAgencyCode();
        if (string.IsNullOrEmpty(code)) misconfigured = true;
        return code;
    }

    /// <summary>Check whether a proposed business name is available before submitting.</summary>
    [HttpGet("check-name")]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> CheckName([FromQuery] string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return BadRequest(new ApiResponse(false, "name is required"));

        var result = await _registrations.CheckNameAsync(name);
        return Ok(new ApiResponse<NameCheckResponse>(true, result));
    }

    /// <summary>Submit a new business registration.</summary>
    [HttpPost]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> Create([FromBody] CreateBusinessRegistrationRequest request)
    {
        var result = await _registrations.CreateAsync(request);
        return Created($"/api/business-registrations/{result.ReferenceNumber}",
            new ApiResponse<BusinessRegistrationResponse>(true, result));
    }

    /// <summary>List registrations. Admin-level staff and URSB officers see the registry; other agencies see none.</summary>
    [HttpGet]
    [Authorize(Policy = Roles.StaffPolicy)]
    public async Task<IActionResult> List([FromQuery] int from = 0, [FromQuery] int to = 50)
    {
        var scope = ResolveAgencyScope(out var misconfigured);
        if (misconfigured) return Forbid();
        var result = await _registrations.ListAsync(from, to, scope);
        return Ok(new ApiResponse<object>(true, result));
    }

    /// <summary>Get a registration by reference number. Staff, or the public with the filing email.</summary>
    [HttpGet("{refNumber}")]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> GetByRef(string refNumber, [FromQuery] string? email)
    {
        var isStaff = User.IsAdminLevel() || User.IsAgencyOfficer();
        var result = await _registrations.GetByRefAsync(refNumber, email, isStaff);
        if (result is null)
            return isStaff
                ? NotFound(new ApiResponse(false, "Registration not found"))
                : StatusCode(403, new ApiResponse(false, "Email does not match registration"));
        return Ok(new ApiResponse<BusinessRegistrationDetailResponse>(true, result));
    }

    /// <summary>Review a registration: approve/reject the name, or issue the certificate.</summary>
    [HttpPatch("{refNumber}")]
    [Authorize(Policy = Roles.StaffPolicy)]
    public async Task<IActionResult> Update(string refNumber, [FromBody] UpdateBusinessRegistrationRequest request)
    {
        var scope = ResolveAgencyScope(out var misconfigured);
        if (misconfigured) return Forbid();

        var result = await _registrations.UpdateAsync(refNumber, request, scope);
        if (result is null) return NotFound(new ApiResponse(false, "Registration not found"));
        return Ok(new ApiResponse<BusinessRegistrationDetailResponse>(true, result));
    }

    /// <summary>Get the issued certificate. Only available once the registration reaches CertificateIssued.</summary>
    [HttpGet("{refNumber}/certificate")]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> GetCertificate(string refNumber, [FromQuery] string? email)
    {
        var isStaff = User.IsAdminLevel() || User.IsAgencyOfficer();
        var result = await _registrations.GetCertificateAsync(refNumber, email, isStaff);
        if (result is null) return NotFound(new ApiResponse(false, "Certificate not available"));
        return Ok(new ApiResponse<CertificateResponse>(true, result));
    }
}
