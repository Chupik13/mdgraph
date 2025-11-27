**Tags**: #ef #database #patterns
**Links**: [[Entity-Framework]], [[Service-Lifetimes]], [[Change-Tracking]], [[Unit-of-Work]]

---

### DbContext

DbContext is the primary class for interacting with the database. It represents a session and provides DbSet<T> for querying and saving entities.

**Configuration:**
```csharp
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Fluent configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // Apply configurations from assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
```

**Lifetime:** See [[Service-Lifetimes]]
- Always use **Scoped** lifetime
- One context per HTTP request
- Never use Singleton!

**Change tracking:** See [[Change-Tracking]]
```csharp
var user = await context.Users.FindAsync(id);  // Tracked
user.Name = "New Name";
await context.SaveChangesAsync();  // Detects change, updates

// Disable tracking for read-only queries
var users = await context.Users.AsNoTracking().ToListAsync();
```

**SaveChanges:**
```csharp
// Single transaction
context.Users.Add(user1);
context.Users.Add(user2);
await context.SaveChangesAsync();  // Both in one transaction
```

**Related:**
- [[Change-Tracking]] - entity states
- [[Unit-of-Work]] - transaction pattern
- [[DbContext-Pooling]] - performance optimization
