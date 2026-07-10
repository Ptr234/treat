using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using OscApi.Common;
using OscApi.Dtos.Common;
using OscApi.Dtos.Contact;
using OscApi.Services;

namespace OscApi.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController : ControllerBase
{
    private readonly IContactService _contactService;
    private readonly RecaptchaService _recaptcha;

    public ContactController(IContactService contactService, RecaptchaService recaptcha)
    {
        _contactService = contactService;
        _recaptcha = recaptcha;
    }

    /// <summary>Submit a contact inquiry to an agency.</summary>
    [HttpPost("inquiries")]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> CreateInquiry(
        [FromBody] CreateContactInquiryRequest request,
        [FromHeader(Name = "X-Recaptcha-Token")] string? recaptchaToken)
    {
        if (!await _recaptcha.VerifyAsync(recaptchaToken))
            return BadRequest(new ApiResponse(false, "reCAPTCHA verification failed"));

        var result = await _contactService.CreateInquiryAsync(request);
        return Created($"/api/contact/inquiries/{result.ReferenceNumber}",
            new ApiResponse<ContactInquiryResponse>(true, result));
    }

    /// <summary>Submit an appointment request with an agency.</summary>
    [HttpPost("appointments")]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> CreateAppointment(
        [FromBody] CreateAppointmentRequest request,
        [FromHeader(Name = "X-Recaptcha-Token")] string? recaptchaToken)
    {
        if (!await _recaptcha.VerifyAsync(recaptchaToken))
            return BadRequest(new ApiResponse(false, "reCAPTCHA verification failed"));

        var result = await _contactService.CreateAppointmentAsync(request);
        return Created($"/api/contact/appointments/{result.ReferenceNumber}",
            new ApiResponse<AppointmentResponse>(true, result));
    }

    /// <summary>List contact inquiries (staff only; agency officers are scoped to their own agency).</summary>
    [HttpGet("inquiries")]
    [Authorize(Policy = Roles.StaffPolicy)]
    public async Task<IActionResult> ListInquiries(
        [FromQuery] int from = 0, [FromQuery] int to = 50, [FromQuery] string? agencyCode = null)
    {
        if (User.IsAgencyOfficer())
        {
            var scope = User.GetAgencyCode();
            if (string.IsNullOrEmpty(scope)) return Forbid();
            agencyCode = scope;
        }
        var result = await _contactService.ListInquiriesAsync(from, to, agencyCode);
        return Ok(new ApiResponse<object>(true, result));
    }

    /// <summary>List appointments (staff only; agency officers are scoped to their own agency).</summary>
    [HttpGet("appointments")]
    [Authorize(Policy = Roles.StaffPolicy)]
    public async Task<IActionResult> ListAppointments(
        [FromQuery] int from = 0, [FromQuery] int to = 50, [FromQuery] string? agencyCode = null)
    {
        if (User.IsAgencyOfficer())
        {
            var scope = User.GetAgencyCode();
            if (string.IsNullOrEmpty(scope)) return Forbid();
            agencyCode = scope;
        }
        var result = await _contactService.ListAppointmentsAsync(from, to, agencyCode);
        return Ok(new ApiResponse<object>(true, result));
    }
}
