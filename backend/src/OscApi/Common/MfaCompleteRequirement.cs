using Microsoft.AspNetCore.Authorization;

namespace OscApi.Common;

/// <summary>
/// Requires that a back-office session (admin, dg, agency_officer) has completed
/// TOTP enrolment before it can use any Staff/AdminOnly endpoint. A back-office
/// account that hasn't enrolled yet can still authenticate (its password was
/// correct) and can still reach the MFA enrolment endpoints — which sit outside
/// these policies — but nothing else, until it sets up MFA. Registration for a
/// regular <c>user</c> account never carries this requirement.
/// </summary>
public class MfaCompleteRequirement : IAuthorizationRequirement { }

public class MfaCompleteHandler : AuthorizationHandler<MfaCompleteRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, MfaCompleteRequirement requirement)
    {
        var role = context.User.GetRole();
        if (!Roles.BackOfficeRoles.Contains(role))
        {
            // Not a back-office role — this requirement doesn't apply. (In practice
            // this branch is unreachable in production: Staff/AdminOnly already
            // RequireRole one of the back-office roles. Kept as a safe default
            // rather than assuming that will always remain true.)
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        if (context.User.FindFirst("mfa_enabled")?.Value == "true")
            context.Succeed(requirement);

        return Task.CompletedTask;
    }
}
