using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.Common;
using OscApi.Dtos.Tickets;
using OscApi.Models;

namespace OscApi.Controllers;

[ApiController]
[Route("api/tickets")]
public class TicketsController : ControllerBase
{
    private readonly OscDbContext _db;
    private readonly EmailService _email;
    private readonly ReferenceNumberGenerator _refGen;

    public TicketsController(OscDbContext db, EmailService email, ReferenceNumberGenerator refGen)
    {
        _db = db;
        _email = email;
        _refGen = refGen;
    }

    /// <summary>List all tickets (admin only).</summary>
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ListTickets([FromQuery] int from = 0, [FromQuery] int to = 50)
    {
        var total = await _db.Tickets.CountAsync();
        var tickets = await _db.Tickets
            .OrderByDescending(t => t.CreatedAt)
            .Skip(from).Take(to - from)
            .Select(t => new
            {
                t.ReferenceNumber, t.Title, t.Category, t.Priority, t.Status,
                t.ContactName, t.ContactEmail, t.AssignedAgencyCode, t.Assignee,
                t.IsEscalated, t.SlaDeadlineAt, t.CreatedAt, t.ResolvedAt,
                MessageCount = t.Messages.Count
            })
            .ToListAsync();

        return Ok(new ApiResponse<object>(true, new { tickets, total }));
    }

    /// <summary>Create a new support ticket.</summary>
    [HttpPost]
    [EnableRateLimiting("public-form")]
    public async Task<IActionResult> CreateTicket([FromBody] CreateTicketRequest request)
    {
        var category = Enum.Parse<TicketCategory>(ToPascalCase(request.Category), true);
        var priority = Enum.Parse<TicketPriority>(request.Priority ?? "medium", true);
        var (slaHours, slaDeadline) = SlaCalculator.Compute(category);
        var refNumber = await _refGen.GenerateTicketReferenceAsync();

        var ticket = new Ticket
        {
            ReferenceNumber = refNumber,
            Title = SanitizeHelper.StripHtml(request.Title),
            Description = SanitizeHelper.StripHtml(request.Description),
            Category = category,
            Priority = priority,
            ContactName = SanitizeHelper.StripHtml(request.ContactName),
            ContactEmail = request.ContactEmail.ToLowerInvariant().Trim(),
            ContactPhone = request.ContactPhone,
            InvestorNationality = request.InvestorNationality,
            Sector = request.Sector,
            InvestmentSize = request.InvestmentSize,
            SlaDeadlineHours = slaHours,
            SlaDeadlineAt = slaDeadline,
            IsEscalated = request.IsEscalated,
        };

        _db.Tickets.Add(ticket);
        await _db.SaveChangesAsync();

        _ = _email.SendTicketConfirmationAsync(
            ticket.ContactEmail, ticket.ContactName, ticket.ReferenceNumber, ticket.Title);

        return Created($"/api/tickets/{refNumber}", new ApiResponse<object>(true, new
        {
            ticket.ReferenceNumber, ticket.Title, ticket.Status, ticket.SlaDeadlineAt
        }));
    }

    /// <summary>Get a ticket by reference number.</summary>
    [HttpGet("{refNumber}")]
    public async Task<IActionResult> GetTicket(string refNumber, [FromQuery] string? email)
    {
        var ticket = await _db.Tickets
            .Include(t => t.Messages.OrderBy(m => m.SentAt))
            .FirstOrDefaultAsync(t => t.ReferenceNumber == refNumber);

        if (ticket is null)
            return NotFound(new ApiResponse(false, "Ticket not found"));

        var isAdmin = User.IsInRole("admin");

        // Public access requires email verification
        if (!isAdmin)
        {
            if (string.IsNullOrEmpty(email) || email.ToLowerInvariant().Trim() != ticket.ContactEmail)
                return StatusCode(403, new ApiResponse(false, "Email does not match ticket"));
        }

        var messages = ticket.Messages
            .Where(m => isAdmin || !m.IsInternal)
            .Select(m => new { m.Content, m.AuthorName, m.AuthorRole, m.AuthorEmail, m.IsInternal, m.SentAt })
            .ToList();

        return Ok(new ApiResponse<object>(true, new
        {
            ticket.ReferenceNumber, ticket.Title, ticket.Description,
            ticket.Category, ticket.Priority, ticket.Status,
            ticket.ContactName, ticket.ContactEmail, ticket.ContactPhone,
            ticket.InvestorNationality, ticket.Sector, ticket.InvestmentSize,
            ticket.Assignee, ticket.AssignedAgencyCode,
            ticket.SlaDeadlineHours, ticket.SlaDeadlineAt,
            ticket.SatisfactionRating, ticket.SatisfactionComment,
            ticket.IsEscalated, ticket.EscalatedAt,
            ticket.CreatedAt, ticket.ResolvedAt, ticket.ClosedAt,
            messages
        }));
    }

