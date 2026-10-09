namespace OscApi.Dtos.Tickets;

/// <summary>
/// File a ticket. <c>Priority</c> is honoured only for staff callers; for the
/// public it is derived from the category (and raised to high when the ticket
/// is filed as an escalation), and the VIP category is staff-assigned only.
/// </summary>
public record CreateTicketRequest(
    string Title,
    string Description,
    string Category,
    string? Priority,
    string ContactEmail,
    string ContactName,
    string? ContactPhone,
    string? InvestorNationality,
    string? Sector,
    string? InvestmentSize,
    bool IsEscalated = false
);

/// <summary>Staff update. Satisfaction fields exist only so a staff attempt to
/// rate on the investor's behalf is rejected explicitly rather than ignored.</summary>
public record UpdateTicketRequest(
    string? Status,
    string? Priority,
    string? Assignee,
    string? AssignedAgencyCode,
    int? SatisfactionRating,
    string? SatisfactionComment,
    bool? IsEscalated
);

/// <summary>Public self-service update (escalate / rate), authorized by the tracking token
/// (or a signed-in session under the filing email).</summary>
public record PublicTicketUpdateRequest(
    string? Token,
    bool? IsEscalated,
    int? SatisfactionRating,
    string? SatisfactionComment
);

/// <summary>Staff reply. Author identity + role come from the session, not the body.</summary>
public record StaffMessageRequest(
    string Content,
    bool IsInternal = false
);

/// <summary>Public reply. The author is the ticket's filer, taken from the ticket.</summary>
public record PublicCommentRequest(
    string Content,
    string? Token
);

/// <summary>Ask for the tracking link to be (re-)sent to the filing email.</summary>
public record TicketAccessLinkRequest(string Email);

/// <summary>Staff ticket board query: server-side filtering, search, sort and paging.</summary>
public record TicketListQuery(
    int Page = 1,
    int PageSize = 25,
    string? Status = null,
    string? Priority = null,
    string? Q = null,
    string? Sort = null,
    bool? Escalated = null
);
