using Microsoft.EntityFrameworkCore;
using OscApi.Data;
using OscApi.Models;

namespace OscApi.Common;

/// <summary>Durable hand-off for outgoing email: a row in <c>email_outbox</c>.</summary>
public interface IEmailOutbox
{
    Task EnqueueAsync(string to, string subject, string payloadJson);
}

public sealed class EmailOutbox : IEmailOutbox
{
    private readonly IServiceScopeFactory _scopes;
    private readonly EmailOutboxSignal _signal;

    public EmailOutbox(IServiceScopeFactory scopes, EmailOutboxSignal signal)
    {
        _scopes = scopes;
        _signal = signal;
    }

    public async Task EnqueueAsync(string to, string subject, string payloadJson)
    {
        // Own scope/DbContext: callers are singletons and fire-and-forget paths
        // that may outlive the request, so never borrow the request's context.
        using var scope = _scopes.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<OscDbContext>();
        db.EmailOutbox.Add(new EmailOutboxMessage
        {
            To = to.Length <= 255 ? to : to[..255],
            Subject = subject.Length <= 300 ? subject : subject[..300],
            PayloadJson = payloadJson,
        });
        await db.SaveChangesAsync();
        _signal.Wake();
    }
}

/// <summary>Lets an enqueue wake the worker immediately instead of waiting for its next poll.</summary>
public sealed class EmailOutboxSignal
{
    private readonly SemaphoreSlim _wake = new(0, 1);

    public void Wake()
    {
        if (_wake.CurrentCount == 0)
        {
            try { _wake.Release(); } catch (SemaphoreFullException) { /* already signalled */ }
        }
    }

    public Task WaitAsync(TimeSpan timeout, CancellationToken ct) => _wake.WaitAsync(timeout, ct);
}

/// <summary>
/// Delivers <c>email_outbox</c> rows one at a time (through EmailService's
/// throttle) and survives restarts: anything still Pending — including rows a
/// deploy interrupted — is picked up on the next start. Transient failures are
/// retried with growing delays (1 min … 8 h, 8 attempts ≈ 1 day); sent rows are
/// purged after 30 days because they hold personal data.
/// </summary>
public sealed class EmailOutboxWorker : BackgroundService
{
    public const int MaxAttempts = 8;
    private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(15);
    private static readonly TimeSpan Retention = TimeSpan.FromDays(30);

    private readonly IServiceScopeFactory _scopes;
    private readonly EmailService _email;
    private readonly EmailOutboxSignal _signal;
    private readonly ILogger<EmailOutboxWorker> _logger;
    private DateTimeOffset _lastPurge = DateTimeOffset.MinValue;

    public EmailOutboxWorker(IServiceScopeFactory scopes, IEmailService email, EmailOutboxSignal signal, ILogger<EmailOutboxWorker> logger)
    {
        _scopes = scopes;
        _email = (EmailService)email;
        _signal = signal;
        _logger = logger;
    }

    /// <summary>Delay before attempt <paramref name="attempts"/>+1: 1, 5, 15, 30 min, 1, 2, 4, 8 h.</summary>
    public static TimeSpan BackoffAfter(int attempts) => attempts switch
    {
        <= 1 => TimeSpan.FromMinutes(1),
        2 => TimeSpan.FromMinutes(5),
        3 => TimeSpan.FromMinutes(15),
        4 => TimeSpan.FromMinutes(30),
        5 => TimeSpan.FromHours(1),
        6 => TimeSpan.FromHours(2),
        7 => TimeSpan.FromHours(4),
        _ => TimeSpan.FromHours(8),
    };

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessDueAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                // Never let one bad cycle (e.g. the DB briefly unavailable) stop delivery for good.
                _logger.LogError(ex, "Email outbox cycle failed; will retry");
            }

            try { await _signal.WaitAsync(PollInterval, stoppingToken); }
            catch (OperationCanceledException) { break; }
        }
    }

    /// <summary>One delivery pass. Public so tests can drive it deterministically.</summary>
    public async Task<int> ProcessDueAsync(CancellationToken ct = default)
    {
        using var scope = _scopes.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<OscDbContext>();
        var now = DateTimeOffset.UtcNow;

        var due = await db.EmailOutbox
            .Where(m => m.Status == EmailOutboxStatus.Pending && m.NextAttemptAt <= now)
            .OrderBy(m => m.NextAttemptAt)
            .Take(50)
            .ToListAsync(ct);

        foreach (var message in due)
        {
            ct.ThrowIfCancellationRequested();
            var result = await _email.DeliverOnceAsync(message.PayloadJson, message.IdempotencyKey);
            message.Attempts++;

            switch (result.Outcome)
            {
                case EmailDeliveryOutcome.Sent:
                    message.Status = EmailOutboxStatus.Sent;
                    message.SentAt = DateTimeOffset.UtcNow;
                    message.ProviderMessageId = result.ProviderId;
                    message.LastError = null;
                    _logger.LogInformation("Email sent to {To}: {Subject} (Resend id {Id}, attempt {Attempt})",
                        message.To, message.Subject, result.ProviderId, message.Attempts);
                    break;
                case EmailDeliveryOutcome.NotConfigured:
                    message.Status = EmailOutboxStatus.Skipped;
                    message.LastError = result.Error;
                    break;
                case EmailDeliveryOutcome.PermanentFailure:
                    message.Status = EmailOutboxStatus.Failed;
                    message.LastError = Clip(result.Error);
                    _logger.LogError("Email to {To} rejected permanently: {Error} ({Subject})", message.To, result.Error, message.Subject);
                    break;
                default: // transient
                    message.LastError = Clip(result.Error);
                    if (message.Attempts >= MaxAttempts)
                    {
                        message.Status = EmailOutboxStatus.Failed;
                        _logger.LogError("Email to {To} failed after {Attempts} attempts: {Error} ({Subject})",
                            message.To, message.Attempts, result.Error, message.Subject);
                    }
                    else
                    {
                        var delay = BackoffAfter(message.Attempts);
                        if (result.RetryAfter is { } ra && ra > delay) delay = ra;
                        message.NextAttemptAt = DateTimeOffset.UtcNow + delay;
                        _logger.LogWarning("Email to {To} not sent ({Error}); retry {Next} in {Delay}",
                            message.To, result.Error, message.Attempts + 1, delay);
                    }
                    break;
            }

            // Persist each outcome immediately, so a crash mid-batch can't resend
            // an already-delivered message (the idempotency key covers the rest).
            await db.SaveChangesAsync(ct);
        }

        if (DateTimeOffset.UtcNow - _lastPurge > TimeSpan.FromHours(1))
        {
            _lastPurge = DateTimeOffset.UtcNow;
            var cutoff = DateTimeOffset.UtcNow - Retention;
            var old = await db.EmailOutbox
                .Where(m => m.Status != EmailOutboxStatus.Pending && m.CreatedAt < cutoff)
                .ToListAsync(ct);
            if (old.Count > 0)
            {
                db.EmailOutbox.RemoveRange(old);
                await db.SaveChangesAsync(ct);
            }
        }

        return due.Count;
    }

    private static string? Clip(string? s) => s is null || s.Length <= 1000 ? s : s[..1000];
}
