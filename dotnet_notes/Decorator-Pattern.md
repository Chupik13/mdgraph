**Tags**: #patterns #structural #design
**Links**: [[Open-Closed]], [[Middleware]], [[Dependency-Injection]]

---

### Decorator Pattern

Decorator pattern wraps objects to add behavior without modifying the original class. Chain multiple decorators for combined functionality.

**Base interface and implementation:**
```csharp
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(int id);
    Task SaveAsync(Order order);
}

public class SqlOrderRepository : IOrderRepository
{
    public async Task<Order?> GetByIdAsync(int id)
        => await _context.Orders.FindAsync(id);

    public async Task SaveAsync(Order order)
        => await _context.SaveChangesAsync();
}
```

**Caching decorator:**
```csharp
public class CachingOrderRepository : IOrderRepository
{
    private readonly IOrderRepository _inner;
    private readonly IMemoryCache _cache;

    public CachingOrderRepository(IOrderRepository inner, IMemoryCache cache)
    {
        _inner = inner;
        _cache = cache;
    }

    public async Task<Order?> GetByIdAsync(int id)
    {
        return await _cache.GetOrCreateAsync($"order:{id}", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            return await _inner.GetByIdAsync(id);
        });
    }

    public async Task SaveAsync(Order order)
    {
        await _inner.SaveAsync(order);
        _cache.Remove($"order:{order.Id}");
    }
}
```

**Logging decorator:**
```csharp
public class LoggingOrderRepository : IOrderRepository
{
    private readonly IOrderRepository _inner;
    private readonly ILogger<LoggingOrderRepository> _logger;

    public async Task<Order?> GetByIdAsync(int id)
    {
        _logger.LogInformation("Getting order {OrderId}", id);
        var result = await _inner.GetByIdAsync(id);
        _logger.LogInformation("Retrieved order {OrderId}: {Found}", id, result != null);
        return result;
    }
}
```

**Registration with Scrutor:**
```csharp
builder.Services.AddScoped<IOrderRepository, SqlOrderRepository>();
builder.Services.Decorate<IOrderRepository, CachingOrderRepository>();
builder.Services.Decorate<IOrderRepository, LoggingOrderRepository>();
```

**Related:**
- [[Open-Closed]] - extend behavior without modification
- [[Middleware]] - similar pattern for request pipeline
- [[Dependency-Injection]] - decorator registration

