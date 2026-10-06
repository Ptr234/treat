using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Policy;
using Microsoft.AspNetCore.Mvc;
using OscApi.Common;

namespace OscApi.Middleware;

/// <summary>
/// The default <see cref="IAuthorizationMiddlewareResultHandler"/> writes a bare
/// status code with no body on a Challenge (401) or Forbid (403) — the *only*
/// error path in the API that bypasses RFC 7807 (ApiDesign.MD §4), because
/// [Authorize]/policy failures are resolved by authorization middleware before
/// any controller action (and therefore any Problem()/ValidationProblem() call)
/// runs. This handler intercepts exactly that gap and keeps the shape consistent.
/// </summary>
public class ProblemDetailsAuthorizationMiddlewareResultHandler : IAuthorizationMiddlewareResultHandler
{
    private readonly AuthorizationMiddlewareResultHandler _default = new();

    public async Task HandleAsync(RequestDelegate next, HttpContext context, AuthorizationPolicy policy, PolicyAuthorizationResult authorizeResult)
    {
        if (authorizeResult.Succeeded)
        {
            await _default.HandleAsync(next, context, policy, authorizeResult);
            return;
        }

        if (!authorizeResult.Challenged && !authorizeResult.Forbidden)
        {
            await _default.HandleAsync(next, context, policy, authorizeResult);
            return;
        }

        var mfaIncomplete = authorizeResult.AuthorizationFailure?.FailedRequirements
            .Any(r => r is MfaCompleteRequirement) ?? false;

        var status = authorizeResult.Challenged ? StatusCodes.Status401Unauthorized : StatusCodes.Status403Forbidden;
        var detail = authorizeResult.Challenged
            ? "Authentication is required to access this resource."
            : mfaIncomplete
                ? "Multi-factor authentication must be enrolled before this resource can be used."
                : "You do not have permission to access this resource.";

        context.Response.StatusCode = status;
        var problemDetailsService = context.RequestServices.GetRequiredService<IProblemDetailsService>();
        await problemDetailsService.WriteAsync(new ProblemDetailsContext
        {
            HttpContext = context,
            ProblemDetails = new ProblemDetails
            {
                Status = status,
                Title = authorizeResult.Challenged ? "Unauthorized" : "Forbidden",
                Detail = detail,
                Instance = context.Request.Path,
            },
        });
    }
}
