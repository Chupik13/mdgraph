**Tags**: #aspnet #logging #middleware
**Links**: [[Middleware]], [[Structured-Logging]], [[Correlation-Id]]

---

### Request/Response Logging

Log HTTP requests and responses for debugging, auditing, and monitoring.

**Logging middleware:**
```csharp
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public async Task InvokeAsync(HttpContext context)
    {
        // Log request
        _logger.LogInformation(
            "HTTP {Method} {Path} started",
            context.Request.Method,
            context.Request.Path);

        var stopwatch = Stopwatch.StartNew();

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();

            _logger.LogInformation(
                "HTTP {Method} {Path} completed with {StatusCode} in {Elapsed}ms",
                context.Request.Method,
                context.Request.Path,
                context.Response.StatusCode,
                stopwatch.ElapsedMilliseconds);
        }
    }
}
```

**Log request body:**
```csharp
context.Request.EnableBuffering();
using var reader = new StreamReader(context.Request.Body, leaveOpen: true);
var body = await reader.ReadToEndAsync();
context.Request.Body.Position = 0;

_logger.LogDebug("Request body: {Body}", body);
```

**W3C logging (built-in):**
```csharp
builder.Services.AddW3CLogging(options =>
{
    options.LoggingFields = W3CLoggingFields.All;
    options.FileSizeLimit = 5 * 1024 * 1024;
    options.RetainedFileCountLimit = 10;
});

app.UseW3CLogging();
```

**Sensitive data redaction:**
```csharp
var sensitiveHeaders = new[] { "Authorization", "Cookie", "X-API-Key" };
var headers = context.Request.Headers
    .Where(h => !sensitiveHeaders.Contains(h.Key))
    .ToDictionary(h => h.Key, h => h.Value.ToString());
```

**Related:**
- [[Middleware]] - request pipeline
- [[Structured-Logging]] - structured logs
- [[Correlation-Id]] - request tracing

