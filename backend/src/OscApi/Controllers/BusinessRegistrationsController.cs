using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using OscApi.Common;
using OscApi.Dtos.BusinessRegistrations;
using OscApi.Dtos.Common;
using OscApi.Dtos.Payments;
using OscApi.Services;

namespace OscApi.Controllers;

/// <summary>
/// URSB's business registration registry — a tracked transaction with its own
/// status lifecycle and certificate issuance, distinct from the general support
/// ticket system. See BusinessRegistrationStatus for the state machine.
/// </summary>
[ApiController]
[Route("api/v1/business-registrations")]
public class BusinessRegistrationsController : ControllerBase
{
    private readonly IBusinessRegistrationService _registrations;
    private readonly IPaymentService _payments;

    public BusinessRegistrationsController(IBusinessRegistrationService registrations, IPaymentService payments)
    {
        _registrations = registrations;
        _payments = payments;
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
            return Problem(detail: "name is required", statusCode: StatusCodes.Status400BadRequest);

        var result = await _registrations.CheckNameAsync(name);
        return Ok(new ApiResponse<NameCheckResponse>(true, result));
    }

    /// <summary>Submit a new business registration.</summary>
    [HttpPost]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> Create([FromBody] CreateBusinessRegistrationRequest request)
    {
        var result = await _registrations.CreateAsync(request);
        return Created($"/api/v1/business-registrations/{result.ReferenceNumber}",
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
                ? Problem(detail: "Registration not found", statusCode: StatusCodes.Status404NotFound)
                : Problem(detail: "Email does not match registration", statusCode: 403);
        return Ok(new ApiResponse<BusinessRegistrationDetailResponse>(true, result));
    }

    /// <summary>Review a registration: approve/reject the name, or issue the certificate.</summary>
    [HttpPatch("{refNumber}")]
    [Authorize(Policy = Roles.StaffPolicy)]
    public async Task<IActionResult> Update(string refNumber, [FromBody] UpdateBusinessRegistrationRequest request)
    {
        var scope = ResolveAgencyScope(out var misconfigured);
        if (misconfigured) return Forbid();

        var actorEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
            ?? User.FindFirst("email")?.Value ?? "(unknown)";
        var actorRole = User.GetRole() ?? "-";
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        var result = await _registrations.UpdateAsync(refNumber, request, scope, actorEmail, actorRole, ip);
        if (result is null) return Problem(detail: "Registration not found", statusCode: StatusCodes.Status404NotFound);
        return Ok(new ApiResponse<BusinessRegistrationDetailResponse>(true, result));
    }

    /// <summary>Start payment of the registration fee, returning a Flutterwave hosted
    /// checkout link. Idempotent: if the fee is already paid, returns that instead
    /// of charging again.</summary>
    [HttpPost("{refNumber}/payment/initiate")]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> InitiatePayment(string refNumber, [FromQuery] string? email)
    {
        var isStaff = User.IsAdminLevel() || User.IsAgencyOfficer();
        if (await _registrations.GetByRefAsync(refNumber, email, isStaff) is null)
            return Problem(detail: "Registration not found or email does not match", statusCode: StatusCodes.Status404NotFound);

        try
        {
            var result = await _payments.InitiatePaymentAsync(refNumber);
            return Ok(new ApiResponse<InitiatePaymentResponse>(true, result));
        }
        catch (KeyNotFoundException)
        {
            return Problem(detail: "Registration not found", statusCode: StatusCodes.Status404NotFound);
        }
        catch (InvalidOperationException ex)
        {
            return Problem(detail: ex.Message, statusCode: 503);
        }
    }

    /// <summary>Current fee-payment status for a registration, for the applicant's
    /// tracking page to poll after returning from checkout.</summary>
    [HttpGet("{refNumber}/payment")]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> PaymentStatus(string refNumber, [FromQuery] string? email)
    {
        var isStaff = User.IsAdminLevel() || User.IsAgencyOfficer();
        if (await _registrations.GetByRefAsync(refNumber, email, isStaff) is null)
            return Problem(detail: "Registration not found or email does not match", statusCode: StatusCodes.Status404NotFound);

        var result = await _payments.GetStatusAsync(refNumber);
        if (result is null) return Problem(detail: "Registration not found", statusCode: StatusCodes.Status404NotFound);
        return Ok(new ApiResponse<PaymentStatusResponse>(true, result));
    }

    /// <summary>Get the issued certificate. Only available once the registration reaches CertificateIssued.</summary>
    [HttpGet("{refNumber}/certificate")]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> GetCertificate(string refNumber, [FromQuery] string? email)
    {
        var isStaff = User.IsAdminLevel() || User.IsAgencyOfficer();
        var result = await _registrations.GetCertificateAsync(refNumber, email, isStaff);
        if (result is null) return Problem(detail: "Certificate not available", statusCode: StatusCodes.Status404NotFound);
        return Ok(new ApiResponse<CertificateResponse>(true, result));
    }
}
