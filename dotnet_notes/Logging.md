**Tags**: #aspnet #observability #diagnostics
**Links**: [[Serilog]], [[Structured-Logging]], [[Log-Levels]], [[Application-Insights]]

---

### Logging in .NET

ASP.NET Core has built-in logging abstraction. Use ILogger<T> for dependency injection.

**Basic usage:**
```csharp
public class UserService
{
    private readonly ILogger<UserService> _logger;

    public UserService(ILogger<UserService> logger)
    {
        _logger = logger;
    }

    public async Task<User> GetUserAsync(int id)
    {
        _logger.LogInformation("Getting user {UserId}", id);

        try
        {
            var user = await _repository.GetByIdAsync(id);
            _logger.LogDebug("Found user {@User}", user);
            return user;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get user {UserId}", id);
            throw;
        }
    }
}
```

**Log levels:** See [[Log-Levels]]
- Trace - detailed debugging
- Debug - development info
- Information - general flow
- Warning - unexpected but handled
- Error - failures
- Critical - app crashes

**Configuration:**
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "MyApp.Services": "Debug"
    }
  }
}
```

**Structured logging:** See [[Structured-Logging]]
```csharp
// DO: Use message templates
_logger.LogInformation("Order {OrderId} created for {CustomerId}", orderId, customerId);

// DON'T: String interpolation (loses structure)
_logger.LogInformation($"Order {orderId} created for {customerId}");
```

**Serilog:** See [[Serilog]]
Popular logging library with many sinks (file, seq, elasticsearch).

**Related:**
- [[Serilog]] - advanced logging
- [[Structured-Logging]] - searchable logs
- [[Application-Insights]] - Azure monitoring
- [[Correlation-Id]] - request tracing
