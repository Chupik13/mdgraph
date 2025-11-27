**Tags**: #architecture #distributed #patterns
**Links**: [[CAP-Theorem]], [[Distributed-Systems]], [[CQRS]]

---

### Eventual Consistency

Eventual consistency means all replicas will eventually have the same data, but not immediately. Common in distributed systems.

**Handling eventual consistency:**
```csharp
// Problem: Read-your-own-writes
await _orderService.CreateOrderAsync(order);
var order = await _orderService.GetOrderAsync(order.Id);
// Might return null if replica hasn't synced!

// Solution 1: Read from primary after write
var order = await _orderService.GetOrderAsync(order.Id, readFromPrimary: true);

// Solution 2: Optimistic UI
public async Task<Order> CreateOrderAsync(CreateOrderDto dto)
{
    var order = await _repository.CreateAsync(dto);
    // Return the created entity immediately
    // UI shows this while background sync happens
    return order;
}
```

**Dealing with stale reads:**
```csharp
// Add version/timestamp to detect staleness
public class Order
{
    public Guid Id { get; set; }
    public int Version { get; set; }
    public DateTime LastModified { get; set; }
}

// Client can detect stale data
if (order.LastModified < expectedTime)
{
    // Trigger refresh or show warning
}
```

**Event-driven synchronization:**
```csharp
// Publish change event
await _eventBus.PublishAsync(new OrderUpdated(order.Id, order.Status));

// Subscribers update their local state
public class InventoryEventHandler : IEventHandler<OrderUpdated>
{
    public async Task HandleAsync(OrderUpdated @event)
    {
        await _inventoryCache.InvalidateAsync(@event.OrderId);
    }
}
```

**Related:**
- [[CAP-Theorem]] - theoretical foundation
- [[CQRS]] - separate read/write models
- [[Event-Driven-Architecture]] - sync through events

