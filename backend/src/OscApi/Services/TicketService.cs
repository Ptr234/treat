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

        // Three spans from filing, so triage delay (time to assign) can be told
        // apart from agency handling (first response, resolution).
        var spans = await scoped
            .Where(t => t.ResolvedAt != null || t.AssignedAt != null || t.FirstResponseAt != null)
            .Select(t => new { t.CreatedAt, t.ResolvedAt, t.AssignedAt, t.FirstResponseAt })
            .ToListAsync();
        var avgResolutionHours = AverageHours(spans.Where(x => x.ResolvedAt != null).Select(x => x.ResolvedAt!.Value - x.CreatedAt));
        var avgTimeToAssignHours = AverageHours(spans.Where(x => x.AssignedAt != null).Select(x => x.AssignedAt!.Value - x.CreatedAt));
        var avgFirstResponseHours = AverageHours(spans.Where(x => x.FirstResponseAt != null).Select(x => x.FirstResponseAt!.Value - x.CreatedAt));

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
            avgTimeToAssignHours,
            avgFirstResponseHours,
        };
    }

    private static double? AverageHours(IEnumerable<TimeSpan> values)
    {
        var list = values.ToList();
        return list.Count > 0 ? Math.Round(list.Average(v => v.TotalHours), 1) : null;
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
        AddEvent(ticket, TicketEventType.Created, null, ticket.AssignedAgencyCode,
            isStaff ? new StaffActor("Staff", null) : InvestorActor(ticket));
        var escalated = request.IsEscalated && await EscalateAsync(ticket, InvestorActor(ticket));

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
            // Staff-only (null, and so omitted from the JSON, for the filer).
            assigneeEmail = who.IsStaff && ticket.AssigneeUserId is { } uid
                ? await _db.AdminUsers.Where(u => u.Id == uid).Select(u => u.Email).FirstOrDefaultAsync()
                : null,
            slaBreachedAt = who.IsStaff ? ticket.SlaBreachedAt : null,
            assignedAt = who.IsStaff ? ticket.AssignedAt : null,
            firstResponseAt = who.IsStaff ? ticket.FirstResponseAt : null,
            allowedStatuses = who.IsStaff ? Transitions[ticket.Status] : null,
            routableAgencyCodes = who.IsStaff ? RoutableAgencies(who.AgencyScope) : null,
            history = who.IsStaff
                ? await _db.TicketEvents.AsNoTracking()
                    .Where(e => e.TicketId == ticket.Id)
                    .OrderBy(e => e.OccurredAt)
                    .Select(e => new { e.Id, e.Type, e.FromValue, e.ToValue, e.ActorName, e.OccurredAt })
                    .ToListAsync()
                : null,
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

    public async Task<object?> UpdateAsync(string refNumber, UpdateTicketRequest request, string? agencyScope = null, StaffActor? actor = null)
    {
        actor ??= StaffActor.System;
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.ReferenceNumber == refNumber);
        if (ticket is null) return null;

        // Agency officers may only modify tickets assigned to their agency.
        if (!string.IsNullOrEmpty(agencyScope) && ticket.AssignedAgencyCode != agencyScope)
            return null;

        var now = DateTimeOffset.UtcNow;
        var originalStatus = ticket.Status;
        TicketStatus? requestedStatus = null;
        if (request.Status is not null)
        {
            if (!TryParseStatus(request.Status, out var parsed))
                throw Invalid("status", $"Invalid status '{request.Status}'");
            if (parsed != originalStatus)
            {
                if (!Transitions[originalStatus].Contains(parsed))
                    throw Invalid("status", $"A ticket can't move from {StatusLabel(originalStatus)} to {StatusLabel(parsed)}");
                requestedStatus = parsed;
            }
        }

        // A resolution is explained to the filer: resolving (or closing a ticket
        // that was never resolved) needs a note, which is posted to the thread.
        var needsNote = requestedStatus == TicketStatus.Resolved
            || (requestedStatus == TicketStatus.Closed && originalStatus != TicketStatus.Resolved);
        var note = string.IsNullOrWhiteSpace(request.ResolutionNote) ? null : SanitizeHelper.StripHtml(request.ResolutionNote.Trim());
        if (needsNote && string.IsNullOrWhiteSpace(note))
            throw Invalid("resolutionNote", "Add a resolution note explaining the outcome to the investor");
        if (!needsNote && note is not null)
            throw Invalid("resolutionNote", "A resolution note is only taken when resolving or closing a ticket");

        // ── Routing between agencies ──
        string? routedTo = null;
        var unassigned = false; // the officer was removed by this update
        if (request.AssignedAgencyCode is not null)
        {
            var target = AgencyDirectory.Normalize(request.AssignedAgencyCode);
            if (target != ticket.AssignedAgencyCode)
            {
                if (IsFinished(requestedStatus ?? originalStatus))
                    throw Invalid("assignedAgencyCode", "Reopen the ticket before transferring it to another agency");
                if (!RoutableAgencies(agencyScope).Contains(target))
                    throw Invalid("assignedAgencyCode",
                        $"Only the {_defaultAgencyCode} front desk routes tickets between agencies. If this case isn't yours, send it back to {_defaultAgencyCode}.");

                AddEvent(ticket, TicketEventType.AgencyChanged, ticket.AssignedAgencyCode, target, actor);
                ticket.AssignedAgencyCode = target;
                routedTo = target;

                // The receiving agency picks its own officer, unless one is named now.
                if (request.Assignee is null && ticket.Assignee is not null)
                {
                    SetAssignee(ticket, null, actor);
                    unassigned = true;
                }
            }
        }

        // ── Officer assignment ──
        AdminUser? newAssignee = null;
        if (request.Assignee is not null)
        {
            if (string.IsNullOrWhiteSpace(request.Assignee))
            {
                if (ticket.Assignee is not null)
                {
                    SetAssignee(ticket, null, actor);
                    unassigned = true;
                }
            }
            else
            {
                var account = await FindAssignableAsync(request.Assignee, ticket.AssignedAgencyCode)
                    ?? throw Invalid("assignee",
                        $"'{request.Assignee}' isn't an active staff account that can handle {ticket.AssignedAgencyCode} tickets");
                if (account.Id != ticket.AssigneeUserId)
                {
                    SetAssignee(ticket, account, actor);
                    newAssignee = account;
                    unassigned = false;
                }
            }
        }

        // ── Status ──
        var statusChanged = false;
        if (requestedStatus is { } next)
        {
            if (next == TicketStatus.Assigned && ticket.AssigneeUserId is null)
                throw Invalid("status", "Choose an officer before marking the ticket Assigned");
            SetStatus(ticket, next, now, actor);
            statusChanged = true;
        }
        else if (ticket.AssigneeUserId is not null && ticket.Status == TicketStatus.New)
        {
            // Naming an officer on a fresh ticket moves it out of the "New" queue.
            SetStatus(ticket, TicketStatus.Assigned, now, actor);
            statusChanged = true;
        }
        else if (unassigned
                 && (ticket.Status == TicketStatus.Assigned || (routedTo is not null && ticket.Status == TicketStatus.InProgress)))
        {
            // Unassigned, or handed to another agency's queue: back to triage.
            SetStatus(ticket, TicketStatus.New, now, actor);
            statusChanged = true;
        }

        if (note is not null)
        {
            _db.TicketMessages.Add(new TicketMessage
            {
                TicketId = ticket.Id,
                Content = note,
                AuthorName = SanitizeHelper.StripHtml(actor.Name),
                AuthorRole = AuthorRole.Officer,
                AuthorEmail = actor.Email,
                IsInternal = false,
            });
            ticket.FirstResponseAt ??= now;
        }

        // ── Priority (and with it the SLA) ──
        if (request.Priority is not null)
        {
            if (!Enum.TryParse<TicketPriority>(request.Priority, true, out var priority))
                throw Invalid("priority", $"Invalid priority '{request.Priority}'");
            if (priority != ticket.Priority)
            {
                AddEvent(ticket, TicketEventType.PriorityChanged, ticket.Priority.ToString(), priority.ToString(), actor);
                ticket.Priority = priority;
                // The SLA is a function of priority: re-derive it from when the
                // ticket was filed. (If the tighter deadline has already passed,
                // the ticket is correctly reported as breached.)
                (ticket.SlaDeadlineHours, ticket.SlaDeadlineAt) =
                    SlaCalculator.Compute(ticket.Category, priority, ticket.CreatedAt);
                // A relaxed deadline that's back in the future re-arms the SLA monitor.
                if (ticket.SlaDeadlineAt > now) ticket.SlaBreachedAt = null;
            }
        }

        var newlyEscalated = request.IsEscalated == true && await EscalateAsync(ticket, actor);

        await _db.SaveChangesAsync();

        // Notifications only after the change is committed, so we never email about
        // an escalation/status/transfer that failed to persist.
        if (newlyEscalated)
            await SendEscalationEmailAsync(ticket);

        if (statusChanged)
            await _email.SendTicketStatusUpdateAsync(
                ticket.ContactEmail, ticket.ContactName, ticket.ReferenceNumber, StatusLabel(ticket.Status), ticket.AccessToken);

        if (routedTo is not null)
            await NotifyAgencyAsync(ticket, routedTo, actor,
                $"Ticket {ticket.ReferenceNumber} was transferred to {AgencyDirectory.NameFor(routedTo)} by {actor.Name}. Please assign an officer.");

        if (newAssignee is not null && !string.Equals(newAssignee.Email, actor.Email, StringComparison.OrdinalIgnoreCase))
            await _email.SendTicketAssignmentNotificationAsync(newAssignee.Email, newAssignee.Name, ticket.ReferenceNumber, ticket.Title,
                $"{actor.Name} assigned ticket {ticket.ReferenceNumber} to you.");

        return new
        {
            ticket.ReferenceNumber, ticket.Status, ticket.Priority, ticket.Assignee, ticket.AssignedAgencyCode,
            ticket.SlaDeadlineHours, ticket.SlaDeadlineAt, ticket.IsEscalated, ticket.ResolvedAt, ticket.ClosedAt,
        };
    }

    /// <summary>
    /// Which statuses a ticket may move to from each status. Staff never move a
    /// ticket back to New by hand (that happens only when it loses its officer),
    /// work moves forward, and finished tickets can only be closed or reopened.
    /// </summary>
    public static readonly IReadOnlyDictionary<TicketStatus, TicketStatus[]> Transitions = new Dictionary<TicketStatus, TicketStatus[]>
    {
        [TicketStatus.New] = [TicketStatus.Assigned, TicketStatus.InProgress, TicketStatus.PendingExternal, TicketStatus.Resolved, TicketStatus.Closed],
        [TicketStatus.Assigned] = [TicketStatus.InProgress, TicketStatus.PendingExternal, TicketStatus.Resolved, TicketStatus.Closed],
        [TicketStatus.InProgress] = [TicketStatus.PendingExternal, TicketStatus.Resolved, TicketStatus.Closed],
        [TicketStatus.PendingExternal] = [TicketStatus.InProgress, TicketStatus.Resolved, TicketStatus.Closed],
        [TicketStatus.Resolved] = [TicketStatus.Closed, TicketStatus.InProgress],
        [TicketStatus.Closed] = [TicketStatus.InProgress],
    };

    private static bool IsFinished(TicketStatus status) => status is TicketStatus.Resolved or TicketStatus.Closed;

    /// <summary>
    /// Agencies a staff member may route a ticket to. Admin-level staff and the
    /// front desk (the default agency, which triages every new ticket) route
    /// anywhere; any other agency can only hand a misrouted case back to the
    /// front desk — never push it sideways to an agency of its choosing.
    /// </summary>
    private string[] RoutableAgencies(string? agencyScope) =>
        string.IsNullOrEmpty(agencyScope) || agencyScope == _defaultAgencyCode
            ? AgencyDirectory.All.Select(a => a.Code).ToArray()
            : [_defaultAgencyCode];

    private void SetStatus(Ticket ticket, TicketStatus status, DateTimeOffset now, StaffActor actor)
    {
        AddEvent(ticket, TicketEventType.StatusChanged, ticket.Status.ToString(), status.ToString(), actor);
        ApplyStatus(ticket, status, now);
    }

    private void SetAssignee(Ticket ticket, AdminUser? account, StaffActor actor)
    {
        AddEvent(ticket, TicketEventType.AssigneeChanged, ticket.Assignee, account?.Name, actor);
        ticket.AssigneeUserId = account?.Id;
        ticket.Assignee = account?.Name;
        if (account is not null) ticket.AssignedAt ??= DateTimeOffset.UtcNow;
    }

    private void AddEvent(Ticket ticket, TicketEventType type, string? from, string? to, StaffActor actor) =>
        _db.TicketEvents.Add(new TicketEvent
        {
            TicketId = ticket.Id,
            Type = type,
            FromValue = Clip(from),
            ToValue = Clip(to),
            ActorName = Clip(actor.Name) ?? "System",
            ActorEmail = actor.Email,
        });

    private static string? Clip(string? s) => s is null || s.Length <= 100 ? s : s[..100];

    private static StaffActor InvestorActor(Ticket ticket) => new($"{ticket.ContactName} (investor)", ticket.ContactEmail);

    /// <summary>The active staff account named by <paramref name="email"/>, if it may own a ticket in <paramref name="agencyCode"/>.</summary>
    private async Task<AdminUser?> FindAssignableAsync(string email, string? agencyCode)
    {
        var normalized = email.Trim().ToLowerInvariant();
        return await AssignableQuery(agencyCode).FirstOrDefaultAsync(u => u.Email == normalized);
    }

    /// <summary>Active admin-level staff, plus active officers of <paramref name="agencyCode"/>.</summary>
    private IQueryable<AdminUser> AssignableQuery(string? agencyCode) =>
        _db.AdminUsers.Where(u => u.IsActive
            && (Roles.AdminLevel.Contains(u.Role) || (u.Role == Roles.AgencyOfficer && u.AgencyCode == agencyCode)));

    public async Task<IReadOnlyList<object>> ListAssignableOfficersAsync(string agencyCode) =>
        await AssignableQuery(agencyCode)
            .OrderBy(u => u.Role == Roles.AgencyOfficer ? 0 : 1) // the agency's own officers first
            .ThenBy(u => u.Name)
            .Select(u => (object)new { u.Email, u.Name, u.AgencyCode })
            .ToListAsync();

    /// <summary>Email every active officer of <paramref name="agencyCode"/>, except whoever made the change.</summary>
    private async Task NotifyAgencyAsync(Ticket ticket, string agencyCode, StaffActor actor, string reason)
    {
        var officers = await _db.AdminUsers.AsNoTracking()
            .Where(u => u.IsActive && u.Role == Roles.AgencyOfficer && u.AgencyCode == agencyCode)
            .Select(u => new { u.Email, u.Name })
            .ToListAsync();
        foreach (var officer in officers.Where(o => !string.Equals(o.Email, actor.Email, StringComparison.OrdinalIgnoreCase)))
            await _email.SendTicketAssignmentNotificationAsync(officer.Email, officer.Name, ticket.ReferenceNumber, ticket.Title, reason);
    }

    // ── SLA monitor ─────────────────────────────────────────────────────────

    public async Task<int> ProcessSlaBreachesAsync(CancellationToken ct = default)
    {
        var now = DateTimeOffset.UtcNow;
        var overdue = await _db.Tickets
            .Where(t => t.SlaBreachedAt == null && t.SlaDeadlineAt != null && t.SlaDeadlineAt < now
                        && t.Status != TicketStatus.Resolved && t.Status != TicketStatus.Closed)
            .OrderBy(t => t.SlaDeadlineAt)
            .Take(100)
            .ToListAsync(ct);
        if (overdue.Count == 0) return 0;

        var monitor = StaffActor.System with { Name = "SLA monitor" };
        foreach (var ticket in overdue)
        {
            ticket.SlaBreachedAt = now;
            AddEvent(ticket, TicketEventType.SlaBreached, null, ticket.SlaDeadlineAt!.Value.ToString("u"), monitor);
            await EscalateAsync(ticket, monitor);
        }
        await _db.SaveChangesAsync(ct);

        // After commit: the escalation list, the owning agency's officers and the assignee.
        var escalationEmails = await _settings.GetEscalationEmailsAsync();
        foreach (var ticket in overdue)
        {
            var recipients = new List<string>(escalationEmails);
            recipients.AddRange(await _db.AdminUsers.AsNoTracking()
                .Where(u => u.IsActive && (u.Id == ticket.AssigneeUserId
                    || (u.Role == Roles.AgencyOfficer && u.AgencyCode == ticket.AssignedAgencyCode)))
                .Select(u => u.Email)
                .ToListAsync(ct));
            var owner = AgencyDirectory.NameFor(ticket.AssignedAgencyCode)
                + (ticket.Assignee is null ? " (no officer assigned)" : $" — {ticket.Assignee}");
            await _email.SendSlaBreachNotificationAsync(ticket.ReferenceNumber, ticket.Title, owner,
                ticket.SlaDeadlineAt!.Value, StatusLabel(ticket.Status), recipients.ToArray());
        }
        return overdue.Count;
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
        if (!isInternal) ticket.FirstResponseAt ??= message.SentAt;
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
            newlyEscalated = await EscalateAsync(ticket, InvestorActor(ticket));
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
    /// default officer if nobody owns it yet and that account may handle the
    /// ticket. Returns true if this call was the one that escalated it (so the
    /// caller can notify after committing).</summary>
    private async Task<bool> EscalateAsync(Ticket ticket, StaffActor actor)
    {
        if (ticket.IsEscalated) return false;
        ticket.IsEscalated = true;
        ticket.EscalatedAt = DateTimeOffset.UtcNow;
        AddEvent(ticket, TicketEventType.Escalated, null, null, actor);

        if (ticket.AssigneeUserId is null)
        {
            // The setting holds a staff email. Only a real, active account that can
            // see the ticket is assigned; anything else leaves the escalation with
            // the notification recipients rather than a name nobody answers to.
            var defaultAssignee = await _settings.GetAsync(SettingsService.EscalationDefaultAssigneeKey);
            var account = string.IsNullOrWhiteSpace(defaultAssignee)
                ? null
                : await FindAssignableAsync(defaultAssignee, ticket.AssignedAgencyCode);
            if (account is not null)
            {
                SetAssignee(ticket, account, actor);
                if (ticket.Status == TicketStatus.New) SetStatus(ticket, TicketStatus.Assigned, DateTimeOffset.UtcNow, actor);
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
