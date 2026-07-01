namespace OscApi.Common;

/// <summary>
/// Normalizes caller-supplied <c>from</c>/<c>to</c> range parameters into a safe
/// (skip, take) pair. Guards against negative <c>Take</c> (which throws in EF when
/// <c>to &lt; from</c>) and against unbounded page sizes that would materialize an
/// entire table.
/// </summary>
public static class Pagination
{
    public const int MaxPageSize = 200;

    public static (int Skip, int Take) Normalize(int from, int to)
    {
        var skip = Math.Max(0, from);
        var take = Math.Clamp(to - skip, 0, MaxPageSize);
        return (skip, take);
    }
}
