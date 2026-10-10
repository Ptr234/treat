using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using OscApi.Common;
using OscApi.Dtos.Common;
using OscApi.Dtos.Tickets;
using OscApi.Services;

namespace OscApi.Controllers;

[ApiController]
[Route("api/v1/tickets")]
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

    /// <summary>The signed-in staff member, for message authorship and the ticket history.</summary>
    private StaffActor CurrentActor() => new(
        User.FindFirst("name")?.Value ?? "UIA Officer",
        User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value);

    // A single 404 for "missing" and "not yours": the public side must not be
    // able to tell which reference numbers exist.
    private ObjectResult NotFoundOrForbidden() =>
        Problem(detail: "Ticket not found, or this link is not valid for it", statusCode: StatusCodes.Status404NotFound);

    /// <summary>Staff ticket board. Admin-level staff see all; agency officers see only their agency's.</summary>
    [HttpGet]
    [Authorize(Policy = Roles.StaffPolicy)]
    public async Task<IActionResult> ListTickets([FromQuery] TicketListQuery query)
    {
        var scope = ResolveAgencyScope(out var misconfigured);
        if (misconfigured) return Forbid();
        return Ok(new ApiResponse<object>(true, await _tickets.ListAsync(query, scope)));
    }

    /// <summary>Agencies a ticket can be assigned to.</summary>
    [HttpGet("agencies")]
    [Authorize(Policy = Roles.StaffPolicy)]
    public IActionResult ListAgencies() =>
        Ok(new ApiResponse<object>(true, AgencyDirectory.All.Select(a => new { code = a.Code, name = a.Name })));

    /// <summary>
    /// Active staff a ticket in <paramref name="agency"/> can be assigned to (that
    /// agency's officers plus admin-level staff). An agency officer only ever
    /// gets their own agency's list.
    /// </summary>
    [HttpGet("officers")]
    [Authorize(Policy = Roles.StaffPolicy)]
    public async Task<IActionResult> ListAssignableOfficers([FromQuery] string? agency)
    {
        var scope = ResolveAgencyScope(out var misconfigured);
        if (misconfigured) return Forbid();

        var code = scope ?? agency;
        if (!AgencyDirectory.IsKnown(code))
            return Problem(detail: "Unknown agency code", statusCode: StatusCodes.Status400BadRequest);
        return Ok(new ApiResponse<object>(true, await _tickets.ListAssignableOfficersAsync(AgencyDirectory.Normalize(code!))));
    }

    /// <summary>File a ticket. The response carries the filer's private access token.</summary>
    [HttpPost]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> CreateTicket([FromBody] CreateTicketRequest request)
    {
        var who = TicketRequester.From(User, null);
        var accountEmail = User.VerifiedAccountEmail();
        if (accountEmail is not null) request = request with { ContactEmail = accountEmail };
        var result = await _tickets.CreateAsync(request, who.IsStaff);
        return Created("", new ApiResponse<object>(true, result));
    }

    /// <summary>Get a ticket: staff by session, the filer by tracking token or signed-in account.</summary>
    [HttpGet("{refNumber}")]
    [EnableRateLimiting("public-read")]
    public async Task<IActionResult> GetTicket(string refNumber, [FromQuery] string? token)
    {
        var who = TicketRequester.From(User, token);
        if (who.IsMisconfiguredOfficer(User)) return Forbid();
        var result = await _tickets.GetAsync(refNumber, who);
        return result is null ? NotFoundOrForbidden() : Ok(new ApiResponse<object>(true, result));
    }

    /// <summary>Update a ticket. Admin-level staff, or an agency officer for their own agency's tickets.</summary>
    [HttpPatch("{refNumber}")]
    [Authorize(Policy = Roles.StaffPolicy)]
    public async Task<IActionResult> UpdateTicket(string refNumber, [FromBody] UpdateTicketRequest request)
    {
        var scope = ResolveAgencyScope(out var misconfigured);
        if (misconfigured) return Forbid();

        var result = await _tickets.UpdateAsync(refNumber, request, scope, CurrentActor());
        if (result is null) return Problem(detail: "Ticket not found", statusCode: StatusCodes.Status404NotFound);
        return Ok(new ApiResponse<object>(true, result));
    }

    /// <summary>Get messages for a ticket (internal notes are staff-only).</summary>
    [HttpGet("{refNumber}/messages")]
    [EnableRateLimiting("public-read")]
    public async Task<IActionResult> GetMessages(string refNumber, [FromQuery] string? token)
    {
        var who = TicketRequester.From(User, token);
        if (who.IsMisconfiguredOfficer(User)) return Forbid();
        var result = await _tickets.GetMessagesAsync(refNumber, who);
        return result is null ? NotFoundOrForbidden() : Ok(new ApiResponse<object>(true, result));
    }

    /// <summary>Post a staff reply (officer). Identity and role come from the session.
    /// A non-internal reply is emailed to the investor.</summary>
    [HttpPost("{refNumber}/messages")]
    [Authorize(Policy = Roles.StaffPolicy)]
    public async Task<IActionResult> PostStaffMessage(string refNumber, [FromBody] StaffMessageRequest request)
    {
        var scope = ResolveAgencyScope(out var misconfigured);
        if (misconfigured) return Forbid();

        var actor = CurrentActor();
        var result = await _tickets.PostStaffMessageAsync(refNumber, request.Content, actor.Name, actor.Email, request.IsInternal, scope);
        if (result is null) return Problem(detail: "Ticket not found", statusCode: StatusCodes.Status404NotFound);
        return Created("", new ApiResponse<object>(true, result));
    }

    /// <summary>Post a reply as the ticket's filer (tracking token or signed-in owner).</summary>
    [HttpPost("{refNumber}/comments")]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> PostPublicComment(string refNumber, [FromBody] PublicCommentRequest request)
    {
        var result = await _tickets.PostPublicCommentAsync(refNumber, request.Content, TicketRequester.From(User, request.Token));
        return result is null ? NotFoundOrForbidden() : Created("", new ApiResponse<object>(true, result));
    }

    /// <summary>Public self-service update (escalate / rate) by the ticket's filer.</summary>
    [HttpPatch("{refNumber}/public")]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> PublicUpdate(string refNumber, [FromBody] PublicTicketUpdateRequest request)
    {
        var result = await _tickets.PublicUpdateAsync(refNumber, request, TicketRequester.From(User, request.Token));
        return result is null ? NotFoundOrForbidden() : Ok(new ApiResponse<object>(true, result));
    }

    /// <summary>
    /// Re-send the private tracking link to the filing email. Always 202 — the
    /// link only goes to the address on file, and the response never says
    /// whether the reference or email matched.
    /// </summary>
    [HttpPost("{refNumber}/access-link")]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> RequestAccessLink(string refNumber, [FromBody] TicketAccessLinkRequest request)
    {
        await _tickets.RequestAccessLinkAsync(refNumber, request.Email);
        return Accepted(new ApiResponse(true));
    }
}
