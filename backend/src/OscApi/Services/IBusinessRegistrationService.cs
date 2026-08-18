using OscApi.Dtos.BusinessRegistrations;

namespace OscApi.Services;

public interface IBusinessRegistrationService
{
    Task<NameCheckResponse> CheckNameAsync(string name);
    Task<BusinessRegistrationResponse> CreateAsync(CreateBusinessRegistrationRequest request);

    /// <summary>List registrations. Admin-level staff see all; a URSB-scoped agency
    /// officer sees the registry; any other agency officer sees none (this is
    /// URSB's own registry, not a shared queue).</summary>
    Task<object> ListAsync(int from, int to, string? agencyScope);

    Task<BusinessRegistrationDetailResponse?> GetByRefAsync(string refNumber, string? email, bool isStaff);
    Task<BusinessRegistrationDetailResponse?> UpdateAsync(string refNumber, UpdateBusinessRegistrationRequest request, string? agencyScope);
    Task<CertificateResponse?> GetCertificateAsync(string refNumber, string? email, bool isStaff);
}
