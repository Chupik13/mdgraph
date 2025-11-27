**Tags**: #logging #observability #fundamentals
**Links**: [[Logging]], [[Structured-Logging]], [[Serilog]]

---

### Logging Levels

Logging levels categorize log messages by severity. Use appropriate levels for effective debugging and monitoring.

**Level hierarchy (lowest to highest):**
```csharp
_logger.LogTrace("Entering method with param: {Param}", param);      // Verbose debugging
_logger.LogDebug("Cache miss for key: {Key}", key);                  // Debugging info
_logger.LogInformation("User {UserId} logged in", userId);           // Normal operations
_logger.LogWarning("Retry attempt {Attempt} for {Operation}", n, op); // Potential issues
_logger.LogError(ex, "Failed to process order {OrderId}", orderId);   // Errors
_logger.LogCritical(ex, "Database connection lost");                  // System failures
```

**Configuration:**
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning",
      "MyApp.Services": "Debug"
    }
  }
}
```

**Best practices:**
```csharp
// Use appropriate level
_logger.LogInformation("Order created");        // Normal operation
_logger.LogWarning("Order retry #{Attempt}", n); // Something unusual
_logger.LogError(ex, "Order failed");           // Actual error

// Include context
_logger.LogInformation(
    "Processing order {OrderId} for customer {CustomerId} with {ItemCount} items",
    order.Id, order.CustomerId, order.Items.Count);

// Log at boundaries
public async Task<Order> ProcessOrderAsync(Order order)
{
    _logger.LogInformation("Processing order {OrderId}", order.Id);
    try
    {
        // ... processing
        _logger.LogInformation("Order {OrderId} processed successfully", order.Id);
        return order;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Order {OrderId} processing failed", order.Id);
        throw;
    }
}
```

**Related:**
- [[Logging]] - logging basics
- [[Structured-Logging]] - structured data
- [[Correlation-Id]] - request tracing

