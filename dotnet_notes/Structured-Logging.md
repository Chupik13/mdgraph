**Tags**: #logging #observability #best-practices
**Links**: [[Logging]], [[Serilog]], [[Correlation-Id]]

---

### Structured Logging

Structured logging captures log data as searchable properties, not just text. Essential for production debugging.

**Message templates (not interpolation):**
```csharp
// GOOD - structured
_logger.LogInformation("Order {OrderId} created for {CustomerId}", orderId, customerId);
// Output: Order 123 created for 456
// Properties: { OrderId: 123, CustomerId: 456 }

// BAD - loses structure
_logger.LogInformation($"Order {orderId} created for {customerId}");
// Output: Order 123 created for 456
// Properties: none - can't search!
```

**Property naming:**
```csharp
// PascalCase by convention
_logger.LogInformation("Processing {ItemCount} items for {UserName}", count, name);

// Destructure objects with @
_logger.LogInformation("Created order {@Order}", order);
// Captures all properties

// Stringify with $
_logger.LogInformation("User logged in: {$User}", user);
// Uses ToString()
```

**Scopes for context:**
```csharp
using (_logger.BeginScope(new Dictionary<string, object>
{
    ["OrderId"] = orderId,
    ["CustomerId"] = customerId
}))
{
    _logger.LogInformation("Starting order processing");
    // ... all logs in scope include OrderId and CustomerId
    _logger.LogInformation("Order processing complete");
}
```

**Correlation ID:** See [[Correlation-Id]]
```csharp
public class CorrelationIdMiddleware
{
    public async Task InvokeAsync(HttpContext context, ILogger<CorrelationIdMiddleware> logger)
    {
        var correlationId = context.Request.Headers["X-Correlation-Id"].FirstOrDefault()
            ?? Guid.NewGuid().ToString();

        using (logger.BeginScope(new { CorrelationId = correlationId }))
        {
            context.Response.Headers["X-Correlation-Id"] = correlationId;
            await _next(context);
        }
    }
}
```

**Querying in log systems:**
```
// Seq, Elasticsearch, etc.
OrderId = 123 AND Level = "Error"
CustomerId = 456 AND @Timestamp > "2024-01-01"
```

**Related:**
- [[Serilog]] - structured logging library
- [[Logging]] - logging basics
- [[Correlation-Id]] - request tracing
