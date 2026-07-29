using System.Globalization;
using System.Text.RegularExpressions;

namespace OscApi.Common;

/// <summary>
/// Parses the free-text investment amounts captured by the public forms
/// ("USD 4,000,000", "$25m", "500k", "2.3 million") into a USD figure.
///
/// These fields are typed by investors rather than picked from a list, so the
/// parser is deliberately forgiving and returns null rather than throwing on
/// anything it cannot read — an unreadable entry must not distort a total.
/// </summary>
public static class MoneyParser
{
    private static readonly Regex Numeric = new(
        @"(\d[\d,\s]*(?:\.\d+)?)\s*(k|m|bn|b|thousand|million|billion)?",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    /// <summary>The amount in USD, or null when no number could be read.</summary>
    public static decimal? ParseUsd(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;

        var match = Numeric.Match(raw);
        if (!match.Success) return null;

        var digits = match.Groups[1].Value.Replace(",", "").Replace(" ", "");
        if (!decimal.TryParse(digits, NumberStyles.Any, CultureInfo.InvariantCulture, out var value))
            return null;

        var multiplier = match.Groups[2].Value.ToLowerInvariant() switch
        {
            "k" or "thousand" => 1_000m,
            "m" or "million" => 1_000_000m,
            "b" or "bn" or "billion" => 1_000_000_000m,
            _ => 1m,
        };

        var total = value * multiplier;
        // Guard against a stray year or reference number being read as capital.
        return total <= 0 ? null : total;
    }

    /// <summary>Sum of everything parseable; unparseable entries are skipped.</summary>
    public static decimal SumUsd(IEnumerable<string?> values) =>
        values.Select(ParseUsd).Where(v => v.HasValue).Sum(v => v!.Value);
}
