**Tags**: #testing #patterns #clean-code
**Links**: [[Unit-Testing]], [[Testing-Best-Practices]], [[Fluent-API]]

---

### Test Data Builders

Test data builders create test objects with sensible defaults. Makes tests readable and maintainable.

**Basic builder:**
```csharp
public class OrderBuilder
{
    private Guid _id = Guid.NewGuid();
    private Guid _customerId = Guid.NewGuid();
    private List<OrderItem> _items = new();
    private OrderStatus _status = OrderStatus.Pending;
    private DateTime _createdAt = DateTime.UtcNow;

    public OrderBuilder WithId(Guid id)
    {
        _id = id;
        return this;
    }

    public OrderBuilder ForCustomer(Guid customerId)
    {
        _customerId = customerId;
        return this;
    }

    public OrderBuilder WithItem(string product, int quantity, decimal price)
    {
        _items.Add(new OrderItem(product, quantity, price));
        return this;
    }

    public OrderBuilder WithStatus(OrderStatus status)
    {
        _status = status;
        return this;
    }

    public Order Build() => new()
    {
        Id = _id,
        CustomerId = _customerId,
        Items = _items,
        Status = _status,
        CreatedAt = _createdAt
    };
}
```

**Usage in tests:**
```csharp
[Fact]
public void CancelOrder_PendingOrder_SetsStatusToCancelled()
{
    // Clear, focused test data
    var order = new OrderBuilder()
        .WithStatus(OrderStatus.Pending)
        .WithItem("Widget", 2, 10.00m)
        .Build();

    _service.Cancel(order);

    Assert.Equal(OrderStatus.Cancelled, order.Status);
}
```

**Static factory methods:**
```csharp
public static class TestOrders
{
    public static Order PendingOrder() => new OrderBuilder()
        .WithStatus(OrderStatus.Pending)
        .WithItem("Default Item", 1, 10.00m)
        .Build();

    public static Order CompletedOrder() => new OrderBuilder()
        .WithStatus(OrderStatus.Completed)
        .Build();
}
```

**Related:**
- [[Unit-Testing]] - test patterns
- [[Testing-Best-Practices]] - test guidelines
- [[Fluent-API]] - fluent interfaces

