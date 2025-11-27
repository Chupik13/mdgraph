**Tags**: #observability #tracing #best-practices
**Links**: [[Structured-Logging]], [[Distributed-Systems]], [[Middleware]]

---

### Correlation ID

Correlation IDs trace requests across services and log entries. Essential for debugging distributed systems.

**Middleware implementation:**
```csharp
public class CorrelationIdMiddleware
{
    private const string Header = "X-Correlation-Id";

    public async Task InvokeAsync(HttpContext context, ILogger<CorrelationIdMiddleware> logger)
    {
        var correlationId = context.Request.Headers[Header].FirstOrDefault()
            ?? Guid.NewGuid().ToString();

        context.Items["CorrelationId"] = correlationId;
        context.Response.Headers[Header] = correlationId;

        using (logger.BeginScope(new Dictionary<string, object>
        {
            ["CorrelationId"] = correlationId
        }))
        {
            await _next(context);
        }
    }
}
```

**Propagate to downstream services:**
```csharp
public class CorrelationIdHandler : DelegatingHandler
{
    private readonly IHttpContextAccessor _accessor;

    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        if (_accessor.HttpContext?.Items["CorrelationId"] is string correlationId)
        {
            request.Headers.Add("X-Correlation-Id", correlationId);
        }

        return base.SendAsync(request, cancellationToken);
    }
}

// Register
builder.Services.AddHttpClient<IApiClient, ApiClient>()
    .AddHttpMessageHandler<CorrelationIdHandler>();
```

**Usage in logs:**
```csharp
// All logs automatically include CorrelationId from scope
_logger.LogInformation("Processing order {OrderId}", orderId);
// Output: {"CorrelationId": "abc-123", "OrderId": 456, "Message": "..."}
```

**Related:**
- [[Structured-Logging]] - structured log data
- [[Distributed-Systems]] - cross-service tracing
- [[Middleware]] - request pipeline

