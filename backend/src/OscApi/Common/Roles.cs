using System.Security.Claims;

namespace OscApi.Common;

/// <summary>
/// Central definitions for the application's role model and authorization
/// policy names, so role strings aren't duplicated as magic literals.
/// </summary>
public static class Roles
{
    /// <summary>Director General — leadership superuser (full back-office access).</summary>
    public const string Dg = "dg";

    /// <summary>System administrator (full back-office access).</summary>
    public const string Admin = "admin";

    /// <summary>Agency officer — back-office access scoped to their own agency.</summary>
    public const string AgencyOfficer = "agency_officer";

    /// <summary>Regular end user / investor.</summary>
    public const string User = "user";

    /// <summary>Roles with unrestricted back-office access.</summary>
    public static readonly string[] AdminLevel = { Dg, Admin };

    /// <summary>All back-office staff (admin-level plus agency officers).</summary>
    public static readonly string[] Staff = { Dg, Admin, AgencyOfficer };

    /// <summary>Valid roles for an <c>admin_users</c> record.</summary>
    public static readonly string[] BackOfficeRoles = { Dg, Admin, AgencyOfficer };

    public const string AdminOnlyPolicy = "AdminOnly";
    public const string StaffPolicy = "Staff";
}

/// <summary>Claim helpers for reading the signed-in principal's role and agency.</summary>
public static class ClaimsPrincipalExtensions
{
    public static string? GetRole(this ClaimsPrincipal user) =>
        user.FindFirst(ClaimTypes.Role)?.Value ?? user.FindFirst("role")?.Value;

    /// <summary>The agency an officer is scoped to, or null for admin-level users.</summary>
    public static string? GetAgencyCode(this ClaimsPrincipal user) =>
        user.FindFirst("agency_code")?.Value;

    public static bool IsAdminLevel(this ClaimsPrincipal user) =>
        Roles.AdminLevel.Contains(user.GetRole());

    public static bool IsAgencyOfficer(this ClaimsPrincipal user) =>
        user.GetRole() == Roles.AgencyOfficer;
}
