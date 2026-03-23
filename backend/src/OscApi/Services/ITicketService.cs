using OscApi.Dtos.Tickets;

namespace OscApi.Services;

public interface ITicketService
{
    Task<object> ListAsync(int from, int to);
    Task<object> CreateAsync(CreateTicketRequest request);
    Task<object?> GetByRefAsync(string refNumber, string? email, bool isAdmin);
    Task<object?> UpdateAsync(string refNumber, UpdateTicketRequest request);
    Task<object?> GetMessagesAsync(string refNumber, string? email, bool isAdmin);
    Task<object?> PostMessageAsync(string refNumber, TicketMessageRequest request);
}
