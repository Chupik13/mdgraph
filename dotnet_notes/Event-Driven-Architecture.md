**Tags**: #architecture #patterns #events
**Links**: [[Domain-Events]], [[Message-Queue]], [[CQRS]]

---

### Event-Driven Architecture

Event-driven architecture uses events to trigger and communicate between decoupled services.

**Event types:**

**Domain events (within bounded context):**
```csharp
public record OrderPlaced(Guid OrderId, Guid CustomerId, decimal Total);

// Published and handled in same process
await _mediator.Publish(new OrderPlaced(order.Id, order.CustomerId, order.Total));
```

**Integration events (between services):**
```csharp
public record OrderPlacedIntegrationEvent(
    Guid OrderId,
    string CustomerEmail,
    List<OrderItem> Items);

// Published to message broker
await _eventBus.PublishAsync(new OrderPlacedIntegrationEvent(...));
```

**Event sourcing (store events as source of truth):**
```csharp
public class Order : AggregateRoot
{
    public void Place(Guid customerId, List<OrderItem> items)
    {
        // Store event, not state
        AddDomainEvent(new OrderPlaced(Id, customerId, items));
    }

    // Rebuild state from events
    private void Apply(OrderPlaced @event)
    {
        CustomerId = @event.CustomerId;
        Items = @event.Items;
        Status = OrderStatus.Placed;
    }
}
```

**Benefits:**
- Loose coupling
- Scalability
- Audit trail
- Temporal decoupling

**Challenges:**
- Eventual consistency
- Event ordering
- Debugging complexity

**Related:**
- [[Domain-Events]] - internal events
- [[Message-Queue]] - event transport
- [[CQRS]] - often combined with events

