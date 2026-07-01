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
    Task<object?> PostMessageAsync(string refNumber, TicketMessageRequest request);
}
