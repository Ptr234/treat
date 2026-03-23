using OscApi.Dtos.Contact;

namespace OscApi.Services;

public interface IContactService
{
    Task<ContactInquiryResponse> CreateInquiryAsync(CreateContactInquiryRequest request);
    Task<AppointmentResponse> CreateAppointmentAsync(CreateAppointmentRequest request);
    Task<object> ListInquiriesAsync(int from, int to, string? agencyCode);
    Task<object> ListAppointmentsAsync(int from, int to, string? agencyCode);
}
