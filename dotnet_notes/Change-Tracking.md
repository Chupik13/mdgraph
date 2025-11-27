**Tags**: #ef #database #patterns
**Links**: [[DbContext]], [[Entity-Framework]], [[Unit-of-Work]], [[AsNoTracking]]

---

### EF Core Change Tracking

Change tracking monitors entity modifications to generate appropriate SQL on SaveChanges. Understanding it is key to EF performance.

**Entity states:**
```csharp
// Added - new entity, will INSERT
context.Users.Add(new User { Name = "Alice" });

// Unchanged - loaded, no changes
var user = await context.Users.FindAsync(1);

// Modified - property changed, will UPDATE
user.Name = "Bob";

// Deleted - marked for deletion, will DELETE
context.Users.Remove(user);

// Detached - not tracked
var detached = new User { Id = 1 };
```

**Checking state:**
```csharp
var entry = context.Entry(user);
Console.WriteLine(entry.State);  // EntityState enum

// What changed?
foreach (var prop in entry.Properties.Where(p => p.IsModified))
{
    Console.WriteLine($"{prop.Metadata.Name}: {prop.OriginalValue} -> {prop.CurrentValue}");
}
```

**Disabling tracking:** See [[AsNoTracking]]
```csharp
// No tracking - read-only queries
var users = await context.Users
    .AsNoTracking()
    .ToListAsync();

// Global no tracking
services.AddDbContext<AppDbContext>(options =>
    options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking));
```

**Explicit state control:**
```csharp
// Attach detached entity as modified
context.Entry(user).State = EntityState.Modified;

// Or specific properties
context.Entry(user).Property(u => u.Name).IsModified = true;
```

**Performance implications:**
- Tracked entities use memory
- Change detection runs on SaveChanges
- Use AsNoTracking for read-only queries
- Consider `ChangeTracker.AutoDetectChangesEnabled = false` for bulk operations

**Related:**
- [[AsNoTracking]] - read-only queries
- [[DbContext]] - context lifecycle
- [[Unit-of-Work]] - transaction pattern
