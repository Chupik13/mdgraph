**Tags**: #async #concurrency #patterns
**Links**: [[Background-Services]], [[Producer-Consumer]], [[Task-Parallel-Library]], [[IAsyncEnumerable]]

---

### Channels

System.Threading.Channels provides high-performance, thread-safe producer-consumer queues. Ideal for background processing.

**Creating channels:**
```csharp
// Unbounded - unlimited capacity
var unbounded = Channel.CreateUnbounded<WorkItem>();

// Bounded - limited capacity
var bounded = Channel.CreateBounded<WorkItem>(new BoundedChannelOptions(100)
{
    FullMode = BoundedChannelFullMode.Wait,  // or DropOldest, DropNewest
    SingleReader = true,
    SingleWriter = false
});
```

**Producer:**
```csharp
public class WorkItemProducer
{
    private readonly Channel<WorkItem> _channel;

    public async Task EnqueueAsync(WorkItem item, CancellationToken ct = default)
    {
        await _channel.Writer.WriteAsync(item, ct);
    }

    public bool TryEnqueue(WorkItem item)
    {
        return _channel.Writer.TryWrite(item);
    }

    public void Complete()
    {
        _channel.Writer.Complete();
    }
}
```

**Consumer (background service):**
```csharp
public class WorkItemProcessor : BackgroundService
{
    private readonly Channel<WorkItem> _channel;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var item in _channel.Reader.ReadAllAsync(stoppingToken))
        {
            try
            {
                await ProcessAsync(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process {ItemId}", item.Id);
            }
        }
    }
}
```

**Registration:**
```csharp
builder.Services.AddSingleton(Channel.CreateUnbounded<WorkItem>());
builder.Services.AddSingleton(sp => sp.GetRequiredService<Channel<WorkItem>>().Reader);
builder.Services.AddSingleton(sp => sp.GetRequiredService<Channel<WorkItem>>().Writer);
builder.Services.AddHostedService<WorkItemProcessor>();
```

**Use cases:**
- Background job queues
- Event processing
- Rate limiting
- Buffering between async operations

**Related:**
- [[Background-Services]] - hosted services
- [[IAsyncEnumerable]] - async iteration
- [[Producer-Consumer]] - design pattern
