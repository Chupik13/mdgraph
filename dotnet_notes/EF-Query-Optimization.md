**Tags**: #ef #performance #database
**Links**: [[Entity-Framework]], [[IQueryable]], [[N-Plus-One]], [[Indexing]]

---

### EF Query Optimization

EF Core query performance is critical for application responsiveness. Common issues and solutions.

**Use AsNoTracking for read-only:**
```csharp
// Tracked (slower, more memory)
var users = await context.Users.ToListAsync();

// Not tracked (faster, less memory)
var users = await context.Users.AsNoTracking().ToListAsync();
```

**Avoid N+1 queries:** See [[N-Plus-One]]
```csharp
// BAD: N+1 queries
var orders = await context.Orders.ToListAsync();
foreach (var order in orders)
{
    Console.WriteLine(order.Customer.Name);  // Query per order!
}

// GOOD: Eager loading
var orders = await context.Orders
    .Include(o => o.Customer)
    .ToListAsync();
```

**Select only needed columns:**
```csharp
// BAD: Loads all columns
var users = await context.Users.ToListAsync();

// GOOD: Project to DTO
var users = await context.Users
    .Select(u => new UserDto { Id = u.Id, Name = u.Name })
    .ToListAsync();
```

**Pagination:**
```csharp
var page = await context.Products
    .OrderBy(p => p.Name)
    .Skip((pageNumber - 1) * pageSize)
    .Take(pageSize)
    .ToListAsync();
```

**Split queries (for large includes):**
```csharp
var blogs = await context.Blogs
    .Include(b => b.Posts)
    .AsSplitQuery()  // Separate query per include
    .ToListAsync();
```

**Raw SQL when needed:**
```csharp
var users = await context.Users
    .FromSqlRaw("SELECT * FROM Users WHERE CONTAINS(Name, {0})", searchTerm)
    .ToListAsync();
```

**Related:**
- [[N-Plus-One]] - common performance killer
- [[Indexing]] - database indexes
- [[Compiled-Queries]] - query caching
- [[EF-Logging]] - see generated SQL
