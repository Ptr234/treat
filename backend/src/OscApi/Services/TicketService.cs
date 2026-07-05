using Microsoft.EntityFrameworkCore;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.Tickets;
using OscApi.Models;

namespace OscApi.Services;

public class TicketService : ITicketService
{
    private readonly OscDbContext _db;
    private readonly EmailService _email;
    private readonly ReferenceNumberGenerator _refGen;
    private readonly ISettingsService _settings;

    public TicketService(OscDbContext db, EmailService email, ReferenceNumberGenerator refGen, ISettingsService settings)
    {
        _db = db;
        _email = email;
        _settings = settings;
        _refGen = refGen;
    }

    public async Task<object> ListAsync(int from, int to, string? agencyScope = null)
    {
        var query = _db.Tickets.AsQueryable();
        if (!string.IsNullOrEmpty(agencyScope))
            query = query.Where(t => t.AssignedAgencyCode == agencyScope);

        var total = await query.CountAsync();
        var (skip, take) = Pagination.Normalize(from, to);

        // Use GroupJoin to avoid N+1 query on Messages.Count
        var tickets = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip(skip).Take(take)
            .GroupJoin(_db.TicketMessages, t => t.Id, m => m.TicketId,
                (t, messages) => new
                {
                    t.ReferenceNumber, t.Title, t.Category, t.Priority, t.Status,
                    t.ContactName, t.ContactEmail, t.AssignedAgencyCode, t.Assignee,
                    t.IsEscalated, t.SlaDeadlineAt, t.CreatedAt, t.ResolvedAt,
                    MessageCount = messages.Count()
                })
            .ToListAsync();

        return new { tickets, total };
    }

    public async Task<object> CreateAsync(CreateTicketRequest request)
    {
        var category = Enum.Parse<TicketCategory>(ToPascalCase(request.Category), true);
        // Treat empty/whitespace priority as the default; an empty string ("") would
        // otherwise slip past validation and throw in Enum.Parse.
        var priorityText = string.IsNullOrWhiteSpace(request.Priority) ? "medium" : request.Priority;
        var priority = Enum.Parse<TicketPriority>(priorityText, true);
        var (slaHours, slaDeadline) = SlaCalculator.Compute(category, priority);

        var ticket = new Ticket
        {
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
        // Assign the reference number and persist with retry, so concurrent
        // submissions that generate the same number don't 500 (unique violation).
        await _db.SaveWithUniqueReferenceAsync(async () =>
            ticket.ReferenceNumber = await _refGen.GenerateTicketReferenceAsync());

        _ = _email.SendTicketConfirmationAsync(
            ticket.ContactEmail, ticket.ContactName, ticket.ReferenceNumber, ticket.Title);

        return new { ticket.ReferenceNumber, ticket.Title, ticket.Status, ticket.SlaDeadlineAt };
    }

    public async Task<object?> GetByRefAsync(string refNumber, string? email, bool isStaff, string? agencyScope = null)
    {
        var ticket = await _db.Tickets
            .Include(t => t.Messages.OrderBy(m => m.SentAt))
            .FirstOrDefaultAsync(t => t.ReferenceNumber == refNumber);

        if (ticket is null) return null;

        if (!isStaff)
        {
            if (string.IsNullOrEmpty(email) || email.ToLowerInvariant().Trim() != ticket.ContactEmail)
                return null;
        }
        else if (!string.IsNullOrEmpty(agencyScope) && ticket.AssignedAgencyCode != agencyScope)
        {
            // Staff member scoped to another agency — treat as not found.
            return null;
        }

        var messages = ticket.Messages
            .Where(m => isStaff || !m.IsInternal)
            .Select(m => new { m.Content, m.AuthorName, m.AuthorRole, m.AuthorEmail, m.IsInternal, m.SentAt })
            .ToList();

        return new
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
        };
    }

