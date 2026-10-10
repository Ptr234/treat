using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OscApi.Models;

public enum EmailOutboxStatus
{
    Pending,
    Sent,
    /// <summary>Permanent failure (bad address, rejected by the provider) or retries exhausted.</summary>
    Failed,
    /// <summary>Not sent because email isn't configured (no Resend API key) — e.g. local development.</summary>
    Skipped,
}

/// <summary>
/// An email waiting to be (or already) delivered. Written in the same request
/// that triggers it and sent by <c>EmailOutboxWorker</c>, so a restart or deploy
/// can't silently drop it — unsent rows are picked up again on startup.
/// </summary>
[Table("email_outbox")]
public class EmailOutboxMessage : AuditableEntity
{
    [Required, MaxLength(255)]
    public string To { get; set; } = string.Empty;

    [Required, MaxLength(300)]
    public string Subject { get; set; } = string.Empty;

    /// <summary>The complete Resend request body (from, to, subject, html, text, reply_to).</summary>
    [Required]
    public string PayloadJson { get; set; } = string.Empty;

    /// <summary>Sent as Resend's Idempotency-Key on every attempt, so a retry after a
    /// timeout that Resend had in fact accepted is deduplicated, not delivered twice.</summary>
    [Required, MaxLength(64)]
    public string IdempotencyKey { get; set; } = Guid.NewGuid().ToString("N");

    public EmailOutboxStatus Status { get; set; } = EmailOutboxStatus.Pending;

    public int Attempts { get; set; }

    public DateTimeOffset NextAttemptAt { get; set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset? SentAt { get; set; }

    [MaxLength(100)]
    public string? ProviderMessageId { get; set; }

    [MaxLength(1000)]
    public string? LastError { get; set; }
}
