using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OscApi.Models;

/// <summary>
/// One attempt to pay a business registration's statutory fee via Flutterwave.
/// A registration may have more than one row here (a failed attempt followed by
/// a retry) — the latest one is authoritative. Certificate issuance requires at
/// least one row with <see cref="Status"/> == Successful for the same
/// <see cref="BusinessRegistrationRef"/>.
/// </summary>
[Table("payments")]
public class Payment : AuditableEntity
{
    [Required, MaxLength(20)]
    public string BusinessRegistrationRef { get; set; } = string.Empty;

    /// <summary>Our own idempotency key, sent to Flutterwave as tx_ref and matched
    /// back on webhook/verification — never Flutterwave's transaction id, which
    /// doesn't exist until the customer completes checkout.</summary>
    [Required, MaxLength(64)]
    public string TxRef { get; set; } = string.Empty;

    [Column(TypeName = "decimal(14,2)")]
    public decimal Amount { get; set; }

    [Required, MaxLength(10)]
    public string Currency { get; set; } = "UGX";

    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    [Required, MaxLength(30)]
    public string Provider { get; set; } = "Flutterwave";

    [MaxLength(2000)]
    public string? PaymentLink { get; set; }

    /// <summary>Flutterwave's transaction id, populated once we've re-verified the
    /// transaction server-to-server (never trust the id as reported by a webhook
    /// alone — see PaymentService.HandleWebhookAsync).</summary>
    [MaxLength(100)]
    public string? ProviderTransactionId { get; set; }

    public DateTimeOffset? PaidAt { get; set; }

    [MaxLength(500)]
    public string? FailureReason { get; set; }
}
