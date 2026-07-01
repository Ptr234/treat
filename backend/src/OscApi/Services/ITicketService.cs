using OscApi.Dtos.Tickets;

namespace OscApi.Services;

public interface ITicketService
{
    // agencyScope, when non-null, restricts results to tickets assigned to that
    // agency (used to scope agency_officer users to their own agency).
    Task<object> ListAsync(int from, int to, string? agencyScope = null);
    Task<object> CreateAsync(CreateTicketRequest request);
    Task<object?> GetByRefAsync(string refNumber, string? email, bool isStaff, string? agencyScope = null);
    Task<object?> UpdateAsync(string refNumber, UpdateTicketRequest request, string? agencyScope = null);
    Task<object?> GetMessagesAsync(string refNumber, string? email, bool isStaff, string? agencyScope = null);

    /// <summary>Post a staff reply. Author identity and the officer role are trusted from the session.</summary>
    Task<object?> PostStaffMessageAsync(string refNumber, string content, string authorName, string? authorEmail, bool isInternal, string? agencyScope = null);

    /// <summary>Post a public reply. The email must match the ticket; the message is always a non-internal investor message.</summary>
    Task<object?> PostPublicCommentAsync(string refNumber, string content, string authorName, string email);

    /// <summary>Public self-service update (escalate / rate), gated by matching email. Only safe fields are applied.</summary>
    Task<object?> PublicUpdateAsync(string refNumber, PublicTicketUpdateRequest request);
}
