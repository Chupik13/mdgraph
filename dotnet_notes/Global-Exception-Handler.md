**Tags**: #aspnet #error-handling #patterns
**Links**: [[Exception-Handling]], [[Problem-Details]], [[Middleware]], [[Logging]]

---

### Global Exception Handler

Centralized exception handling in ASP.NET Core catches unhandled exceptions and returns consistent error responses.

**Exception handler middleware:**
```csharp
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exceptionFeature = context.Features.Get<IExceptionHandlerFeature>();
        var exception = exceptionFeature?.Error;

        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        logger.LogError(exception, "Unhandled exception");

        var problemDetails = exception switch
        {
            NotFoundException e => new ProblemDetails
            {
                Status = 404,
                Title = "Not Found",
                Detail = e.Message
            },
            ValidationException e => new ProblemDetails
            {
                Status = 400,
                Title = "Validation Error",
                Detail = e.Message
            },
            _ => new ProblemDetails
            {
                Status = 500,
                Title = "Server Error",
                Detail = "An unexpected error occurred"
            }
        };

        context.Response.StatusCode = problemDetails.Status ?? 500;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsJsonAsync(problemDetails);
    });
});
```

**IExceptionHandler (.NET 8+):**
```csharp
public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public async ValueTask<bool> TryHandleAsync(
        HttpContext context,
        Exception exception,
        CancellationToken ct)
    {
        _logger.LogError(exception, "Unhandled exception");

        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "Server Error"
        };

        context.Response.StatusCode = problemDetails.Status.Value;
        await context.Response.WriteAsJsonAsync(problemDetails, ct);

        return true;  // Exception handled
    }
}

// Registration
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

app.UseExceptionHandler();
```

**Related:**
- [[Problem-Details]] - RFC 7807 format
- [[Exception-Handling]] - handling strategies
- [[Middleware]] - request pipeline
