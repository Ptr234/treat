using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using OscApi.Models;

namespace OscApi.Common;

/// <summary>
/// Who is asking about a ticket, resolved once per request by the controller.
/// Staff are authorized by session (agency officers only within their agency);
/// the public by the ticket's tracking token, or by signing in with the email
/// the ticket was filed under.
/// </summary>
public sealed record TicketRequester(bool IsStaff, string? AgencyScope, string? Token, string? SessionEmail)
{
    public static TicketRequester From(ClaimsPrincipal user, string? token)
    {
        // Same bar as the Staff policy (MfaCompleteRequirement): a back-office
        // session that hasn't finished MFA enrolment gets no staff access here.
        var isStaff = user.IsStaffSession();
        var email = user.Identity?.IsAuthenticated == true
            ? (user.FindFirst(ClaimTypes.Email)?.Value ?? user.FindFirst("email")?.Value)?.Trim().ToLowerInvariant()
            : null;
        return new TicketRequester(isStaff, user.IsAgencyOfficer() ? user.GetAgencyCode() : null, token, email);
    }

    /// <summary>An agency officer whose account has no agency configured.</summary>
    public bool IsMisconfiguredOfficer(ClaimsPrincipal user) =>
        user.IsAgencyOfficer() && string.IsNullOrEmpty(AgencyScope);
}

public static class TicketAccess
{
    /// <summary>A new random tracking token (192 bits, URL-safe).</summary>
    public static string NewToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(24)).TrimEnd('=').Replace('+', '-').Replace('/', '_');

    /// <summary>True if the requester owns the ticket (public side).</summary>
    public static bool IsOwner(Ticket ticket, TicketRequester who)
    {
        if (!string.IsNullOrEmpty(who.Token) && !string.IsNullOrEmpty(ticket.AccessToken)
            && CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(who.Token), Encoding.UTF8.GetBytes(ticket.AccessToken)))
            return true;
        return !string.IsNullOrEmpty(who.SessionEmail) && who.SessionEmail == ticket.ContactEmail;
    }

    /// <summary>True if staff may act on the ticket (agency officers only within their agency).</summary>
    public static bool StaffCanAccess(Ticket ticket, TicketRequester who) =>
        who.IsStaff && (string.IsNullOrEmpty(who.AgencyScope) || ticket.AssignedAgencyCode == who.AgencyScope);

    public static bool CanView(Ticket ticket, TicketRequester who) =>
        StaffCanAccess(ticket, who) || (!who.IsStaff && IsOwner(ticket, who));
}
