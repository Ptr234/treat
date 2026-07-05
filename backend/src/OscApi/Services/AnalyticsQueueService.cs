using System.Collections.Concurrent;
using OscApi.Data;
using OscApi.Models;

namespace OscApi.Services;

public interface IAnalyticsQueueService
{
    Task EnqueueAsync(AnalyticsEvent evt);
    Task ProcessBatchAsync();
}

public class AnalyticsQueueService : IAnalyticsQueueService, IAsyncDisposable
{
    private readonly OscDbContext _db;
    private readonly ILogger<AnalyticsQueueService> _logger;
    private readonly ConcurrentQueue<AnalyticsEvent> _queue = new();
    private readonly Timer? _batchTimer;
    private const int BatchSize = 100;
    private const int BatchIntervalMs = 5000; // 5 seconds

    public AnalyticsQueueService(OscDbContext db, ILogger<AnalyticsQueueService> logger)
    {
        _db = db;
        _logger = logger;

        // Start background timer to process batches
        _batchTimer = new Timer(async _ => await ProcessBatchAsync(), null, BatchIntervalMs, BatchIntervalMs);
    }

    public async Task EnqueueAsync(AnalyticsEvent evt)
    {
        _queue.Enqueue(evt);

        // Process immediately if batch is full
        if (_queue.Count >= BatchSize)
        {
            await ProcessBatchAsync();
        }
    }

    public async Task ProcessBatchAsync()
    {
        if (_queue.IsEmpty) return;

        var batch = new List<AnalyticsEvent>();
        while (_queue.TryDequeue(out var evt) && batch.Count < BatchSize)
        {
            batch.Add(evt);
        }

        if (batch.Count == 0) return;

        try
        {
            _db.AnalyticsEvents.AddRange(batch);
            await _db.SaveChangesAsync();
            _logger.LogInformation("Processed analytics batch of {Count} events", batch.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process analytics batch of {Count} events", batch.Count);
            // Re-queue failed events (simple fallback; in production, use a dead-letter queue)
            foreach (var evt in batch)
            {
                _queue.Enqueue(evt);
            }
        }
    }

    async ValueTask IAsyncDisposable.DisposeAsync()
    {
        _batchTimer?.Dispose();
        // Process remaining events before shutdown
        if (!_queue.IsEmpty)
        {
            await ProcessBatchAsync();
        }
    }
}
