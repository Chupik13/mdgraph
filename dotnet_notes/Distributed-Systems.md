**Tags**: #architecture #patterns #advanced
**Links**: [[Microservices]], [[Message-Queue]], [[CAP-Theorem]]

---

### Distributed Systems

Distributed systems span multiple machines. Understanding their challenges is essential for building reliable services.

**Key challenges:**

**Network partitions:**
```csharp
// Network can fail between any call
try
{
    await _orderService.CreateOrderAsync(order);
}
catch (HttpRequestException)
{
    // Did the order get created? Unknown!
    // Need idempotency to safely retry
}
```

**Eventual consistency:**
```csharp
// Service A updates, Service B reads stale data
// Account for propagation delay
public async Task<Order?> GetOrderAsync(Guid id)
{
    var order = await _readDb.Orders.FindAsync(id);
    if (order == null)
    {
        // Maybe not replicated yet, try primary
        order = await _writeDb.Orders.FindAsync(id);
    }
    return order;
}
```

**Distributed transactions (Saga pattern):**
```csharp
public class CreateOrderSaga
{
    public async Task ExecuteAsync(Order order)
    {
        try
        {
            await _inventoryService.ReserveItemsAsync(order.Items);
            await _paymentService.ChargeAsync(order.Total);
            await _orderService.ConfirmAsync(order.Id);
        }
        catch
        {
            // Compensating transactions
            await _inventoryService.ReleaseItemsAsync(order.Items);
            await _paymentService.RefundAsync(order.PaymentId);
            await _orderService.CancelAsync(order.Id);
            throw;
        }
    }
}
```

**Distributed locking:**
```csharp
await using var @lock = await _lockProvider.AcquireAsync(
    $"order:{orderId}",
    timeout: TimeSpan.FromSeconds(30));

// Only one instance processes this order
await ProcessOrderAsync(orderId);
```

**Related:**
- [[CAP-Theorem]] - consistency vs availability
- [[Microservices]] - distributed architecture
- [[Idempotency]] - safe operations

