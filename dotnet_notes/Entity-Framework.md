**Tags**: #ef #database #orm
**Links**: [[DbContext]], [[Migrations]], [[EF-Query-Optimization]], [[Repository-Pattern]], [[LINQ]]

---

### Entity Framework Core

EF Core is an ORM (Object-Relational Mapper) for .NET. It maps C# classes to database tables and LINQ queries to SQL.

**Setup:**
```csharp
// DbContext
public class AppDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}

// Registration
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));
```

**Basic operations:**
```csharp
// Query
var users = await context.Users
    .Where(u => u.IsActive)
    .ToListAsync();

// Insert
context.Users.Add(new User { Name = "Alice" });
await context.SaveChangesAsync();

// Update
var user = await context.Users.FindAsync(id);
user.Name = "Bob";
await context.SaveChangesAsync();

// Delete
context.Users.Remove(user);
await context.SaveChangesAsync();
```

**Key concepts:**
- [[DbContext]] - database session
- [[Migrations]] - schema management
- [[Change-Tracking]] - entity state
- [[Relationships]] - navigation properties
- [[EF-Query-Optimization]] - performance

**Related:**
- [[DbContext]] - context configuration
- [[Migrations]] - database versioning
- [[Code-First]] - model-first approach
- [[EF-Query-Optimization]] - query performance
