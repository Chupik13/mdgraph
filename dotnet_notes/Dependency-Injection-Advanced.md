**Tags**: #di #advanced #patterns
**Links**: [[Dependency-Injection]], [[Service-Lifetimes]], [[Factory-Pattern]]

---

### Dependency Injection Advanced

Advanced DI patterns for complex scenarios beyond basic registration.

**Keyed services (.NET 8+):**
```csharp
builder.Services.AddKeyedSingleton<ICache, RedisCache>("redis");
builder.Services.AddKeyedSingleton<ICache, MemoryCache>("memory");

public class CacheService([FromKeyedServices("redis")] ICache cache)
{
    // Uses RedisCache
}
```

**Factory registration:**
```csharp
builder.Services.AddTransient<IOrderProcessor>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var logger = sp.GetRequiredService<ILogger<OrderProcessor>>();

    return config["ProcessorType"] switch
    {
        "fast" => new FastOrderProcessor(logger),
        "batch" => new BatchOrderProcessor(logger),
        _ => new StandardOrderProcessor(logger)
    };
});
```

**Decorator pattern:**
```csharp
// Register base
builder.Services.AddScoped<IRepository, SqlRepository>();

// Wrap with decorator
builder.Services.Decorate<IRepository, CachingRepositoryDecorator>();
builder.Services.Decorate<IRepository, LoggingRepositoryDecorator>();
// Resolution order: Logging -> Caching -> Sql
```

**Multiple implementations:**
```csharp
builder.Services.AddTransient<INotificationSender, EmailSender>();
builder.Services.AddTransient<INotificationSender, SmsSender>();
builder.Services.AddTransient<INotificationSender, PushSender>();

// Inject all
public class NotificationService(IEnumerable<INotificationSender> senders)
{
    public async Task NotifyAsync(string message)
    {
        foreach (var sender in senders)
            await sender.SendAsync(message);
    }
}
```

**Lazy initialization:**
```csharp
public class ExpensiveService(Lazy<IDatabase> database)
{
    public void DoWork()
    {
        // Database only created when .Value accessed
        var db = database.Value;
    }
}
```

**Related:**
- [[Dependency-Injection]] - DI basics
- [[Service-Lifetimes]] - scopes
- [[Factory-Pattern]] - creation patterns

