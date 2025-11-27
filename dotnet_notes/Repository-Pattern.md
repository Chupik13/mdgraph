**Tags**: #architecture #patterns #data
**Links**: [[Entity-Framework]], [[Unit-of-Work]], [[Clean-Architecture]], [[Generic-Repository]]

---

### Repository Pattern

Repository abstracts data access, providing a collection-like interface for domain objects. Decouples business logic from persistence.

**Interface:**
```csharp
public interface IRepository<T> where T : Entity
{
    Task<T?> GetByIdAsync(int id);
    Task<IReadOnlyList<T>> GetAllAsync();
    Task AddAsync(T entity);
    void Update(T entity);
    void Remove(T entity);
}

// Specific repository
public interface IOrderRepository : IRepository<Order>
{
    Task<IReadOnlyList<Order>> GetByCustomerAsync(int customerId);
    Task<Order?> GetWithLinesAsync(int orderId);
}
```

**Implementation:**
```csharp
public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _context;

    public OrderRepository(AppDbContext context) => _context = context;

    public async Task<Order?> GetByIdAsync(int id)
        => await _context.Orders.FindAsync(id);

    public async Task<Order?> GetWithLinesAsync(int orderId)
        => await _context.Orders
            .Include(o => o.Lines)
            .FirstOrDefaultAsync(o => o.Id == orderId);

    public async Task AddAsync(Order entity)
        => await _context.Orders.AddAsync(entity);

    public void Update(Order entity)
        => _context.Orders.Update(entity);
}
```

**Generic repository:** See [[Generic-Repository]]
Often debated - can become a leaky abstraction.

**Best practices:**
- Don't expose IQueryable (leaky abstraction)
- Return domain objects, not DTOs
- Combine with [[Unit-of-Work]] for transactions
- Keep repositories focused on aggregates

**Controversy:**
Some argue EF's DbSet IS a repository. Consider if abstraction adds value for your project.

**Related:**
- [[Unit-of-Work]] - transaction management
- [[Specification-Pattern]] - query encapsulation
- [[Generic-Repository]] - pros and cons
