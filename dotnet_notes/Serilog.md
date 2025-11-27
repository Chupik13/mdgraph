**Tags**: #logging #observability #tools
**Links**: [[Logging]], [[Structured-Logging]], [[Seq]], [[Application-Insights]]

---

### Serilog

Serilog is a structured logging library for .NET with rich sink ecosystem.

**Setup:**
```csharp
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithThreadId()
    .WriteTo.Console(outputTemplate:
        "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.File("logs/app-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 30)
    .WriteTo.Seq("http://localhost:5341")
    .CreateLogger();

builder.Host.UseSerilog();
```

**Structured logging:**
```csharp
// Properties are captured, not just interpolated
_logger.LogInformation("Order {OrderId} created for {CustomerId} with {ItemCount} items",
    order.Id, order.CustomerId, order.Lines.Count);

// Object destructuring
_logger.LogInformation("Processing {@Order}", order);

// Exclude sensitive data
_logger.LogInformation("User {@User}", user, destructureObjects: true);
```

**Enrichers:**
```csharp
.Enrich.WithProperty("Application", "MyApp")
.Enrich.WithCorrelationId()
.Enrich.WithClientIp()
```

**Sinks (outputs):**
- Console - colored terminal output
- File - rolling file logs
- [[Seq]] - structured log server
- Elasticsearch - search and analytics
- [[Application-Insights]] - Azure monitoring
- Grafana Loki - log aggregation

**Request logging:**
```csharp
app.UseSerilogRequestLogging(options =>
{
    options.EnrichDiagnosticContext = (context, httpContext) =>
    {
        context.Set("UserId", httpContext.User.GetUserId());
    };
});
```

**Best practices:**
- Use message templates, not interpolation
- Destructure objects with `@`
- Filter sensitive data
- Use correlation IDs for tracing

**Related:**
- [[Structured-Logging]] - logging principles
- [[Seq]] - log server
- [[Correlation-Id]] - request tracing
