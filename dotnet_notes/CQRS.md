**Tags**: #architecture #patterns #design
**Links**: [[Clean-Architecture]], [[Mediator-Pattern]], [[Event-Sourcing]], [[MediatR]]

---

### CQRS (Command Query Responsibility Segregation)

CQRS separates read (Query) and write (Command) operations into different models. Often combined with [[Mediator-Pattern]].

**Basic structure:**
```csharp
// Command - changes state, returns minimal data
public record CreateOrderCommand(int CustomerId, List<OrderLineDto> Lines)
    : IRequest<int>;

// Query - reads state, returns data
public record GetOrderQuery(int OrderId)
    : IRequest<OrderDto>;
```

**Command handler:**
```csharp
public class CreateOrderHandler : IRequestHandler<CreateOrderCommand, int>
{
    private readonly IOrderRepository _repository;

    public async Task<int> Handle(CreateOrderCommand request, CancellationToken ct)
    {
        var order = new Order(request.CustomerId);
        foreach (var line in request.Lines)
            order.AddLine(line.ProductId, line.Quantity);

        await _repository.AddAsync(order);
        return order.Id;
    }
}
```

**Query handler:**
```csharp
public class GetOrderHandler : IRequestHandler<GetOrderQuery, OrderDto>
{
    private readonly IReadOnlyDbContext _context;  // Read-optimized

    public async Task<OrderDto> Handle(GetOrderQuery request, CancellationToken ct)
    {
        return await _context.Orders
            .Where(o => o.Id == request.OrderId)
            .ProjectTo<OrderDto>()
            .FirstOrDefaultAsync(ct);
    }
}
```

**Benefits:**
- Separate optimization for reads vs writes
- Clearer code organization
- Easier to scale reads independently
- Natural fit for [[Event-Sourcing]]

**When to use:**
- Complex domains with different read/write patterns
- High-read applications
- When reads and writes have different models

**Related:**
- [[Mediator-Pattern]] - request routing
- [[MediatR]] - popular .NET library
- [[Event-Sourcing]] - event-based persistence
