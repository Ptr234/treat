using FluentValidation;
using FluentValidation.Results;
using Microsoft.EntityFrameworkCore;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.Tickets;
using OscApi.Models;

namespace OscApi.Services;

public class TicketService : ITicketService
{
    private readonly OscDbContext _db;
    private readonly IEmailService _email;
    private readonly IReferenceNumberGenerator _refGen;
    private readonly ISettingsService _settings;
    private readonly string _defaultAgencyCode;

    public TicketService(OscDbContext db, IEmailService email, IReferenceNumberGenerator refGen, ISettingsService settings,
        IConfiguration? config = null)
    {
        _db = db;
        _email = email;
        _settings = settings;
        _refGen = refGen;
        // New tickets land with the OneStop Centre's front desk (UIA) for triage,
        // so agency officers see them immediately instead of only after an admin
        // happens to assign them. Officers reassign to the owning agency.
        _defaultAgencyCode = AgencyDirectory.Normalize(config?["Tickets:DefaultAgencyCode"] ?? "UIA");
    }

    // ── Staff board ─────────────────────────────────────────────────────────

    public async Task<object> ListAsync(TicketListQuery q, string? agencyScope = null)
    {
        var scoped = _db.Tickets.AsNoTracking();
        if (!string.IsNullOrEmpty(agencyScope))
            scoped = scoped.Where(t => t.AssignedAgencyCode == agencyScope);

        var query = scoped;
        if (q.Status is not null && TryParseStatus(q.Status, out var status))
            query = query.Where(t => t.Status == status);
        if (q.Priority is not null && Enum.TryParse<TicketPriority>(q.Priority, true, out var priority))
            query = query.Where(t => t.Priority == priority);
        if (q.Escalated is not null)
            query = query.Where(t => t.IsEscalated == q.Escalated);
        if (!string.IsNullOrWhiteSpace(q.Q))
        {
            var term = q.Q.Trim().ToLower();
            query = query.Where(t =>
                t.ReferenceNumber.ToLower().Contains(term) ||
                t.Title.ToLower().Contains(term) ||
                t.ContactName.ToLower().Contains(term) ||
                t.ContactEmail.Contains(term));
        }

        query = q.Sort switch
        {
            "oldest" => query.OrderBy(t => t.CreatedAt),
            "priority" => query.OrderByDescending(t => t.Priority).ThenBy(t => t.SlaDeadlineAt),
            // Most urgent first: open tickets by deadline, finished ones last.
            "sla" => query
                .OrderBy(t => t.Status == TicketStatus.Resolved || t.Status == TicketStatus.Closed)
                .ThenBy(t => t.SlaDeadlineAt == null)
                .ThenBy(t => t.SlaDeadlineAt),
            _ => query.OrderByDescending(t => t.CreatedAt),
        };

        var total = await query.CountAsync();
        var tickets = await query
            .Skip((q.Page - 1) * q.PageSize).Take(q.PageSize)
            .Select(t => new
            {
                t.ReferenceNumber, t.Title, t.Category, t.Priority, t.Status,
                t.ContactName, t.ContactEmail, t.AssignedAgencyCode, t.Assignee,
                t.IsEscalated, t.SlaDeadlineAt, t.CreatedAt, t.ResolvedAt,
                MessageCount = _db.TicketMessages.Count(m => m.TicketId == t.Id),
            })
            .ToListAsync();

        return new { tickets, total, page = q.Page, pageSize = q.PageSize, stats = await StatsAsync(scoped) };
    }

