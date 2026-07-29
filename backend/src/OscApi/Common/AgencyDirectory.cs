namespace OscApi.Common;

/// <summary>
/// Canonical names for the OneStop Centre partner agencies, so the dashboard
/// can label a scorecard row with more than a bare code. Codes not listed here
/// still appear — they just fall back to showing the code as the name.
/// </summary>
public static class AgencyDirectory
{
    private static readonly Dictionary<string, string> Names = new(StringComparer.OrdinalIgnoreCase)
    {
        ["UIA"] = "Uganda Investment Authority",
        ["URSB"] = "Uganda Registration Services Bureau",
        ["URA"] = "Uganda Revenue Authority",
        ["NEMA"] = "National Environment Management Authority",
        ["KCCA"] = "Kampala Capital City Authority",
        ["UNBS"] = "Uganda National Bureau of Standards",
        ["DCIC"] = "Directorate of Citizenship and Immigration Control",
        ["LANDS"] = "Ministry of Lands, Housing and Urban Development",
        ["ERA"] = "Electricity Regulatory Authority",
        ["NSSF"] = "National Social Security Fund",
        ["UCC"] = "Uganda Communications Commission",
        ["CMA"] = "Capital Markets Authority",
        ["PAU"] = "Petroleum Authority of Uganda",
        ["UTB"] = "Uganda Tourism Board",
        ["UFZA"] = "Uganda Free Zones Authority",
        ["UCDA"] = "Uganda Coffee Development Authority",
    };

    /// <summary>Full name for an agency code, or the code itself if unknown.</summary>
    public static string NameFor(string? code) =>
        string.IsNullOrWhiteSpace(code)
            ? "Unassigned"
            : Names.TryGetValue(code, out var name) ? name : code;
}
