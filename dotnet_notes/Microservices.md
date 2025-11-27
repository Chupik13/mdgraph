**Tags**: #architecture #distributed #design
**Links**: [[Clean-Architecture]], [[Docker]], [[Message-Queues]], [[Service-Discovery]]

---

### Microservices Architecture

Microservices decompose applications into small, independently deployable services. Each service owns its domain and data.

**Characteristics:**
- Single responsibility
- Independent deployment
- Own database (no sharing)
- Communicate via APIs/messages
- Technology agnostic

**Communication patterns:**

**Synchronous (HTTP/gRPC):**
```csharp
// HTTP client
public class OrderService(IHttpClientFactory clientFactory)
{
    public async Task<Product> GetProductAsync(int id)
    {
        var client = clientFactory.CreateClient("Products");
        return await client.GetFromJsonAsync<Product>($"api/products/{id}");
    }
}
```

**Asynchronous (Message Queue):**
```csharp
// Publisher
await _messageBus.PublishAsync(new OrderCreatedEvent(order.Id));

// Consumer in another service
public class OrderCreatedHandler : IMessageHandler<OrderCreatedEvent>
{
    public async Task HandleAsync(OrderCreatedEvent message)
    {
        await _inventoryService.ReserveItemsAsync(message.OrderId);
    }
}
```

**Service discovery:**
```csharp
builder.Services.AddHttpClient("Orders", (sp, client) =>
{
    var discovery = sp.GetRequiredService<IServiceDiscovery>();
    client.BaseAddress = discovery.GetServiceUri("orders-service");
});
```

**Patterns:**
- [[API-Gateway]] - single entry point
- [[Circuit-Breaker]] - fault tolerance
- [[Saga-Pattern]] - distributed transactions
- [[Outbox-Pattern]] - reliable messaging
- [[CQRS]] - read/write separation

**Challenges:**
- Network latency
- Data consistency
- Distributed tracing
- Operational complexity

**Related:**
- [[Docker]] - containerization
- [[Kubernetes]] - orchestration
- [[Message-Queues]] - async communication
