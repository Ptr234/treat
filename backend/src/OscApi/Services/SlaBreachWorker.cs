namespace OscApi.Services;

/// <summary>
/// Acts on SLA breaches without waiting for anyone to look at the board: every
/// few minutes, open tickets whose deadline has passed are flagged, escalated
/// and their owners alerted (see <see cref="ITicketService.ProcessSlaBreachesAsync"/>).
/// Each ticket is acted on once — the flag is persisted — so restarts and
/// multiple instances don't re-alert.
/// </summary>
public sealed class SlaBreachWorker : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(5);

    private readonly IServiceScopeFactory _scopes;
    private readonly ILogger<SlaBreachWorker> _logger;

    public SlaBreachWorker(IServiceScopeFactory scopes, ILogger<SlaBreachWorker> logger)
    {
        _scopes = scopes;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopes.CreateScope();
                var tickets = scope.ServiceProvider.GetRequiredService<ITicketService>();
                var flagged = await tickets.ProcessSlaBreachesAsync(stoppingToken);
                if (flagged > 0)
                    _logger.LogWarning("SLA monitor escalated {Count} overdue ticket(s)", flagged);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                // One bad cycle (e.g. the DB briefly unavailable) must not stop monitoring.
                _logger.LogError(ex, "SLA monitor cycle failed; will retry");
            }

            try { await Task.Delay(Interval, stoppingToken); }
            catch (OperationCanceledException) { break; }
        }
    }
}