    /// <summary>Headline numbers over everything the caller can see (not just the current page or filter).</summary>
    private static async Task<object> StatsAsync(IQueryable<Ticket> scoped)
    {
        var now = DateTimeOffset.UtcNow;
        var counts = await scoped
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Total = g.Count(),
                Open = g.Count(t => t.Status != TicketStatus.Resolved && t.Status != TicketStatus.Closed),
                Escalated = g.Count(t => t.IsEscalated && t.Status != TicketStatus.Resolved && t.Status != TicketStatus.Closed),
                Breached = g.Count(t => t.Status != TicketStatus.Resolved && t.Status != TicketStatus.Closed
                                        && t.SlaDeadlineAt != null && t.SlaDeadlineAt < now),
            })
            .SingleOrDefaultAsync(); // one group (or none) by construction

        var resolvedSpans = await scoped
            .Where(t => t.ResolvedAt != null)
            .Select(t => new { t.CreatedAt, t.ResolvedAt })
            .ToListAsync();
        double? avgResolutionHours = resolvedSpans.Count > 0
            ? Math.Round(resolvedSpans.Average(x => (x.ResolvedAt!.Value - x.CreatedAt).TotalHours), 1)
            : null;

        var total = counts?.Total ?? 0;
        var open = counts?.Open ?? 0;
        return new
        {
            total,
            open,
            resolved = total - open,
            escalated = counts?.Escalated ?? 0,
            slaBreached = counts?.Breached ?? 0,
            avgResolutionHours,
        };
    }

    // ── Create ──────────────────────────────────────────────────────────────

    public async Task<object> CreateAsync(CreateTicketRequest request, bool isStaff)
    {
        var category = Enum.Parse<TicketCategory>(ToPascalCase(request.Category), true);

        // The public can't choose their own urgency: priority (and with it the
        // SLA clock agencies are measured on) follows the category, raised to
        // high for an escalation. VIP status is conferred by staff, not claimed.
        TicketPriority priority;
        if (isStaff)
        {
            priority = string.IsNullOrWhiteSpace(request.Priority)
                ? DefaultPriority(category)
                : Enum.Parse<TicketPriority>(request.Priority, true);
        }
        else
        {
            if (category == TicketCategory.Vip)
                throw Invalid("category", "The VIP category is assigned by OneStop Centre staff");
            priority = DefaultPriority(category);
            if (request.IsEscalated && priority < TicketPriority.High) priority = TicketPriority.High;
        }

        var (slaHours, slaDeadline) = SlaCalculator.Compute(category, priority);

        var ticket = new Ticket
        {
            Title = SanitizeHelper.StripHtml(request.Title),
            Description = SanitizeHelper.StripHtml(request.Description),
            Category = category,
            Priority = priority,
            ContactName = SanitizeHelper.StripHtml(request.ContactName),
            ContactEmail = request.ContactEmail.ToLowerInvariant().Trim(),
            ContactPhone = string.IsNullOrWhiteSpace(request.ContactPhone) ? null : request.ContactPhone.Trim(),
            InvestorNationality = request.InvestorNationality,
            Sector = request.Sector,
            InvestmentSize = request.InvestmentSize,
            SlaDeadlineHours = slaHours,
            SlaDeadlineAt = slaDeadline,
            AssignedAgencyCode = _defaultAgencyCode,
            AccessToken = TicketAccess.NewToken(),
        };

        // Filed as an escalation (the chatbot's "talk to an officer"): mark it the
        // same way a later escalation would, so it gets a timestamp, the default
        // assignee, and — after commit — the escalation notification.
        var escalated = request.IsEscalated && await EscalateAsync(ticket);

        _db.Tickets.Add(ticket);
        // Assign the reference number and persist with retry, so concurrent
        // submissions that generate the same number don't 500 (unique violation).
        await _db.SaveWithUniqueReferenceAsync(async () =>
            ticket.ReferenceNumber = await _refGen.GenerateTicketReferenceAsync());

        await _email.SendTicketConfirmationAsync(
            ticket.ContactEmail, ticket.ContactName, ticket.ReferenceNumber, ticket.Title, ticket.AccessToken);
        if (escalated)
            await SendEscalationEmailAsync(ticket);

        // The access token goes back to the filer only, so the page they're on
        // can open the ticket (and upload attachments) without waiting for email.
        return new { ticket.ReferenceNumber, ticket.Title, ticket.Status, ticket.Priority, ticket.SlaDeadlineAt, ticket.AccessToken };
    }

    // ── Read ────────────────────────────────────────────────────────────────

    public async Task<object?> GetAsync(string refNumber, TicketRequester who)
    {
        var ticket = await _db.Tickets
            .AsNoTracking()
            .Include(t => t.Messages.OrderBy(m => m.SentAt))
            .FirstOrDefaultAsync(t => t.ReferenceNumber == refNumber);

        if (ticket is null || !TicketAccess.CanView(ticket, who)) return null;

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
            messages = VisibleMessages(ticket, who.IsStaff),
        };
    }

    public async Task<object?> GetMessagesAsync(string refNumber, TicketRequester who)
    {
        var ticket = await _db.Tickets
            .AsNoTracking()
            .Include(t => t.Messages.OrderBy(m => m.SentAt))
            .FirstOrDefaultAsync(t => t.ReferenceNumber == refNumber);

        if (ticket is null || !TicketAccess.CanView(ticket, who)) return null;
        return VisibleMessages(ticket, who.IsStaff);
    }

    private static IEnumerable<object> VisibleMessages(Ticket ticket, bool isStaff) =>
        ticket.Messages
            .Where(m => isStaff || !m.IsInternal)
            .Select(m => new { m.Id, m.Content, m.AuthorName, m.AuthorRole, m.AuthorEmail, m.IsInternal, m.SentAt })
            .ToList();

    // ── Staff update ────────────────────────────────────────────────────────

    public async Task<object?> UpdateAsync(string refNumber, UpdateTicketRequest request, string? agencyScope = null)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.ReferenceNumber == refNumber);
        if (ticket is null) return null;

        // Agency officers may only modify tickets assigned to their agency.
        if (!string.IsNullOrEmpty(agencyScope) && ticket.AssignedAgencyCode != agencyScope)
            return null;

        var now = DateTimeOffset.UtcNow;
        var statusChanged = false;

        if (request.Status is not null)
        {
            if (!TryParseStatus(request.Status, out var status))
                throw Invalid("status", $"Invalid status '{request.Status}'");
            if (status != ticket.Status)
            {
                ApplyStatus(ticket, status, now);
                statusChanged = true;
            }
        }

        if (request.Priority is not null)
        {
            if (!Enum.TryParse<TicketPriority>(request.Priority, true, out var priority))
                throw Invalid("priority", $"Invalid priority '{request.Priority}'");
            if (priority != ticket.Priority)
            {
                ticket.Priority = priority;
                // The SLA is a function of priority: re-derive it from when the
                // ticket was filed. (If the tighter deadline has already passed,
                // the ticket is correctly reported as breached.)
                (ticket.SlaDeadlineHours, ticket.SlaDeadlineAt) =
                    SlaCalculator.Compute(ticket.Category, priority, ticket.CreatedAt);
            }
        }

        if (request.Assignee is not null)
        {
            ticket.Assignee = string.IsNullOrWhiteSpace(request.Assignee)
                ? null
                : SanitizeHelper.StripHtml(request.Assignee.Trim());
            // Naming an officer on a fresh ticket moves it out of the "New" queue.
            if (ticket.Assignee is not null && ticket.Status == TicketStatus.New && !statusChanged)
            {
                ApplyStatus(ticket, TicketStatus.Assigned, now);
                statusChanged = true;
            }
        }

        // Stored upper-case — the form agency_officer accounts carry — so a ticket
        // assigned as "uia" is still visible to UIA officers.
        if (request.AssignedAgencyCode is not null)
            ticket.AssignedAgencyCode = AgencyDirectory.Normalize(request.AssignedAgencyCode);

        var newlyEscalated = request.IsEscalated == true && await EscalateAsync(ticket);

        await _db.SaveChangesAsync();

        // Notifications only after the change is committed, so we never email about
        // an escalation/status that failed to persist.
        if (newlyEscalated)
            await SendEscalationEmailAsync(ticket);

        if (statusChanged)
            await _email.SendTicketStatusUpdateAsync(
                ticket.ContactEmail, ticket.ContactName, ticket.ReferenceNumber, StatusLabel(ticket.Status), ticket.AccessToken);

        return new
        {
            ticket.ReferenceNumber, ticket.Status, ticket.Priority, ticket.Assignee, ticket.AssignedAgencyCode,
            ticket.SlaDeadlineHours, ticket.SlaDeadlineAt, ticket.IsEscalated, ticket.ResolvedAt, ticket.ClosedAt,
        };
    }

    /// <summary>
    /// Move to a new status, keeping the resolution timestamps consistent:
    /// reopening clears them; Resolved → Closed keeps the original ResolvedAt
    /// (backfilling it if the ticket was closed directly). Only called on an
    /// actual change, so re-sending the same status can't reset ResolvedAt.
    /// </summary>
    private static void ApplyStatus(Ticket ticket, TicketStatus status, DateTimeOffset now)
    {
        ticket.Status = status;
        switch (status)
        {
            case TicketStatus.Resolved:
                ticket.ResolvedAt = now;
                ticket.ClosedAt = null;
                break;
            case TicketStatus.Closed:
                ticket.ClosedAt = now;
                ticket.ResolvedAt ??= now;
                break;
            default:
                ticket.ResolvedAt = null;
                ticket.ClosedAt = null;
                break;
        }
    }

    // ── Messages ────────────────────────────────────────────────────────────

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

        // A public reply is only useful if the investor learns of it.
        if (!isInternal)
            await _email.SendTicketReplyAsync(
                ticket.ContactEmail, ticket.ContactName, ticket.ReferenceNumber, ticket.Title, message.Content, ticket.AccessToken);

        return new { message.Id, message.Content, message.AuthorName, message.AuthorRole, message.IsInternal, message.SentAt };
    }

    public async Task<object?> PostPublicCommentAsync(string refNumber, string content, TicketRequester who)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.ReferenceNumber == refNumber);
        if (ticket is null || !TicketAccess.IsOwner(ticket, who)) return null;

        if (ticket.Status == TicketStatus.Closed)
            throw Invalid("content", "This ticket is closed. Please file a new ticket if you still need help.");

        var message = new TicketMessage
        {
            TicketId = ticket.Id,
            Content = SanitizeHelper.StripHtml(content),
            AuthorName = ticket.ContactName, // the filer, never a client-supplied name
            AuthorRole = AuthorRole.Investor,
            AuthorEmail = ticket.ContactEmail,
            IsInternal = false, // public callers can never post internal notes
        };

        _db.TicketMessages.Add(message);
        await _db.SaveChangesAsync();

        await _email.SendTicketCommentNotificationAsync(
            ticket.ReferenceNumber, ticket.Title, ticket.ContactName, message.Content);

        return new { message.Id, message.Content, message.AuthorName, message.AuthorRole, message.SentAt };
    }

    // ── Public self-service ─────────────────────────────────────────────────

    public async Task<object?> PublicUpdateAsync(string refNumber, PublicTicketUpdateRequest request, TicketRequester who)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.ReferenceNumber == refNumber);
        if (ticket is null || !TicketAccess.IsOwner(ticket, who)) return null;

        var finished = ticket.Status is TicketStatus.Resolved or TicketStatus.Closed;

        if (request.SatisfactionRating.HasValue)
        {
            // Ratings only make sense once the case is resolved/closed.
            if (!finished)
                throw Invalid("satisfactionRating", "A ticket can be rated once it has been resolved");
            ticket.SatisfactionRating = request.SatisfactionRating;
            if (request.SatisfactionComment is not null)
                ticket.SatisfactionComment = SanitizeHelper.StripHtml(request.SatisfactionComment);
        }

        var newlyEscalated = false;
        if (request.IsEscalated == true)
        {
            if (finished)
                throw Invalid("isEscalated", "A resolved ticket can't be escalated. Please reply or file a new ticket.");
            newlyEscalated = await EscalateAsync(ticket);
        }

        await _db.SaveChangesAsync();

        // Notify only after the escalation is committed.
        if (newlyEscalated)
            await SendEscalationEmailAsync(ticket);

        return new { ticket.ReferenceNumber, ticket.IsEscalated, ticket.SatisfactionRating };
    }

    public async Task RequestAccessLinkAsync(string refNumber, string email)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var ticket = await _db.Tickets.AsNoTracking().FirstOrDefaultAsync(t => t.ReferenceNumber == refNumber);

        // The link only ever goes to the address on file, and the caller gets the
        // same answer either way — so this can't be used to probe for tickets.
        if (ticket is not null && ticket.ContactEmail == normalized)
            // Not awaited on purpose: the caller gets the same answer at the same
            // speed whether or not the reference/email matched (no enumeration).
            // The send is still durable: it lands in the outbox within milliseconds.
            _ = _email.SendTicketAccessLinkAsync(
                ticket.ContactEmail, ticket.ContactName, ticket.ReferenceNumber, ticket.Title, ticket.AccessToken);
    }

    // ── Escalation ──────────────────────────────────────────────────────────

    /// <summary>Mark a ticket escalated (idempotent), assigning the configured
    /// default officer if nobody owns it yet. Returns true if this call was the
    /// one that escalated it (so the caller can notify after committing).</summary>
    private async Task<bool> EscalateAsync(Ticket ticket)
    {
        if (ticket.IsEscalated) return false;
        ticket.IsEscalated = true;
        ticket.EscalatedAt = DateTimeOffset.UtcNow;

        if (string.IsNullOrWhiteSpace(ticket.Assignee))
        {
            var defaultAssignee = await _settings.GetAsync(SettingsService.EscalationDefaultAssigneeKey);
            if (!string.IsNullOrWhiteSpace(defaultAssignee))
            {
                ticket.Assignee = defaultAssignee.Trim();
                if (ticket.Status == TicketStatus.New) ticket.Status = TicketStatus.Assigned;
            }
        }
        return true;
    }

    /// <summary>Fire the escalation notification email (best-effort). Call only after
    /// the escalation has been persisted.</summary>
    private async Task SendEscalationEmailAsync(Ticket ticket)
    {
        var escalationEmails = await _settings.GetEscalationEmailsAsync();
        var customMessage = await _settings.GetAsync(SettingsService.EscalationMessageKey);

        await _email.SendEscalationNotificationAsync(
            ticket.ReferenceNumber, ticket.Title, ticket.ContactName,
            escalationEmails.Length > 0 ? escalationEmails : null,
            string.IsNullOrEmpty(customMessage) ? null : customMessage);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    /// <summary>The urgency each category implies when the public files it.</summary>
    public static TicketPriority DefaultPriority(TicketCategory category) => category switch
    {
        TicketCategory.GeneralInquiry => TicketPriority.Low,
        TicketCategory.ProcedureQuery or TicketCategory.ApplicationSupport => TicketPriority.Medium,
        TicketCategory.LicenseDelay or TicketCategory.Complaint => TicketPriority.High,
        TicketCategory.Vip => TicketPriority.Critical,
        _ => TicketPriority.Medium,
    };

    /// <summary>"PendingExternal" → "Pending External", for investor-facing text.</summary>
    public static string StatusLabel(TicketStatus status) =>
        string.Concat(status.ToString().Select((c, i) => i > 0 && char.IsUpper(c) ? $" {c}" : c.ToString()));

    private static bool TryParseStatus(string raw, out TicketStatus status) =>
        Enum.TryParse(raw.Replace("_", "").Replace("-", ""), true, out status);

    private static ValidationException Invalid(string field, string message) =>
        new([new ValidationFailure(field, message)]);

    private static string ToPascalCase(string snakeCase) =>
        string.Join("", snakeCase.Split('_').Select(s => s.Length > 0 ? char.ToUpper(s[0]) + s[1..] : s));
}
