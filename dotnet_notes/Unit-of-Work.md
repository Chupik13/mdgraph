**Tags**: #architecture #patterns #data
**Links**: [[Repository-Pattern]], [[DbContext]], [[Transaction-Management]], [[Entity-Framework]]

---

### Unit of Work Pattern

Unit of Work maintains a list of objects affected by a business transaction and coordinates writing out changes as one atomic operation.

**DbContext IS Unit of Work:**
EF Core's DbContext already implements Unit of Work:
```csharp
// Multiple changes, one transaction
context.Users.Add(user);
context.Orders.Add(order);
context.Logs.Add(log);
await context.SaveChangesAsync();  // All or nothing
```

**Explicit Unit of Work:**
```csharp
public interface IUnitOfWork
{
    IUserRepository Users { get; }
    IOrderRepository Orders { get; }
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
        Users = new UserRepository(context);
        Orders = new OrderRepository(context);
    }

    public IUserRepository Users { get; }
    public IOrderRepository Orders { get; }

    public Task<int> SaveChangesAsync(CancellationToken ct)
        => _context.SaveChangesAsync(ct);
}
```

**Usage in service:**
```csharp
public class OrderService
{
    private readonly IUnitOfWork _uow;

    public async Task CreateOrder(CreateOrderDto dto)
    {
        var user = await _uow.Users.GetByIdAsync(dto.UserId);
        var order = new Order(user);

        await _uow.Orders.AddAsync(order);
        await _uow.SaveChangesAsync();  // Single commit
    }
}
```

**When to use explicit UoW:**
- Multiple repositories need coordination
- Want to abstract away DbContext
- Complex transaction boundaries

**Related:**
- [[Repository-Pattern]] - data access abstraction
- [[DbContext]] - built-in UoW
- [[Transaction-Management]] - transaction control
