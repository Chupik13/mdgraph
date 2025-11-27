**Tags**: #aspnet #hosting #lifecycle
**Links**: [[Background-Services]], [[Worker-Services]], [[Application-Lifecycle]]

---

### IHostedService

IHostedService defines the contract for objects managed by the host. Two methods: StartAsync and StopAsync.

**Interface:**
```csharp
public interface IHostedService
{
    Task StartAsync(CancellationToken cancellationToken);
    Task StopAsync(CancellationToken cancellationToken);
}
```

**Simple implementation:**
```csharp
public class StartupInitializer : IHostedService
{
    private readonly IServiceScopeFactory _scopeFactory;

    public StartupInitializer(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var cache = scope.ServiceProvider.GetRequiredService<ICacheWarmer>();
        await cache.WarmUpAsync(cancellationToken);
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
```

**BackgroundService (abstract base):**
```csharp
// Simpler for long-running tasks
public abstract class BackgroundService : IHostedService
{
    protected abstract Task ExecuteAsync(CancellationToken stoppingToken);
}
```

**Lifecycle hooks (.NET 8+):**
```csharp
public interface IHostedLifecycleService : IHostedService
{
    Task StartingAsync(CancellationToken ct);   // Before StartAsync
    Task StartedAsync(CancellationToken ct);    // After StartAsync
    Task StoppingAsync(CancellationToken ct);   // Before StopAsync
    Task StoppedAsync(CancellationToken ct);    // After StopAsync
}
```

**Related:**
- [[Background-Services]] - long-running tasks
- [[Application-Lifecycle]] - startup/shutdown
- [[Dependency-Injection]] - scoped services in hosted services

