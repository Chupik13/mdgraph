**Tags**: #ef #database #concurrency
**Links**: [[Entity-Framework]], [[Change-Tracking]], [[Optimistic-Concurrency]]

---

### EF Core Concurrency

Handle concurrent updates to prevent lost updates and ensure data integrity.

**Concurrency token:**
```csharp
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }

    [ConcurrencyCheck]
    public int Version { get; set; }
}

// Or with Fluent API
modelBuilder.Entity<Product>()
    .Property(p => p.Version)
    .IsConcurrencyToken();
```

**Row version (SQL Server):**
```csharp
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; }
}

// Fluent API
modelBuilder.Entity<Product>()
    .Property(p => p.RowVersion)
    .IsRowVersion();
```

**Handling concurrency conflicts:**
```csharp
try
{
    var product = await _context.Products.FindAsync(id);
    product.Price = newPrice;
    await _context.SaveChangesAsync();
}
catch (DbUpdateConcurrencyException ex)
{
    var entry = ex.Entries.Single();
    var databaseValues = await entry.GetDatabaseValuesAsync();

    if (databaseValues == null)
    {
        // Entity was deleted
        throw new NotFoundException("Product was deleted");
    }

    // Option 1: Database wins
    entry.OriginalValues.SetValues(databaseValues);
    await _context.SaveChangesAsync();

    // Option 2: Client wins
    entry.OriginalValues.SetValues(databaseValues);
    // Keep current values, retry save

    // Option 3: Merge values
    var databaseProduct = (Product)databaseValues.ToObject();
    // Merge logic...
}
```

**Pessimistic locking:**
```csharp
// SQL Server hints via raw SQL
var product = await _context.Products
    .FromSqlRaw("SELECT * FROM Products WITH (UPDLOCK) WHERE Id = {0}", id)
    .FirstOrDefaultAsync();
```

**Related:**
- [[Entity-Framework]] - EF Core basics
- [[Change-Tracking]] - entity tracking
- [[EF-Transactions]] - transactions

