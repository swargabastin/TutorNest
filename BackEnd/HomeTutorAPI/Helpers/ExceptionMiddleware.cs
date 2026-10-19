using System.Net;
using System.Text.Json;

namespace HomeTutorAPI.Helpers;

public class ExceptionMiddleware(
    RequestDelegate next,
    ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext ctx)
    {
        try
        {
            await next(ctx);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception for {Path}", ctx.Request.Path);
            await HandleAsync(ctx, ex);
        }
    }

    private static async Task HandleAsync(HttpContext ctx, Exception ex)
    {
        ctx.Response.ContentType = "application/json";

        var (status, message) = ex switch
        {
            ArgumentException      => (HttpStatusCode.BadRequest,  ex.Message),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "Unauthorized."),
            KeyNotFoundException   => (HttpStatusCode.NotFound,    ex.Message),
            _                      => (HttpStatusCode.InternalServerError, "An unexpected error occurred.")
        };

        ctx.Response.StatusCode = (int)status;

        var payload = JsonSerializer.Serialize(new
        {
            message,
            success = false,
            statusCode = (int)status
        });

        await ctx.Response.WriteAsync(payload);
    }
}
