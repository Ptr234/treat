using System.Collections.Concurrent;

namespace OscApi.Middleware;

/// <summary>
/// User-based rate limiting middleware. Tracks requests per authenticated user
/// and per IP for anonymous users. More sophisticated than global rate limiting
/// by IP alone, which can unfairly throttle shared proxies/networks.
/// </summary>
public class UserRateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<UserRateLimitingMiddleware> _logger;
    private readonly IWebHostEnvironment _env;

    // Simple in-memory bucket tracking (per-process; use Redis for distributed)
    private static readonly ConcurrentDictionary<string, RateLimitBucket> Buckets = new();

    private const int DefaultRequestsPerMinute = 60;
    private const int AnonymousRequestsPerMinute = 20;

    public UserRateLimitingMiddleware(RequestDelegate next, ILogger<UserRateLimitingMiddleware> logger, IWebHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip rate limiting in development/test environments
        if (_env.IsDevelopment() || _env.IsEnvironment("Test"))
        {
            await _next(context);
            return;
        }

        var identifier = GetIdentifier(context);
        var limit = GetRateLimit(context);

        if (!IsAllowed(identifier, limit))
        {
            context.Response.StatusCode = 429; // Too Many Requests
            context.Response.Headers["Retry-After"] = "60";
            await context.Response.WriteAsJsonAsync(new
            {
                success = false,
                error = "Rate limit exceeded. Please try again in a few moments."
            });
            return;
        }

        await _next(context);
    }

    private string GetIdentifier(HttpContext context)
    {
        // Prefer authenticated user email
        var userEmail = context.User?.FindFirst("email")?.Value;
        if (!string.IsNullOrEmpty(userEmail))
            return $"user:{userEmail}";

        // Fall back to IP for anonymous users
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return $"ip:{ip}";
    }

    private int GetRateLimit(HttpContext context)
    {
        // Authenticated users get higher limit
        var isAuthenticated = context.User?.Identity?.IsAuthenticated ?? false;
        return isAuthenticated ? DefaultRequestsPerMinute : AnonymousRequestsPerMinute;
    }

    private bool IsAllowed(string identifier, int limit)
    {
        var now = DateTimeOffset.UtcNow;
        var bucket = Buckets.AddOrUpdate(
            identifier,
            _ => new RateLimitBucket { WindowStart = now, RequestCount = 1 },
            (_, existing) =>
            {
                // Check if window has expired (1 minute)
                if ((now - existing.WindowStart).TotalSeconds >= 60)
                {
                    return new RateLimitBucket { WindowStart = now, RequestCount = 1 };
                }

                existing.RequestCount++;
                return existing;
            }
        );

        // Clean up old buckets periodically (every 100 accesses)
        if (Buckets.Count % 100 == 0)
        {
            var staleKey = Buckets
                .Where(kvp => (now - kvp.Value.WindowStart).TotalSeconds > 120)
                .Select(kvp => kvp.Key)
                .FirstOrDefault();

            if (staleKey is not null)
            {
                Buckets.TryRemove(staleKey, out _);
            }
        }

        return bucket.RequestCount <= limit;
    }

    private class RateLimitBucket
    {
        public DateTimeOffset WindowStart { get; set; }
        public int RequestCount { get; set; }
    }
}

/// <summary>Extension method to register rate limiting middleware</summary>
public static class UserRateLimitingExtensions
{
    public static IApplicationBuilder UseUserRateLimiting(this IApplicationBuilder app)
    {
        return app.UseMiddleware<UserRateLimitingMiddleware>();
    }
}
