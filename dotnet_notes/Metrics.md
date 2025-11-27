**Tags**: #observability #monitoring #performance
**Links**: [[OpenTelemetry]], [[Health-Checks]], [[Benchmarking-DotNet]]

---

### Metrics

Metrics provide quantitative measurements of application behavior. Essential for monitoring and alerting.

**Built-in metrics (.NET 8+):**
```csharp
// Automatic ASP.NET Core metrics
builder.Services.AddOpenTelemetry()
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation()
        .AddRuntimeInstrumentation()
        .AddProcessInstrumentation());
```

**Custom metrics:**
```csharp
public class OrderMetrics
{
    private readonly Counter<int> _ordersCreated;
    private readonly Histogram<double> _orderValue;
    private readonly UpDownCounter<int> _activeOrders;

    public OrderMetrics(IMeterFactory meterFactory)
    {
        var meter = meterFactory.Create("MyApp.Orders");

        _ordersCreated = meter.CreateCounter<int>(
            "orders.created",
            description: "Number of orders created");

        _orderValue = meter.CreateHistogram<double>(
            "orders.value",
            unit: "USD",
            description: "Order values");

        _activeOrders = meter.CreateUpDownCounter<int>(
            "orders.active",
            description: "Currently processing orders");
    }

    public void RecordOrderCreated(string status, decimal value)
    {
        _ordersCreated.Add(1, new KeyValuePair<string, object?>("status", status));
        _orderValue.Record((double)value);
    }
}
```

**Prometheus endpoint:**
```csharp
builder.Services.AddOpenTelemetry()
    .WithMetrics(metrics => metrics
        .AddPrometheusExporter());

app.MapPrometheusScrapingEndpoint(); // /metrics
```

**Common metrics:**
- Request rate (requests/second)
- Error rate (errors/total)
- Latency (p50, p95, p99)
- Saturation (queue depth, connections)

**Related:**
- [[OpenTelemetry]] - observability standard
- [[Health-Checks]] - health monitoring
- [[Benchmarking-DotNet]] - performance measurement

