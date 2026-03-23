using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OscApi.Dtos.Common;
using OscApi.Dtos.Contact;
using OscApi.Services;

namespace OscApi.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController : ControllerBase
{
    private readonly IContactService _contactService;

    public ContactController(IContactService contactService)
    {
        _contactService = contactService;
    }

    /// <summary>Submit a contact inquiry to an agency.</summary>
    [HttpPost("inquiries")]
    public async Task<IActionResult> CreateInquiry([FromBody] CreateContactInquiryRequest request)
    {
        var result = await _contactService.CreateInquiryAsync(request);
        return Created($"/api/contact/inquiries/{result.ReferenceNumber}",
            new ApiResponse<ContactInquiryResponse>(true, result));
    }

    /// <summary>Submit an appointment request with an agency.</summary>
    [HttpPost("appointments")]
    public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentRequest request)
    {
        var result = await _contactService.CreateAppointmentAsync(request);
        return Created($"/api/contact/appointments/{result.ReferenceNumber}",
            new ApiResponse<AppointmentResponse>(true, result));
    }

    /// <summary>List contact inquiries (admin only).</summary>
    [HttpGet("inquiries")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ListInquiries(
        [FromQuery] int from = 0, [FromQuery] int to = 50, [FromQuery] string? agencyCode = null)
    {
        var result = await _contactService.ListInquiriesAsync(from, to, agencyCode);
        return Ok(new ApiResponse<object>(true, result));
    }

    /// <summary>List appointments (admin only).</summary>
    [HttpGet("appointments")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ListAppointments(
        [FromQuery] int from = 0, [FromQuery] int to = 50, [FromQuery] string? agencyCode = null)
    {
        var result = await _contactService.ListAppointmentsAsync(from, to, agencyCode);
        return Ok(new ApiResponse<object>(true, result));
    }
}
