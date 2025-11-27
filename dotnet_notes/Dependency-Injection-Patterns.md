**Tags**: #di #patterns #architecture
**Links**: [[Dependency-Injection]], [[Service-Lifetimes]], [[Factory-Pattern]], [[Options-Pattern]]

---

### DI Registration Patterns

Advanced patterns for registering services in ASP.NET Core's DI container.

**Multiple implementations:**
```csharp
// Register multiple implementations
services.AddTransient<INotifier, EmailNotifier>();
services.AddTransient<INotifier, SmsNotifier>();
services.AddTransient<INotifier, PushNotifier>();

// Inject all
public class NotificationService(IEnumerable<INotifier> notifiers)
{
    public async Task NotifyAllAsync(string message)
    {
        foreach (var notifier in notifiers)
            await notifier.SendAsync(message);
    }
}
```

**Keyed services (.NET 8):**
```csharp
services.AddKeyedScoped<IStorage, S3Storage>("s3");
services.AddKeyedScoped<IStorage, AzureStorage>("azure");
services.AddKeyedScoped<IStorage, LocalStorage>("local");

public class FileService([FromKeyedServices("s3")] IStorage storage)
{
    // Uses S3 storage
}
```

**Factory pattern:**
```csharp
services.AddTransient<IOrderProcessor>(sp =>
{
    var config = sp.GetRequiredService<IOptions<ProcessorConfig>>();
    var logger = sp.GetRequiredService<ILogger<OrderProcessor>>();

    return config.Value.UseAsync
        ? new AsyncOrderProcessor(logger)
        : new SyncOrderProcessor(logger);
});
```

**Decorator pattern:**
```csharp
services.AddScoped<IUserRepository, UserRepository>();
services.Decorate<IUserRepository, CachedUserRepository>();
services.Decorate<IUserRepository, LoggingUserRepository>();

// Resolves: Logging → Cached → UserRepository
```

**Open generics:**
```csharp
services.AddTransient(typeof(IRepository<>), typeof(Repository<>));

// IRepository<User> → Repository<User>
// IRepository<Order> → Repository<Order>
```

**Conditional registration:**
```csharp
services.TryAddScoped<IService, Service>();  // Only if not already registered
services.TryAddEnumerable(ServiceDescriptor.Scoped<IService, AnotherService>());
```

**Related:**
- [[Dependency-Injection]] - DI basics
- [[Service-Lifetimes]] - lifetime choices
- [[Factory-Pattern]] - complex creation
