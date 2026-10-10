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

    /// <summary>
    /// False for a back-office session that hasn't completed MFA enrolment — the
    /// same rule as <see cref="MfaCompleteRequirement"/>. Regular users are
    /// never subject to it.
    /// </summary>
    public static bool HasCompletedMfa(this ClaimsPrincipal user) =>
        !Roles.BackOfficeRoles.Contains(user.GetRole()) || user.FindFirst("mfa_enabled")?.Value == "true";

    /// <summary>
    /// Admin-level <b>and</b> MFA-complete: the in-code equivalent of the
    /// AdminOnly policy. Use this, never bare <see cref="IsAdminLevel"/>, to grant
    /// privileges inside an action that isn't already behind the policy.
    /// </summary>
    public static bool IsAdminSession(this ClaimsPrincipal user) =>
        user.IsAdminLevel() && user.HasCompletedMfa();

    /// <summary>
    /// The email of a signed-in <b>regular user</b> whose address is verified, or null
    /// (anonymous visitors and staff). Self-service records are matched to accounts
    /// by email, so anything such a user submits is filed under this address — not
    /// whatever was typed into the form — or it would never appear under
    /// "My submissions" (nor would staff replies to it).
    /// </summary>
    public static string? VerifiedAccountEmail(this ClaimsPrincipal user)
    {
        if (user.Identity?.IsAuthenticated != true) return null;
        if (Roles.BackOfficeRoles.Contains(user.GetRole())) return null; // staff file on others' behalf
        if (user.FindFirst("email_verified")?.Value != "true") return null;
        var email = user.FindFirst(ClaimTypes.Email)?.Value ?? user.FindFirst("email")?.Value;
        return string.IsNullOrWhiteSpace(email) ? null : email.Trim().ToLowerInvariant();
    }

    /// <summary>Any back-office role <b>and</b> MFA-complete: the in-code equivalent of the Staff policy.</summary>
    public static bool IsStaffSession(this ClaimsPrincipal user) =>
        (user.IsAdminLevel() || user.IsAgencyOfficer()) && user.HasCompletedMfa();
}
