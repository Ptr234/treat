using OscApi.Dtos.Payments;

namespace OscApi.Services;

public interface IPaymentService
{
    /// <summary>Start (or return the already-successful) payment for a registration's
    /// statutory fee. Throws KeyNotFoundException if the registration doesn't exist,
    /// InvalidOperationException if Flutterwave isn't configured.</summary>
    Task<InitiatePaymentResponse> InitiatePaymentAsync(string refNumber);

    Task<PaymentStatusResponse?> GetStatusAsync(string refNumber);

    /// <summary>Handle a Flutterwave webhook call. Returns false if the signature
    /// didn't verify (caller should respond 401/403); true otherwise, including for
    /// an unrecognized tx_ref (acknowledged so Flutterwave stops retrying).</summary>
    Task<bool> HandleWebhookAsync(string? receivedSignature, FlutterwaveWebhookIncoming payload);
}
