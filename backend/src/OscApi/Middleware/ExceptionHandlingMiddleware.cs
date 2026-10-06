using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace OscApi.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IProblemDetailsService _problemDetailsService;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IProblemDetailsService problemDetailsService)
    {
        _next = next;
        _logger = logger;
        _problemDetailsService = problemDetailsService;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception on {Method} {Path}", context.Request.Method, context.Request.Path);

            if (context.Response.HasStarted)
                throw; // Too late to rewrite the response — let the server abort it.

            context.Response.StatusCode = StatusCodes.Status500InternalServerError;

            // RFC 7807 problem+json (ApiDesign.MD §4) — same shape every other
            // error response on the API uses (ControllerBase.Problem()/ValidationProblem()).
            await _problemDetailsService.WriteAsync(new ProblemDetailsContext
            {
                HttpContext = context,
                ProblemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status500InternalServerError,
                    Title = "An unexpected error occurred.",
                    Detail = "An internal error occurred",
                    Instance = context.Request.Path,
                },
            });
        }
    }
}
