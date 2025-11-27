**Tags**: #ddd #patterns #design
**Links**: [[DDD]], [[Repository-Pattern]], [[Domain-Events]], [[Value-Objects]]

---

### Aggregates

An aggregate is a cluster of domain objects treated as a single unit for data changes. It has a root entity that controls access.

**Structure:**
```csharp
// Aggregate Root
public class Order : AggregateRoot
{
    public OrderId Id { get; private set; }
    public CustomerId CustomerId { get; private set; }
    public OrderStatus Status { get; private set; }
    public Money Total { get; private set; }

    private readonly List<OrderLine> _lines = new();
    public IReadOnlyList<OrderLine> Lines => _lines;

    private Order() { } // EF

    public Order(CustomerId customerId)
    {
        Id = new OrderId(Guid.NewGuid());
        CustomerId = customerId;
        Status = OrderStatus.Draft;
        Total = Money.Zero("USD");
    }

    public void AddLine(Product product, int quantity)
    {
        if (Status != OrderStatus.Draft)
            throw new DomainException("Cannot modify submitted order");

        var line = new OrderLine(product.Id, product.Name, product.Price, quantity);
        _lines.Add(line);
        RecalculateTotal();

        AddDomainEvent(new OrderLineAddedEvent(Id, line));
    }

    public void Submit()
    {
        if (!_lines.Any())
            throw new DomainException("Cannot submit empty order");

        Status = OrderStatus.Submitted;
        AddDomainEvent(new OrderSubmittedEvent(Id));
    }

    private void RecalculateTotal()
    {
        Total = _lines.Aggregate(Money.Zero("USD"),
            (sum, line) => sum + line.LineTotal);
    }
}
```

**Rules:**
- Only root entity has global identity
- External objects reference only the root
- Root enforces invariants for entire aggregate
- Changes within aggregate are atomic
- Delete cascade within aggregate

**Repository per aggregate:**
```csharp
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(OrderId id);
    Task AddAsync(Order order);
    // No methods for OrderLine - access through Order
}
```

**Sizing aggregates:**
- Small as possible
- Large enough to enforce invariants
- Reference other aggregates by ID

**Related:**
- [[DDD]] - domain modeling
- [[Repository-Pattern]] - persistence
- [[Domain-Events]] - cross-aggregate communication
