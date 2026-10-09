using OscApi.Common;
using OscApi.Dtos.Tickets;

namespace OscApi.Services;

public interface ITicketService
{
    /// <summary>Staff board: filtered, searched, sorted page plus headline stats.
    /// <paramref name="agencyScope"/>, when non-null, restricts to that agency's tickets.</summary>
    Task<object> ListAsync(TicketListQuery query, string? agencyScope = null);

    /// <summary>File a ticket. Public callers get a category-derived priority and can't file VIP.</summary>
    Task<object> CreateAsync(CreateTicketRequest request, bool isStaff);

    /// <summary>Null when the ticket doesn't exist or the requester may not see it.</summary>
    Task<object?> GetAsync(string refNumber, TicketRequester who);
    Task<object?> GetMessagesAsync(string refNumber, TicketRequester who);

    Task<object?> UpdateAsync(string refNumber, UpdateTicketRequest request, string? agencyScope = null);

    /// <summary>Post a staff reply. Author identity and the officer role are trusted from the session.</summary>
    Task<object?> PostStaffMessageAsync(string refNumber, string content, string authorName, string? authorEmail, bool isInternal, string? agencyScope = null);

    /// <summary>Post a reply as the ticket's filer (token or signed-in owner).</summary>
    Task<object?> PostPublicCommentAsync(string refNumber, string content, TicketRequester who);

    /// <summary>Public self-service update (escalate / rate). Only safe fields are applied.</summary>
    Task<object?> PublicUpdateAsync(string refNumber, PublicTicketUpdateRequest request, TicketRequester who);

    /// <summary>Email the tracking link to the filing address, if it matches. Never reveals whether it did.</summary>
    Task RequestAccessLinkAsync(string refNumber, string email);
}
