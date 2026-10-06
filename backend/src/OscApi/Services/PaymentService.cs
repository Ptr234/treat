using Microsoft.EntityFrameworkCore;
using OscApi.Common;
using OscApi.Data;
using OscApi.Dtos.Payments;
using OscApi.Models;

namespace OscApi.Services;

public class PaymentService : IPaymentService
{
    private readonly OscDbContext _db;
    private readonly IFlutterwaveClient _flutterwave;
    private readonly IAuditLogService _audit;
    private readonly string _siteUrl;

    /// <summary>
    /// URSB's published fee schedule by business type — the authoritative amount
    /// charged; a client never gets to supply its own figure. Mirrors (and, for ngo
    /// and cooperative, actually sets — the wizard's client-side estimate silently
    /// computes UGX 0 for those two types today) the estimate shown in the
    /// registration wizard.
    /// </summary>
    private static readonly Dictionary<string, decimal> FeeScheduleUgx = new(StringComparer.OrdinalIgnoreCase)
    {
        ["sole-proprietorship"] = 250_000m,
        ["partnership"] = 400_000m,
        ["limited-company"] = 650_000m,
        ["ngo"] = 150_000m,
        ["cooperative"] = 200_000m,
    };
    private const decimal DefaultFeeUgx = 250_000m;

    public static decimal FeeFor(string businessType) =>
        FeeScheduleUgx.TryGetValue(businessType, out var fee) ? fee : DefaultFeeUgx;

    public PaymentService(OscDbContext db, IFlutterwaveClient flutterwave, IAuditLogService audit, IConfiguration config)
    {
        _db = db;
        _flutterwave = flutterwave;
        _audit = audit;
        _siteUrl = (config["SiteUrl"] ?? "http://localhost:3000").TrimEnd('/');
    }

    public async Task<InitiatePaymentResponse> InitiatePaymentAsync(string refNumber)
    {
        var registration = await _db.BusinessRegistrations.FirstOrDefaultAsync(r => r.ReferenceNumber == refNumber)
            ?? throw new KeyNotFoundException("Registration not found");

        var alreadyPaid = await _db.Payments
            .Where(p => p.BusinessRegistrationRef == refNumber && p.Status == PaymentStatus.Successful)
            .FirstOrDefaultAsync();
        if (alreadyPaid is not null)
            return new InitiatePaymentResponse(alreadyPaid.TxRef, alreadyPaid.PaymentLink ?? "", alreadyPaid.Amount, alreadyPaid.Currency, "successful");

        var amount = FeeFor(registration.BusinessType);
        var txRef = $"{refNumber}-{Guid.NewGuid():N}";
        if (txRef.Length > 64) txRef = txRef[..64];
        var payment = new Payment
        {
            BusinessRegistrationRef = refNumber,
            TxRef = txRef,
            Amount = amount,
            Currency = "UGX",
            Status = PaymentStatus.Pending,
        };

        var redirectUrl = $"{_siteUrl}/business/registration/{refNumber}/?payment=callback";
        var link = await _flutterwave.InitiatePaymentAsync(
            payment.TxRef, amount, payment.Currency, redirectUrl, registration.ContactEmail, registration.ContactName);
        payment.PaymentLink = link;

        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();

        return new InitiatePaymentResponse(payment.TxRef, link, amount, payment.Currency, "pending");
    }

    public async Task<PaymentStatusResponse?> GetStatusAsync(string refNumber)
    {
        var registration = await _db.BusinessRegistrations.FirstOrDefaultAsync(r => r.ReferenceNumber == refNumber);
        if (registration is null) return null;

        var latest = await _db.Payments
            .Where(p => p.BusinessRegistrationRef == refNumber)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync();

        if (latest is null)
            return new PaymentStatusResponse("not_initiated", FeeFor(registration.BusinessType), "UGX", null);

        return new PaymentStatusResponse(latest.Status.ToString().ToLowerInvariant(), latest.Amount, latest.Currency, latest.PaidAt);
    }

    public async Task<bool> HandleWebhookAsync(string? receivedSignature, FlutterwaveWebhookIncoming payload)
    {
        if (!_flutterwave.VerifyWebhookSignature(receivedSignature))
            return false;

        var txRef = payload.Data?.TxRef;
        var transactionId = payload.Data?.Id;
        if (string.IsNullOrEmpty(txRef) || transactionId is null)
            return true; // signature was valid but the payload is unusable — nothing more to do

        var payment = await _db.Payments.FirstOrDefaultAsync(p => p.TxRef == txRef);
        if (payment is null || payment.Status == PaymentStatus.Successful)
            return true; // unknown or already-settled tx_ref — ack so Flutterwave stops retrying

        // Never trust the webhook body's own amount/status — re-fetch the
        // transaction from Flutterwave's API by id and compare against what this
        // Payment row actually expects before marking anything paid.
        var verified = await _flutterwave.VerifyTransactionAsync(transactionId.Value.ToString());
        var isSuccessful = verified is not null
            && verified.TxRef == txRef
            && verified.Status.Equals("successful", StringComparison.OrdinalIgnoreCase)
            && verified.Currency.Equals(payment.Currency, StringComparison.OrdinalIgnoreCase)
            && verified.Amount == payment.Amount;

        // A null verification response means the provider could not confirm the
        // transaction (for example, a transient outage). Leave it pending so a
        // retried webhook can be verified later; never turn an outage into a
        // permanent payment failure.
        if (verified is null)
            throw new InvalidOperationException("Flutterwave transaction verification is temporarily unavailable");

        payment.ProviderTransactionId = verified.Id.ToString();
        if (isSuccessful)
        {
            payment.Status = PaymentStatus.Successful;
            payment.PaidAt = DateTimeOffset.UtcNow;
        }
        else
        {
            payment.Status = PaymentStatus.Failed;
            payment.FailureReason = $"Verified status '{verified.Status}' / amount {verified.Amount} {verified.Currency} did not match expected {payment.Amount} {payment.Currency}";
        }

        await _db.SaveChangesAsync();

        await _audit.LogAsync("(flutterwave-webhook)", "system",
            isSuccessful ? "payments.flutterwave.succeeded" : "payments.flutterwave.failed",
            $"{payment.BusinessRegistrationRef}: {payment.Amount} {payment.Currency}",
            isSuccessful ? 200 : 400, ipAddress: null);

        return true;
    }
}
