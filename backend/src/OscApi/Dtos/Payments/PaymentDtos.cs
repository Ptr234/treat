using System.Text.Json.Serialization;

namespace OscApi.Dtos.Payments;

public record InitiatePaymentResponse(
    string TxRef,
    string PaymentLink,
    decimal Amount,
    string Currency,
    string Status
);

/// <summary>Status is one of "not_initiated", "pending", "successful", "failed".</summary>
public record PaymentStatusResponse(
    string Status,
    decimal Amount,
    string Currency,
    DateTimeOffset? PaidAt
);

/// <summary>
/// Flutterwave's charge.completed webhook body (v3). Only the fields needed to
/// look up our Payment row and trigger a server-to-server re-verification — the
/// amount/status here are never trusted directly, see PaymentService.HandleWebhookAsync.
/// </summary>
public class FlutterwaveWebhookIncoming
{
    [JsonPropertyName("event")]
    public string? Event { get; set; }

    [JsonPropertyName("data")]
    public FlutterwaveWebhookData? Data { get; set; }
}

public class FlutterwaveWebhookData
{
    [JsonPropertyName("id")]
    public long? Id { get; set; }

    [JsonPropertyName("tx_ref")]
    public string? TxRef { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }
}
