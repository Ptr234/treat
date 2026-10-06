using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace OscApi.Middleware;

public class ValidationExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IProblemDetailsService _problemDetailsService;

    public ValidationExceptionMiddleware(RequestDelegate next, IProblemDetailsService problemDetailsService)
    {
        _next = next;
        _problemDetailsService = problemDetailsService;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            if (context.Response.HasStarted) throw;

            context.Response.StatusCode = StatusCodes.Status400BadRequest;

            var errors = ex.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());

            // RFC 7807 problem+json (ApiDesign.MD §4/§13) — the "errors" extension
            // matches ASP.NET's own ValidationProblemDetails field-error shape, so
            // FluentValidation and [ApiController] model-state failures look the same.
            await _problemDetailsService.WriteAsync(new ProblemDetailsContext
            {
                HttpContext = context,
                ProblemDetails = new ValidationProblemDetails(errors)
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "One or more validation errors occurred.",
                    Detail = "Validation failed",
                    Instance = context.Request.Path,
                },
            });
        }
    }
}
