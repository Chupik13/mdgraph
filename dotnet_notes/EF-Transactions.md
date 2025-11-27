**Tags**: #ef #database #transactions
**Links**: [[Entity-Framework]], [[DbContext]], [[Unit-of-Work]]

---

### EF Core Transactions

Transactions ensure data consistency by grouping operations that must succeed or fail together.

**Implicit transactions:**
```csharp
// SaveChanges creates a transaction automatically
_context.Orders.Add(order);
_context.Inventory.Update(inventory);
await _context.SaveChangesAsync(); // All or nothing
```

**Explicit transactions:**
```csharp
await using var transaction = await _context.Database.BeginTransactionAsync();

try
{
    var order = new Order { CustomerId = customerId };
    _context.Orders.Add(order);
    await _context.SaveChangesAsync();

    // External service call
    await _paymentService.ChargeAsync(order.Id, total);

    _context.OrderStatus.Add(new OrderStatus { OrderId = order.Id, Status = "Paid" });
    await _context.SaveChangesAsync();

    await transaction.CommitAsync();
}
catch
{
    await transaction.RollbackAsync();
    throw;
}
```

**Transaction isolation levels:**
```csharp
await using var transaction = await _context.Database.BeginTransactionAsync(
    IsolationLevel.Serializable);
```

**Savepoints:**
```csharp
await using var transaction = await _context.Database.BeginTransactionAsync();

await _context.SaveChangesAsync();
await transaction.CreateSavepointAsync("AfterFirstSave");

try
{
    await _context.SaveChangesAsync();
}
catch
{
    await transaction.RollbackToSavepointAsync("AfterFirstSave");
}

await transaction.CommitAsync();
```

**Cross-context transactions:**
```csharp
await using var connection = new SqlConnection(connectionString);
await connection.OpenAsync();
await using var transaction = await connection.BeginTransactionAsync();

var context1 = new DbContext1(new DbContextOptionsBuilder<DbContext1>()
    .UseSqlServer(connection).Options);
context1.Database.UseTransaction(transaction);

var context2 = new DbContext2(new DbContextOptionsBuilder<DbContext2>()
    .UseSqlServer(connection).Options);
context2.Database.UseTransaction(transaction);
```

**Related:**
- [[Entity-Framework]] - EF Core basics
- [[DbContext]] - context management
- [[Unit-of-Work]] - transaction pattern