    public async Task<object?> UpdateAsync(string refNumber, UpdateTicketRequest request, string? agencyScope = null)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.ReferenceNumber == refNumber);
        if (ticket is null) return null;

        // Agency officers may only modify tickets assigned to their agency.
        if (!string.IsNullOrEmpty(agencyScope) && ticket.AssignedAgencyCode != agencyScope)
            return null;

        if (request.Status is not null)
        {
            // TryParse → 400 (via the FluentValidation middleware) instead of a
            // 500 when a client sends an unknown status string.
            if (!Enum.TryParse<TicketStatus>(ToPascalCase(request.Status), true, out var status))
                throw new FluentValidation.ValidationException(
                    [new FluentValidation.Results.ValidationFailure("status", $"Invalid status '{request.Status}'")]);
            ticket.Status = status;
            if (ticket.Status == TicketStatus.Resolved) ticket.ResolvedAt = DateTimeOffset.UtcNow;
            if (ticket.Status == TicketStatus.Closed) ticket.ClosedAt = DateTimeOffset.UtcNow;
        }

        if (request.Priority is not null)
        {
            if (!Enum.TryParse<TicketPriority>(request.Priority, true, out var priority))
                throw new FluentValidation.ValidationException(
                    [new FluentValidation.Results.ValidationFailure("priority", $"Invalid priority '{request.Priority}'")]);
            ticket.Priority = priority;
        }
        if (request.Assignee is not null) ticket.Assignee = request.Assignee;
        if (request.AssignedAgencyCode is not null) ticket.AssignedAgencyCode = request.AssignedAgencyCode;
        if (request.SatisfactionRating is not null) ticket.SatisfactionRating = request.SatisfactionRating;
        if (request.SatisfactionComment is not null) ticket.SatisfactionComment = request.SatisfactionComment;

        var newlyEscalated = request.IsEscalated == true && MarkEscalated(ticket);

        await _db.SaveChangesAsync();

        // Notifications only after the change is committed, so we never email about
        // an escalation/status that failed to persist.
        if (newlyEscalated)
            await SendEscalationEmailAsync(ticket);

        if (request.Status is not null)
            _ = _email.SendTicketStatusUpdateAsync(
                ticket.ContactEmail, ticket.ContactName, ticket.ReferenceNumber, request.Status);

        return new { ticket.ReferenceNumber, ticket.Status };
    }

    public async Task<object?> GetMessagesAsync(string refNumber, string? email, bool isStaff, string? agencyScope = null)
    {
        var ticket = await _db.Tickets
            .Include(t => t.Messages.OrderBy(m => m.SentAt))
            .FirstOrDefaultAsync(t => t.ReferenceNumber == refNumber);

        if (ticket is null) return null;

        if (!isStaff)
        {
            if (string.IsNullOrEmpty(email) || email.ToLowerInvariant().Trim() != ticket.ContactEmail)
                return null;
        }
        else if (!string.IsNullOrEmpty(agencyScope) && ticket.AssignedAgencyCode != agencyScope)
        {
            return null;
        }

        return ticket.Messages
            .Where(m => isStaff || !m.IsInternal)
            .Select(m => new { m.Content, m.AuthorName, m.AuthorRole, m.AuthorEmail, m.IsInternal, m.SentAt })
            .ToList();
    }

    public async Task<object?> PostStaffMessageAsync(string refNumber, string content, string authorName, string? authorEmail, bool isInternal, string? agencyScope = null)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.ReferenceNumber == refNumber);
        if (ticket is null) return null;
        if (!string.IsNullOrEmpty(agencyScope) && ticket.AssignedAgencyCode != agencyScope)
            return null; // out of the officer's agency scope

        var message = new TicketMessage
        {
            TicketId = ticket.Id,
            Content = SanitizeHelper.StripHtml(content),
            AuthorName = SanitizeHelper.StripHtml(authorName),
            AuthorRole = AuthorRole.Officer, // trusted from the session, never the client
            AuthorEmail = authorEmail,
            IsInternal = isInternal,
        };

        _db.TicketMessages.Add(message);
        await _db.SaveChangesAsync();

        return new { message.Content, message.AuthorName, message.AuthorRole, message.IsInternal, message.SentAt };
    }

    public async Task<object?> PostPublicCommentAsync(string refNumber, string content, string authorName, string email)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.ReferenceNumber == refNumber);
        if (ticket is null) return null;

        // Ownership check: only the person who filed the ticket may comment on it.
        if (string.IsNullOrWhiteSpace(email) || email.ToLowerInvariant().Trim() != ticket.ContactEmail)
            return null;

        var message = new TicketMessage
        {
            TicketId = ticket.Id,
            Content = SanitizeHelper.StripHtml(content),
            AuthorName = SanitizeHelper.StripHtml(authorName),
            AuthorRole = AuthorRole.Investor, // public callers are always investors
            AuthorEmail = ticket.ContactEmail,
            IsInternal = false, // public callers can never post internal notes
        };

        _db.TicketMessages.Add(message);
        await _db.SaveChangesAsync();

        return new { message.Content, message.AuthorName, message.AuthorRole, message.SentAt };
    }

    public async Task<object?> PublicUpdateAsync(string refNumber, PublicTicketUpdateRequest request)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.ReferenceNumber == refNumber);
        if (ticket is null) return null;

        // Ownership check by email — the only authorization the public side has.
        if (string.IsNullOrWhiteSpace(request.Email) || request.Email.ToLowerInvariant().Trim() != ticket.ContactEmail)
            return null;

        var newlyEscalated = request.IsEscalated == true && MarkEscalated(ticket);

        if (request.SatisfactionRating.HasValue)
        {
            // Ratings only make sense once the case is resolved/closed.
            if (ticket.Status is not (TicketStatus.Resolved or TicketStatus.Closed))
                return null;
            if (request.SatisfactionRating < 1 || request.SatisfactionRating > 5)
                return null;
            ticket.SatisfactionRating = request.SatisfactionRating;
            if (request.SatisfactionComment is not null)
                ticket.SatisfactionComment = SanitizeHelper.StripHtml(request.SatisfactionComment);
        }

        await _db.SaveChangesAsync();

        // Notify only after the escalation is committed.
        if (newlyEscalated)
            await SendEscalationEmailAsync(ticket);

        return new { ticket.ReferenceNumber, ticket.IsEscalated, ticket.SatisfactionRating };
    }

    /// <summary>Mark a ticket escalated (idempotent). Returns true if this call was
    /// the one that escalated it (so the caller can notify after committing).</summary>
    private static bool MarkEscalated(Ticket ticket)
    {
        if (ticket.IsEscalated) return false;
        ticket.IsEscalated = true;
        ticket.EscalatedAt = DateTimeOffset.UtcNow;
        return true;
    }

    /// <summary>Fire the escalation notification email (best-effort). Call only after
    /// the escalation has been persisted.</summary>
    private async Task SendEscalationEmailAsync(Ticket ticket)
    {
        var escalationEmails = await _settings.GetEscalationEmailsAsync();
        var customMessage = await _settings.GetAsync(SettingsService.EscalationMessageKey);

        _ = _email.SendEscalationNotificationAsync(
            ticket.ReferenceNumber, ticket.Title, ticket.ContactName,
            escalationEmails.Length > 0 ? escalationEmails : null,
            string.IsNullOrEmpty(customMessage) ? null : customMessage);
    }

    private static string ToPascalCase(string snakeCase) =>
        string.Join("", snakeCase.Split('_').Select(s => s.Length > 0 ? char.ToUpper(s[0]) + s[1..] : s));
}
