**Tags**: #aspnet #async #patterns
**Links**: [[IHostedService]], [[Worker-Service]], [[Channels]], [[Message-Queues]]

---

### Background Services

Background services run tasks independently of HTTP requests. Built on IHostedService.

**Basic hosted service:**
```csharp
public class CleanupService : BackgroundService
{
    private readonly ILogger<CleanupService> _logger;
    private readonly IServiceProvider _services;

    public CleanupService(ILogger<CleanupService> logger, IServiceProvider services)
    {
        _logger = logger;
        _services = services;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Running cleanup at {Time}", DateTime.UtcNow);

            using var scope = _services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await dbContext.CleanupOldRecordsAsync();

            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }
}

// Registration
builder.Services.AddHostedService<CleanupService>();
```

**Queue processor:**
```csharp
public class QueueProcessor : BackgroundService
{
    private readonly Channel<WorkItem> _queue;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var item in _queue.Reader.ReadAllAsync(stoppingToken))
        {
            try
            {
                await ProcessAsync(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing {ItemId}", item.Id);
            }
        }
    }
}
```

**Important patterns:**
- Create scope for scoped services (DbContext!)
- Handle exceptions - don't crash the host
- Respect cancellation token
- Use [[Channels]] for in-memory queues

**Graceful shutdown:**
```csharp
public override async Task StopAsync(CancellationToken cancellationToken)
{
    _logger.LogInformation("Stopping service, completing pending work...");
    await base.StopAsync(cancellationToken);
}
```

**Related:**
- [[IHostedService]] - hosting abstraction
- [[Worker-Service]] - standalone workers
- [[Channels]] - in-memory queues
- [[Hangfire]] - job scheduling
