**Tags**: #observability #tracing #monitoring
**Links**: [[Structured-Logging]], [[Correlation-Id]], [[Metrics]]

---

### OpenTelemetry

OpenTelemetry is the standard for distributed tracing, metrics, and logs. Vendor-neutral observability.

**Setup:**
```csharp
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource
        .AddService("MyService"))
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddEntityFrameworkCoreInstrumentation()
        .AddOtlpExporter())
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddOtlpExporter());
```

**Custom spans:**
```csharp
public class OrderService
{
    private static readonly ActivitySource ActivitySource = new("MyService.Orders");

    public async Task ProcessOrderAsync(Order order)
    {
        using var activity = ActivitySource.StartActivity("ProcessOrder");
        activity?.SetTag("order.id", order.Id);
        activity?.SetTag("order.total", order.Total);

        try
        {
            await ValidateOrderAsync(order);
            await ChargePaymentAsync(order);
            activity?.SetStatus(ActivityStatusCode.Ok);
        }
        catch (Exception ex)
        {
            activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
            activity?.RecordException(ex);
            throw;
        }
    }
}
```

**Custom metrics:**
```csharp
private static readonly Meter Meter = new("MyService");
private static readonly Counter<int> OrdersCreated = Meter.CreateCounter<int>("orders.created");
private static readonly Histogram<double> OrderProcessingTime =
    Meter.CreateHistogram<double>("orders.processing_time", "ms");

public async Task CreateOrderAsync(Order order)
{
    var sw = Stopwatch.StartNew();
    // ... create order
    OrdersCreated.Add(1, new KeyValuePair<string, object?>("status", "success"));
    OrderProcessingTime.Record(sw.ElapsedMilliseconds);
}
```

**Related:**
- [[Structured-Logging]] - log correlation
- [[Correlation-Id]] - request tracing
- [[Metrics]] - application metrics