    /// <summary>Update a ticket (admin only).</summary>
    [HttpPatch("{refNumber}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateTicket(string refNumber, [FromBody] UpdateTicketRequest request)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.ReferenceNumber == refNumber);
        if (ticket is null) return NotFound(new ApiResponse(false, "Ticket not found"));

        if (request.Status is not null)
        {
            ticket.Status = Enum.Parse<TicketStatus>(ToPascalCase(request.Status), true);
            if (ticket.Status == TicketStatus.Resolved) ticket.ResolvedAt = DateTimeOffset.UtcNow;
            if (ticket.Status == TicketStatus.Closed) ticket.ClosedAt = DateTimeOffset.UtcNow;
        }

        if (request.Priority is not null)
            ticket.Priority = Enum.Parse<TicketPriority>(request.Priority, true);
        if (request.Assignee is not null)
            ticket.Assignee = request.Assignee;
        if (request.AssignedAgencyCode is not null)
            ticket.AssignedAgencyCode = request.AssignedAgencyCode;
        if (request.SatisfactionRating is not null)
            ticket.SatisfactionRating = request.SatisfactionRating;
        if (request.SatisfactionComment is not null)
            ticket.SatisfactionComment = request.SatisfactionComment;
        if (request.IsEscalated == true && !ticket.IsEscalated)
        {
            ticket.IsEscalated = true;
            ticket.EscalatedAt = DateTimeOffset.UtcNow;
            _ = _email.SendEscalationNotificationAsync(ticket.ReferenceNumber, ticket.Title, ticket.ContactName);
        }

        await _db.SaveChangesAsync();

        if (request.Status is not null)
            _ = _email.SendTicketStatusUpdateAsync(
                ticket.ContactEmail, ticket.ContactName, ticket.ReferenceNumber, request.Status);

        return Ok(new ApiResponse<object>(true, new { ticket.ReferenceNumber, ticket.Status }));
    }

    /// <summary>Get messages for a ticket.</summary>
    [HttpGet("{refNumber}/messages")]
    public async Task<IActionResult> GetMessages(string refNumber, [FromQuery] string? email)
    {
        var ticket = await _db.Tickets
            .Include(t => t.Messages.OrderBy(m => m.SentAt))
            .FirstOrDefaultAsync(t => t.ReferenceNumber == refNumber);

        if (ticket is null) return NotFound(new ApiResponse(false, "Ticket not found"));

        var isAdmin = User.IsInRole("admin");
        if (!isAdmin && (string.IsNullOrEmpty(email) || email.ToLowerInvariant().Trim() != ticket.ContactEmail))
            return StatusCode(403, new ApiResponse(false, "Email does not match ticket"));

        var messages = ticket.Messages
            .Where(m => isAdmin || !m.IsInternal)
            .Select(m => new { m.Content, m.AuthorName, m.AuthorRole, m.AuthorEmail, m.IsInternal, m.SentAt });

        return Ok(new ApiResponse<object>(true, messages));
    }

    /// <summary>Post a message to a ticket.</summary>
    [HttpPost("{refNumber}/messages")]
    public async Task<IActionResult> PostMessage(string refNumber, [FromBody] TicketMessageRequest request)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.ReferenceNumber == refNumber);
        if (ticket is null) return NotFound(new ApiResponse(false, "Ticket not found"));

        var message = new TicketMessage
        {
            TicketId = ticket.Id,
            Content = SanitizeHelper.StripHtml(request.Content),
            AuthorName = SanitizeHelper.StripHtml(request.AuthorName),
            AuthorRole = Enum.Parse<AuthorRole>(request.AuthorRole, true),
            AuthorEmail = request.AuthorEmail,
            IsInternal = request.IsInternal,
        };

        _db.TicketMessages.Add(message);
        await _db.SaveChangesAsync();

        return Created($"/api/tickets/{refNumber}/messages", new ApiResponse<object>(true, new
        {
            message.Content, message.AuthorName, message.AuthorRole, message.SentAt
        }));
    }

    private static string ToPascalCase(string snakeCase)
    {
        return string.Join("", snakeCase.Split('_').Select(s =>
            s.Length > 0 ? char.ToUpper(s[0]) + s[1..] : s));
    }
}
