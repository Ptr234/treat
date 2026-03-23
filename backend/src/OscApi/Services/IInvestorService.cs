using OscApi.Dtos.Investors;

namespace OscApi.Services;

public interface IInvestorService
{
    Task<object> ListAsync(int from, int to, string? status);
    Task<InvestorDetailResponse?> GetByRefAsync(string refNumber, string? email, bool isAdmin);
    Task<(InvestorResponse? Result, string? Error)> CreateAsync(CreateInvestorRequest request);
    Task<InvestorResponse?> UpdateAsync(string refNumber, UpdateInvestorRequest request);
    Task<bool> DeleteAsync(string refNumber);
}
