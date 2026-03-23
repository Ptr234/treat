namespace OscApi.Dtos.Tickets;

public record CreateTicketRequest(
    string Title,
    string Description,
    string Category,
    string Priority,
    string ContactEmail,
    string ContactName,
    string? ContactPhone,
    string? InvestorNationality,
    string? Sector,
    string? InvestmentSize,
    bool IsEscalated = false
);

public record UpdateTicketRequest(
    string? Status,
    string? Priority,
    string? Assignee,
    string? AssignedAgencyCode,
    int? SatisfactionRating,
    string? SatisfactionComment,
    bool? IsEscalated
);

public record PublicTicketUpdateRequest(
    string Email,
    bool? IsEscalated,
    int? SatisfactionRating,
    string? SatisfactionComment
);

public record TicketMessageRequest(
    string Content,
    string AuthorName,
    string AuthorRole,
    string? AuthorEmail,
    bool IsInternal = false
);

public record PublicCommentRequest(
    string Content,
    string AuthorName,
    string AuthorEmail
);
