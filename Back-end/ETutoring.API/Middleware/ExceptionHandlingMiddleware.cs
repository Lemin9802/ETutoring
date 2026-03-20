using ETutoring.Business.Exceptions;
using ETutoring.Core.Common;
using ETutoring.Core.Helpers;
using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ETutoring.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        _logger.LogError(exception, "An unhandled exception occurred.");

        ApiResponse<Unit> response;
        int statusCode;

        switch (exception)
        {
            case EntityNotFoundException:
                statusCode = (int)HttpStatusCode.NotFound;
                response = ApiResponseHandler.FailureResponse<Unit>(exception.Message);
                break;

            case EntityNotHaveDataException:
                statusCode = (int)HttpStatusCode.NoContent;
                response = ApiResponseHandler.FailureResponse<Unit>(exception.Message);
                break;

            case EntityNotYetHaveDataException:
                statusCode = (int)HttpStatusCode.NotFound;
                response = ApiResponseHandler.FailureResponse<Unit>(exception.Message);
                break;

            case AuthErrorException:
                statusCode = (int)HttpStatusCode.Unauthorized;
                response = ApiResponseHandler.FailureResponse<Unit>(exception.Message);
                break;

            default:
                statusCode = (int)HttpStatusCode.InternalServerError;
                response = ApiResponseHandler.FailureResponse<Unit>("An unexpected error occurred.");
                break;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase, // Correct naming policy
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            WriteIndented = true
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
    }
}
