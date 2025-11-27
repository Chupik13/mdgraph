**Tags**: #ef #performance #anti-patterns
**Links**: [[EF-Query-Optimization]], [[Entity-Framework]], [[Eager-Loading]]

---

### N+1 Query Problem

N+1 is a common performance anti-pattern where loading N entities results in N+1 database queries instead of 1-2.

**The problem:**
```csharp
// 1 query to get orders
var orders = await context.Orders.ToListAsync();

// N queries to get customers (one per order!)
foreach (var order in orders)
{
    Console.WriteLine(order.Customer.Name);  // Lazy load triggers query
}
```

**Result:** If you have 100 orders, you execute 101 queries!

**Solution 1: Eager Loading (Include)**
```csharp
var orders = await context.Orders
    .Include(o => o.Customer)
    .ToListAsync();
// 1 query with JOIN
```

**Solution 2: Projection**
```csharp
var orderDtos = await context.Orders
    .Select(o => new OrderDto
    {
        Id = o.Id,
        CustomerName = o.Customer.Name
    })
    .ToListAsync();
// 1 query, only needed columns
```

**Solution 3: Split Query**
```csharp
var orders = await context.Orders
    .Include(o => o.OrderLines)
    .AsSplitQuery()  // 2 queries instead of cartesian product
    .ToListAsync();
```

**Detection:**
- Enable EF logging to see queries
- Use MiniProfiler or similar
- Look for repeated similar queries

```csharp
// In Program.cs
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString)
           .LogTo(Console.WriteLine, LogLevel.Information));
```

**Related:**
- [[EF-Query-Optimization]] - query best practices
- [[Eager-Loading]] - Include strategy
- [[Lazy-Loading]] - why to avoid
