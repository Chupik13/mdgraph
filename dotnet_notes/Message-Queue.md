**Tags**: #patterns #messaging #integration
**Links**: [[Azure-Service-Bus]], [[RabbitMQ]], [[Microservices]]

---

### Message Queue

Message queues enable asynchronous communication between services. Decouple producers from consumers.

**Common patterns:**

**Point-to-point:**
```
Producer -> [Queue] -> Consumer
```

**Publish-subscribe:**
```
Publisher -> [Topic] -> Subscription A -> Consumer A
                    -> Subscription B -> Consumer B
```

**Competing consumers:**
```
Producer -> [Queue] -> Consumer 1
                   -> Consumer 2
                   -> Consumer 3
```

**Generic message handler:**
```csharp
public interface IMessageHandler<TMessage>
{
    Task HandleAsync(TMessage message, CancellationToken ct);
}

public class OrderCreatedHandler : IMessageHandler<OrderCreated>
{
    public async Task HandleAsync(OrderCreated message, CancellationToken ct)
    {
        // Process order
        await _inventoryService.ReserveItemsAsync(message.Items, ct);
        await _notificationService.SendConfirmationAsync(message.CustomerId, ct);
    }
}
```

**Message wrapper:**
```csharp
public record MessageEnvelope<T>
{
    public required string MessageId { get; init; }
    public required string CorrelationId { get; init; }
    public required DateTime Timestamp { get; init; }
    public required T Payload { get; init; }
}
```

**Best practices:**
- Make messages idempotent
- Include correlation IDs
- Handle poison messages
- Use dead-letter queues

**Related:**
- [[Azure-Service-Bus]] - Azure implementation
- [[Outbox-Pattern]] - transactional messaging
- [[Event-Driven-Architecture]] - architectural pattern

