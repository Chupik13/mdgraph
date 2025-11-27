**Tags**: #ddd #patterns #events
**Links**: [[DDD]], [[Aggregates]], [[MediatR]], [[Event-Sourcing]]

---

### Domain Events

Domain events capture something significant that happened in the domain. They enable loose coupling between aggregates.

**Event definition:**
```csharp
public interface IDomainEvent
{
    DateTime OccurredOn { get; }
}

public record OrderSubmittedEvent(OrderId OrderId) : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

public record PaymentReceivedEvent(OrderId OrderId, Money Amount) : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
```

**Aggregate base:**
```csharp
public abstract class AggregateRoot
{
    private readonly List<IDomainEvent> _domainEvents = new();
    public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents;

    protected void AddDomainEvent(IDomainEvent @event)
    {
        _domainEvents.Add(@event);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}
```

**Dispatching events (with MediatR):**
```csharp
public class DomainEventDispatcher : SaveChangesInterceptor
{
    private readonly IMediator _mediator;

    public override async ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData,
        int result,
        CancellationToken ct)
    {
        var context = eventData.Context!;
        var aggregates = context.ChangeTracker.Entries<AggregateRoot>()
            .Select(e => e.Entity)
            .Where(e => e.DomainEvents.Any());

        var events = aggregates.SelectMany(a => a.DomainEvents).ToList();
        aggregates.ToList().ForEach(a => a.ClearDomainEvents());

        foreach (var @event in events)
        {
            await _mediator.Publish(@event, ct);
        }

        return result;
    }
}
```

**Event handlers:**
```csharp
public class OrderSubmittedHandler : INotificationHandler<OrderSubmittedEvent>
{
    public async Task Handle(OrderSubmittedEvent @event, CancellationToken ct)
    {
        await _emailService.SendOrderConfirmationAsync(@event.OrderId);
    }
}
```

**Related:**
- [[MediatR]] - event dispatching
- [[Event-Sourcing]] - event persistence
- [[Outbox-Pattern]] - reliable publishing
