using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using OscApi.Common;
using OscApi.Dtos.Common;
using OscApi.Dtos.Tickets;
using OscApi.Services;

namespace OscApi.Controllers;

[ApiController]
[Route("api/tickets")]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _tickets;

    public TicketsController(ITicketService tickets)
    {
        _tickets = tickets;
    }

    /// <summary>
    /// The agency an agency_officer is limited to, or null for admin-level staff
    /// (who see everything). Sets <paramref name="misconfigured"/> to true when an
    /// officer account has no agency configured, so the caller can deny access.
    /// </summary>
    private string? ResolveAgencyScope(out bool misconfigured)
    {
        misconfigured = false;
        if (!User.IsAgencyOfficer()) return null;
        var code = User.GetAgencyCode();
        if (string.IsNullOrEmpty(code)) misconfigured = true;
        return code;
    }

    /// <summary>List tickets. Admin-level staff see all; agency officers see only their agency's.</summary>
    [HttpGet]
    [Authorize(Policy = Roles.StaffPolicy)]
    public async Task<IActionResult> ListTickets([FromQuery] int? page = null, [FromQuery] int? pageSize = null, [FromQuery] int? from = null, [FromQuery] int? to = null)
    {
        // Support both pagination styles: page/pageSize or from/to
        int start = 0, end = 50;

        if (page.HasValue || pageSize.HasValue)
        {
            var p = page ?? 1;
            var ps = pageSize ?? 50;

            if (p < 1 || ps < 1 || ps > Pagination.MaxPageSize)
                return BadRequest(new ApiResponse(false, $"Invalid pagination parameters: page must be >= 1, pageSize must be between 1 and {Pagination.MaxPageSize}"));

            start = (p - 1) * ps;
            end = start + ps;
        }
        else if (from.HasValue || to.HasValue)
        {
            start = from ?? 0;
            end = to ?? 50;
        }

        var scope = ResolveAgencyScope(out var misconfigured);
        if (misconfigured) return Forbid();
        var result = await _tickets.ListAsync(start, end, scope);
        return Ok(new ApiResponse<object>(true, result));
    }

    /// <summary>Create a new support ticket.</summary>
    [HttpPost]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> CreateTicket([FromBody] CreateTicketRequest request)
    {
        var result = await _tickets.CreateAsync(request);
        return Created("", new ApiResponse<object>(true, result));
    }

    /// <summary>Get a ticket by reference number.</summary>
    [HttpGet("{refNumber}")]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> GetTicket(string refNumber, [FromQuery] string? email)
    {
        var isStaff = User.IsAdminLevel() || User.IsAgencyOfficer();
        var scope = ResolveAgencyScope(out var misconfigured);
        if (misconfigured) return Forbid();

        var result = await _tickets.GetByRefAsync(refNumber, email, isStaff, scope);
        if (result is null)
            return isStaff
                ? NotFound(new ApiResponse(false, "Ticket not found"))
                : StatusCode(403, new ApiResponse(false, "Email does not match ticket"));
        return Ok(new ApiResponse<object>(true, result));
    }

    /// <summary>Update a ticket. Admin-level staff, or an agency officer for their own agency's tickets.</summary>
    [HttpPatch("{refNumber}")]
    [Authorize(Policy = Roles.StaffPolicy)]
    public async Task<IActionResult> UpdateTicket(string refNumber, [FromBody] UpdateTicketRequest request)
    {
        var scope = ResolveAgencyScope(out var misconfigured);
        if (misconfigured) return Forbid();

        var result = await _tickets.UpdateAsync(refNumber, request, scope);
        if (result is null) return NotFound(new ApiResponse(false, "Ticket not found"));
        return Ok(new ApiResponse<object>(true, result));
    }

    /// <summary>Get messages for a ticket.</summary>
    [HttpGet("{refNumber}/messages")]
    public async Task<IActionResult> GetMessages(string refNumber, [FromQuery] string? email)
    {
        var isStaff = User.IsAdminLevel() || User.IsAgencyOfficer();
        var scope = ResolveAgencyScope(out var misconfigured);
        if (misconfigured) return Forbid();

        var result = await _tickets.GetMessagesAsync(refNumber, email, isStaff, scope);
        if (result is null) return NotFound(new ApiResponse(false, "Ticket not found"));
        return Ok(new ApiResponse<object>(true, result));
    }

    /// <summary>Post a staff reply (officer). Identity and role come from the session.</summary>
    [HttpPost("{refNumber}/messages")]
    [Authorize(Policy = Roles.StaffPolicy)]
    public async Task<IActionResult> PostStaffMessage(string refNumber, [FromBody] StaffMessageRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
            return BadRequest(new ApiResponse(false, "Message content is required"));

        var scope = ResolveAgencyScope(out var misconfigured);
        if (misconfigured) return Forbid();

        var name = User.FindFirst("name")?.Value ?? "UIA Officer";
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
            ?? User.FindFirst("email")?.Value;

        var result = await _tickets.PostStaffMessageAsync(refNumber, request.Content, name, email, request.IsInternal, scope);
        if (result is null) return NotFound(new ApiResponse(false, "Ticket not found"));
        return Created("", new ApiResponse<object>(true, result));
    }

    /// <summary>Post a public reply (investor). Requires the email used to file the ticket.</summary>
    [HttpPost("{refNumber}/comments")]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> PostPublicComment(string refNumber, [FromBody] PublicCommentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
            return BadRequest(new ApiResponse(false, "Comment content is required"));

        var result = await _tickets.PostPublicCommentAsync(refNumber, request.Content, request.AuthorName, request.AuthorEmail);
        // A null result means the ticket is missing or the email doesn't match; a
        // single 403 avoids leaking which tickets exist.
        if (result is null) return StatusCode(403, new ApiResponse(false, "Ticket not found or email does not match"));
        return Created("", new ApiResponse<object>(true, result));
    }

    /// <summary>Public self-service update (escalate / rate), gated by the filer's email.</summary>
    [HttpPatch("{refNumber}/public")]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> PublicUpdate(string refNumber, [FromBody] PublicTicketUpdateRequest request)
    {
        var result = await _tickets.PublicUpdateAsync(refNumber, request);
        if (result is null) return StatusCode(403, new ApiResponse(false, "Not permitted, or the action is not available for this ticket"));
        return Ok(new ApiResponse<object>(true, result));
    }
}
