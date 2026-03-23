using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
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

    /// <summary>List all tickets (admin only).</summary>
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ListTickets([FromQuery] int from = 0, [FromQuery] int to = 50)
    {
        var result = await _tickets.ListAsync(from, to);
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
    public async Task<IActionResult> GetTicket(string refNumber, [FromQuery] string? email)
    {
        var isAdmin = User.IsInRole("admin");
        var result = await _tickets.GetByRefAsync(refNumber, email, isAdmin);
        if (result is null)
            return isAdmin
                ? NotFound(new ApiResponse(false, "Ticket not found"))
                : StatusCode(403, new ApiResponse(false, "Email does not match ticket"));
        return Ok(new ApiResponse<object>(true, result));
    }

    /// <summary>Update a ticket (admin only).</summary>
    [HttpPatch("{refNumber}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateTicket(string refNumber, [FromBody] UpdateTicketRequest request)
    {
        var result = await _tickets.UpdateAsync(refNumber, request);
        if (result is null) return NotFound(new ApiResponse(false, "Ticket not found"));
        return Ok(new ApiResponse<object>(true, result));
    }

    /// <summary>Get messages for a ticket.</summary>
    [HttpGet("{refNumber}/messages")]
    public async Task<IActionResult> GetMessages(string refNumber, [FromQuery] string? email)
    {
        var isAdmin = User.IsInRole("admin");
        var result = await _tickets.GetMessagesAsync(refNumber, email, isAdmin);
        if (result is null) return NotFound(new ApiResponse(false, "Ticket not found"));
        return Ok(new ApiResponse<object>(true, result));
    }

    /// <summary>Post a message to a ticket.</summary>
    [HttpPost("{refNumber}/messages")]
    public async Task<IActionResult> PostMessage(string refNumber, [FromBody] TicketMessageRequest request)
    {
        var result = await _tickets.PostMessageAsync(refNumber, request);
        if (result is null) return NotFound(new ApiResponse(false, "Ticket not found"));
        return Created("", new ApiResponse<object>(true, result));
    }
}
