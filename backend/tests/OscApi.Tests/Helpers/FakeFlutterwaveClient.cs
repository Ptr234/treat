using OscApi.Common;

namespace OscApi.Tests.Helpers;

/// <summary>
/// In-memory stand-in for IFlutterwaveClient so PaymentService can be unit
/// tested without a real network call or live API keys — configure the
/// transaction it should "find" on verification and, optionally, force a
/// signature-check result.
/// </summary>
public class FakeFlutterwaveClient : IFlutterwaveClient
{
    public bool IsConfigured { get; set; } = true;
    public bool SignatureValid { get; set; } = true;
    public string LinkToReturn { get; set; } = "https://checkout.flutterwave.com/pay/fake-link";
    public FlutterwaveTransaction? TransactionOnVerify { get; set; }
    public string? LastInitiatedTxRef { get; private set; }
    public decimal? LastInitiatedAmount { get; private set; }

    public Task<string> InitiatePaymentAsync(string txRef, decimal amount, string currency, string redirectUrl, string customerEmail, string customerName)
    {
        if (!IsConfigured) throw new InvalidOperationException("Flutterwave is not configured");
        LastInitiatedTxRef = txRef;
        LastInitiatedAmount = amount;
        return Task.FromResult(LinkToReturn);
    }

    public Task<FlutterwaveTransaction?> VerifyTransactionAsync(string transactionId) =>
        Task.FromResult(TransactionOnVerify);

    public bool VerifyWebhookSignature(string? receivedHash) => SignatureValid;
}
