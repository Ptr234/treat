using System.Text.RegularExpressions;

namespace OscApi.Common;

public static partial class SanitizeHelper
{
    public static string StripHtml(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;
        return HtmlTagRegex().Replace(input, string.Empty).Trim();
    }

    [GeneratedRegex("<[^>]*>")]
    private static partial Regex HtmlTagRegex();
}
