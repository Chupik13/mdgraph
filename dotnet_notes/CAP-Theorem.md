**Tags**: #architecture #distributed #theory
**Links**: [[Distributed-Systems]], [[Eventual-Consistency]], [[Database]]

---

### CAP Theorem

CAP theorem states a distributed system can only guarantee two of: Consistency, Availability, Partition tolerance.

**The three properties:**
- **Consistency**: All nodes see same data at same time
- **Availability**: Every request gets a response
- **Partition tolerance**: System works despite network failures

**Trade-offs:**

**CP (Consistency + Partition tolerance):**
```csharp
// Strong consistency, may be unavailable during partitions
// Example: Traditional SQL with synchronous replication
await using var transaction = await _connection.BeginTransactionAsync();
await _primary.ExecuteAsync("UPDATE ...");
await _replica.ExecuteAsync("UPDATE ..."); // Waits for sync
await transaction.CommitAsync();
```

**AP (Availability + Partition tolerance):**
```csharp
// Always available, eventually consistent
// Example: NoSQL databases with async replication
await _database.InsertAsync(document); // Returns immediately
// Replicas catch up eventually
```

**In practice:**
```csharp
// Most systems choose "tunable consistency"
public class OrderRepository
{
    // Write to primary (strong consistency for writes)
    public async Task CreateAsync(Order order)
        => await _primaryDb.Orders.AddAsync(order);

    // Read from replica (eventual consistency, but fast)
    public async Task<Order?> GetAsync(Guid id)
        => await _replicaDb.Orders.FindAsync(id);

    // Read from primary when consistency matters
    public async Task<Order?> GetForUpdateAsync(Guid id)
        => await _primaryDb.Orders.FindAsync(id);
}
```

**Related:**
- [[Distributed-Systems]] - distributed challenges
- [[Eventual-Consistency]] - AP model
- [[Database]] - storage patterns

