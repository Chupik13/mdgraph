**Tags**: #patterns #creational #design
**Links**: [[Dependency-Injection]], [[Strategy-Pattern]], [[Abstract-Factory]]

---

### Factory Pattern

Factory pattern encapsulates object creation. Use when creation logic is complex or depends on runtime conditions.

**Simple factory:**
```csharp
public interface INotificationSender
{
    Task SendAsync(string message);
}

public class NotificationFactory
{
    public INotificationSender Create(NotificationType type) => type switch
    {
        NotificationType.Email => new EmailSender(),
        NotificationType.Sms => new SmsSender(),
        NotificationType.Push => new PushSender(),
        _ => throw new ArgumentException($"Unknown type: {type}")
    };
}
```

**Factory with DI:**
```csharp
public class OrderProcessorFactory
{
    private readonly IServiceProvider _services;

    public OrderProcessorFactory(IServiceProvider services)
    {
        _services = services;
    }

    public IOrderProcessor Create(Order order)
    {
        return order.Priority switch
        {
            Priority.High => _services.GetRequiredService<PriorityProcessor>(),
            Priority.Normal => _services.GetRequiredService<StandardProcessor>(),
            _ => _services.GetRequiredService<BatchProcessor>()
        };
    }
}
```

**Generic factory:**
```csharp
public interface IFactory<T>
{
    T Create();
}

public class ConnectionFactory : IFactory<IDbConnection>
{
    private readonly string _connectionString;

    public ConnectionFactory(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default")!;
    }

    public IDbConnection Create() => new SqlConnection(_connectionString);
}
```

**Func factory (built-in):**
```csharp
builder.Services.AddTransient<Func<OrderType, IOrderHandler>>(sp => type =>
{
    return type switch
    {
        OrderType.Standard => sp.GetRequiredService<StandardHandler>(),
        OrderType.Express => sp.GetRequiredService<ExpressHandler>(),
        _ => throw new NotSupportedException()
    };
});
```

**Related:**
- [[Dependency-Injection]] - DI integration
- [[Strategy-Pattern]] - runtime algorithm selection
- [[Abstract-Factory]] - families of objects

