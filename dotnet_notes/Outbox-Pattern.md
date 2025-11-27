**Tags**: #architecture #patterns #messaging
**Links**: [[Domain-Events]], [[Event-Sourcing]], [[Message-Queues]], [[Eventual-Consistency]]

---

### Outbox Pattern

The outbox pattern ensures reliable message delivery by storing messages in the same transaction as domain changes.

**Problem:**
```csharp
// UNRELIABLE - if message send fails, inconsistent state
await _repository.SaveAsync(order);
await _messageBus.PublishAsync(new OrderCreatedEvent(order.Id));  // Might fail!
```

**Solution - Outbox table:**
```csharp
public class OutboxMessage
{
    public Guid Id { get; set; }
    public string Type { get; set; }
    public string Payload { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
}
```

**Saving with outbox:**
```csharp
public class OrderService
{
    public async Task CreateOrderAsync(Order order)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        _context.Orders.Add(order);

        var outboxMessage = new OutboxMessage
        {
            Id = Guid.NewGuid(),
            Type = nameof(OrderCreatedEvent),
            Payload = JsonSerializer.Serialize(new OrderCreatedEvent(order.Id)),
            CreatedAt = DateTime.UtcNow
        };
        _context.OutboxMessages.Add(outboxMessage);

        await _context.SaveChangesAsync();  // Atomic!
        await transaction.CommitAsync();
    }
}
```

**Background processor:**
```csharp
public class OutboxProcessor : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            var messages = await _context.OutboxMessages
                .Where(m => m.ProcessedAt == null)
                .OrderBy(m => m.CreatedAt)
                .Take(100)
                .ToListAsync(ct);

            foreach (var message in messages)
            {
                await _messageBus.PublishAsync(message.Type, message.Payload);
                message.ProcessedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync(ct);
            await Task.Delay(TimeSpan.FromSeconds(5), ct);
        }
    }
}
```

**Benefits:**
- Guaranteed message delivery
- At-least-once semantics
- No distributed transactions needed

**Related:**
- [[Domain-Events]] - event patterns
- [[Event-Sourcing]] - event persistence
- [[Eventual-Consistency]] - consistency model
