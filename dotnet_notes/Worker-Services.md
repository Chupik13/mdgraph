**Tags**: #dotnet #hosting #background
**Links**: [[Background-Services]], [[IHostedService]], [[Docker]]

---

### Worker Services

Worker services are .NET applications designed for background processing without a web server.

**Create worker service:**
```bash
dotnet new worker -n MyWorker
```

**Program.cs:**
```csharp
var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();
```

**Worker implementation:**
```csharp
public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IMessageQueue _queue;

    public Worker(ILogger<Worker> logger, IMessageQueue queue)
    {
        _logger = logger;
        _queue = queue;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Worker starting");

        while (!stoppingToken.IsCancellationRequested)
        {
            var message = await _queue.DequeueAsync(stoppingToken);
            if (message != null)
            {
                await ProcessMessageAsync(message, stoppingToken);
            }
        }

        _logger.LogInformation("Worker stopping");
    }
}
```

**Running as Windows Service:**
```csharp
builder.Services.AddWindowsService(options =>
{
    options.ServiceName = "My Worker Service";
});
```

**Running as Linux systemd:**
```csharp
builder.Services.AddSystemd();
```

**Related:**
- [[Background-Services]] - hosted service pattern
- [[Docker]] - containerized workers
- [[Health-Checks]] - monitoring workers

