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

    /// <summary>actorEmail/actorRole/ipAddress identify who made a staff decision, for
    /// the audit trail — defaulted so existing callers that don't care (e.g. tests
    /// exercising pure business-rule behavior) don't need to supply them.</summary>
    Task<BusinessRegistrationDetailResponse?> UpdateAsync(string refNumber, UpdateBusinessRegistrationRequest request, string? agencyScope,
        string actorEmail = "(unknown)", string actorRole = "-", string? ipAddress = null);
    Task<CertificateResponse?> GetCertificateAsync(string refNumber, string? email, bool isStaff);
}
