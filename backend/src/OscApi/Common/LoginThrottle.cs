using Microsoft.Extensions.Caching.Memory;

namespace OscApi.Common;

/// <summary>
/// Per-account limit on failed sign-ins. The "login" rate limiter is per IP, so
/// guessing one account's password from many addresses was otherwise unlimited.
/// After <see cref="MaxFailures"/> failures within <see cref="Window"/> the
/// account refuses further attempts until the window ends. The window is short
/// so an attacker can't keep a real user locked out for long.
/// Per-process, like the rate limiter: run a single backend instance.
/// </summary>
public interface ILoginThrottle
{
    bool IsLocked(string email);
    void RecordFailure(string email);
    void Reset(string email);
}

public sealed class LoginThrottle(IMemoryCache cache) : ILoginThrottle
{
    public const int MaxFailures = 10;
    public static readonly TimeSpan Window = TimeSpan.FromMinutes(15);

    private sealed class Counter { public int Failures; }

    private static string Key(string email) => "login-failures:" + email.Trim().ToLowerInvariant();

    public bool IsLocked(string email) =>
        cache.TryGetValue(Key(email), out Counter? c) && c is not null && Volatile.Read(ref c.Failures) >= MaxFailures;

    public void RecordFailure(string email)
    {
        // The window starts at the first failure and is not extended by later ones.
        var counter = cache.GetOrCreate(Key(email), entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = Window;
            return new Counter();
        })!;
        Interlocked.Increment(ref counter.Failures);
    }

    public void Reset(string email) => cache.Remove(Key(email));
}
