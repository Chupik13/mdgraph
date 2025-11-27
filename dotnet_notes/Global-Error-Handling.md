**Tags**: #aspnet #error-handling #middleware
**Links**: [[Exception-Handling]], [[Problem-Details]], [[Middleware]]

---

### Global Error Handling

Centralized error handling catches all unhandled exceptions and returns consistent error responses.

**Exception handler middleware:**
```csharp
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.ContentType = "application/problem+json";

        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();

        var (statusCode, title) = exception switch
        {
            NotFoundException => (404, "Not Found"),
            ValidationException => (400, "Validation Error"),
            UnauthorizedException => (401, "Unauthorized"),
            _ => (500, "Internal Server Error")
        };

        logger.LogError(exception, "Unhandled exception: {Message}", exception?.Message);

        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = exception?.Message,
            Instance = context.Request.Path
        });
    });
});
```

**Custom exception filter (MVC):**
```csharp
public class GlobalExceptionFilter : IExceptionFilter
{
    private readonly ILogger<GlobalExceptionFilter> _logger;

    public void OnException(ExceptionContext context)
    {
        _logger.LogError(context.Exception, "Unhandled exception");

        context.Result = context.Exception switch
        {
            NotFoundException => new NotFoundObjectResult(new { Error = context.Exception.Message }),
            ValidationException => new BadRequestObjectResult(new { Errors = GetErrors(context.Exception) }),
            _ => new ObjectResult(new { Error = "An error occurred" }) { StatusCode = 500 }
        };

        context.ExceptionHandled = true;
    }
}

// Register
builder.Services.AddControllers(options =>
{
    options.Filters.Add<GlobalExceptionFilter>();
});
```

**Development vs Production:**
```csharp
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/error");
}
```

**Related:**
- [[Exception-Handling]] - exception patterns
- [[Problem-Details]] - error format
- [[Middleware]] - error middleware

