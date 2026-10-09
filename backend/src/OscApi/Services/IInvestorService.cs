using OscApi.Dtos.Investors;

namespace OscApi.Services;

public interface IInvestorService
{
    Task<object> ListAsync(int from, int to, string? status);
    Task<InvestorDetailResponse?> GetByRefAsync(string refNumber, string? email, bool isAdmin);
    /// <summary>Create a profile. When one already exists for the email, nothing is
    /// created, the existing reference is emailed to that address, and
    /// <c>Existing</c> is true (with a null <c>Result</c>, so the response never
    /// reveals another person's reference number).</summary>
    Task<(InvestorResponse? Result, bool Existing)> CreateAsync(CreateInvestorRequest request);
    Task<InvestorResponse?> UpdateAsync(string refNumber, UpdateInvestorRequest request);
    Task<bool> DeleteAsync(string refNumber);
}
