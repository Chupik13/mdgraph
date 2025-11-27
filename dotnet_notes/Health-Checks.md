**Tags**: #aspnet #devops #monitoring
**Links**: [[Docker]], [[Kubernetes]], [[Observability]], [[Dependency-Injection]]

---

### Health Checks

Health checks verify application and dependency status. Essential for container orchestration and load balancers.

**Setup:**
```csharp
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("database")
    .AddRedis(builder.Configuration.GetConnectionString("Redis")!, "redis")
    .AddUrlGroup(new Uri("https://api.external.com/health"), "external-api")
    .AddCheck<CustomHealthCheck>("custom");

app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false  // Always healthy if app is running
});
```

**Custom health check:**
```csharp
public class CustomHealthCheck : IHealthCheck
{
    private readonly IExternalService _service;

    public CustomHealthCheck(IExternalService service)
    {
        _service = service;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken ct = default)
    {
        try
        {
            var isHealthy = await _service.PingAsync(ct);

            return isHealthy
                ? HealthCheckResult.Healthy("Service is responsive")
                : HealthCheckResult.Degraded("Service is slow");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Service unavailable", ex);
        }
    }
}
```

**Kubernetes probes:**
```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 8080
  initialDelaySeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 8080
  initialDelaySeconds: 5
```

**UI dashboard:**
```csharp
builder.Services.AddHealthChecksUI()
    .AddInMemoryStorage();

app.MapHealthChecksUI();  // /healthchecks-ui
```

**Related:**
- [[Kubernetes]] - orchestration
- [[Docker]] - containerization
- [[Observability]] - monitoring
