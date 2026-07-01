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
        var tickets = await query
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

        return new { tickets, total };
    }

    public async Task<object> CreateAsync(CreateTicketRequest request)
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
            ticket.Status = Enum.Parse<TicketStatus>(ToPascalCase(request.Status), true);
            if (ticket.Status == TicketStatus.Resolved) ticket.ResolvedAt = DateTimeOffset.UtcNow;
            if (ticket.Status == TicketStatus.Closed) ticket.ClosedAt = DateTimeOffset.UtcNow;
        }

        if (request.Priority is not null) ticket.Priority = Enum.Parse<TicketPriority>(request.Priority, true);
        if (request.Assignee is not null) ticket.Assignee = request.Assignee;
        if (request.AssignedAgencyCode is not null) ticket.AssignedAgencyCode = request.AssignedAgencyCode;
        if (request.SatisfactionRating is not null) ticket.SatisfactionRating = request.SatisfactionRating;
        if (request.SatisfactionComment is not null) ticket.SatisfactionComment = request.SatisfactionComment;

        if (request.IsEscalated == true && !ticket.IsEscalated)
        {
            ticket.IsEscalated = true;
            ticket.EscalatedAt = DateTimeOffset.UtcNow;

            var escalationEmails = await _settings.GetEscalationEmailsAsync();
            var customMessage = await _settings.GetAsync(SettingsService.EscalationMessageKey);

            _ = _email.SendEscalationNotificationAsync(
                ticket.ReferenceNumber, ticket.Title, ticket.ContactName,
                escalationEmails.Length > 0 ? escalationEmails : null,
                string.IsNullOrEmpty(customMessage) ? null : customMessage);
        }

        await _db.SaveChangesAsync();

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

    public async Task<object?> PostMessageAsync(string refNumber, TicketMessageRequest request)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.ReferenceNumber == refNumber);
        if (ticket is null) return null;

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

        return new { message.Content, message.AuthorName, message.AuthorRole, message.SentAt };
    }

    private static string ToPascalCase(string snakeCase) =>
        string.Join("", snakeCase.Split('_').Select(s => s.Length > 0 ? char.ToUpper(s[0]) + s[1..] : s));
}
