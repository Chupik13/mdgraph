**Tags**: #architecture #patterns #design
**Links**: [[Clean-Architecture]], [[Aggregates]], [[Value-Objects]], [[Domain-Events]], [[Bounded-Context]]

---

### Domain-Driven Design (DDD)

DDD is an approach to software development that focuses on modeling the domain. It uses ubiquitous language and strategic/tactical patterns.

**Strategic patterns:**
- [[Bounded-Context]] - explicit boundaries
- Ubiquitous Language - shared terminology
- Context Mapping - relationships between contexts

**Tactical patterns:**

**Entities:**
```csharp
public class Order : Entity
{
    public OrderId Id { get; private set; }
    public CustomerId CustomerId { get; private set; }
    private readonly List<OrderLine> _lines = new();
    public IReadOnlyList<OrderLine> Lines => _lines;

    public void AddLine(Product product, int quantity)
    {
        if (quantity <= 0) throw new DomainException("Invalid quantity");
        _lines.Add(new OrderLine(product, quantity));
        AddDomainEvent(new OrderLineAddedEvent(Id, product.Id));
    }
}
```

**Value Objects:** See [[Value-Objects]]
```csharp
public record Money(decimal Amount, string Currency)
{
    public static Money operator +(Money a, Money b)
    {
        if (a.Currency != b.Currency) throw new DomainException("Currency mismatch");
        return new Money(a.Amount + b.Amount, a.Currency);
    }
}
```

**Aggregates:** See [[Aggregates]]
- Cluster of entities with consistency boundary
- Root entity controls access
- Persist and load as a unit

**Domain Events:** See [[Domain-Events]]
- Capture significant domain occurrences
- Enable loose coupling between aggregates

**Related:**
- [[Aggregates]] - consistency boundaries
- [[Value-Objects]] - immutable concepts
- [[Domain-Events]] - event-driven design
- [[Bounded-Context]] - context boundaries
