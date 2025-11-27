**Tags**: #architecture #patterns #design
**Links**: [[CQRS]], [[MediatR]], [[Clean-Architecture]], [[Pipeline-Behavior]]

---

### Mediator Pattern

Mediator defines an object that encapsulates how a set of objects interact. Promotes loose coupling by keeping objects from referring to each other explicitly.

**Without mediator:**
```csharp
// Controller knows about many services
public class OrderController
{
    private readonly IOrderService _orderService;
    private readonly IEmailService _emailService;
    private readonly IInventoryService _inventoryService;
    private readonly IPaymentService _paymentService;
    // ... many dependencies
}
```

**With mediator:**
```csharp
// Controller only knows mediator
public class OrderController
{
    private readonly IMediator _mediator;

    [HttpPost]
    public async Task<int> Create(CreateOrderCommand command)
        => await _mediator.Send(command);
}
```

**MediatR library:** See [[MediatR]]
```csharp
// Request
public record CreateOrderCommand(int CustomerId) : IRequest<int>;

// Handler
public class CreateOrderHandler : IRequestHandler<CreateOrderCommand, int>
{
    public async Task<int> Handle(CreateOrderCommand request, CancellationToken ct)
    {
        // Create order logic
        return orderId;
    }
}
```

**Pipeline behaviors:** See [[Pipeline-Behavior]]
```csharp
public class LoggingBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
{
    public async Task<TResponse> Handle(TRequest request,
        RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        _logger.LogInformation("Handling {Request}", typeof(TRequest).Name);
        var response = await next();
        _logger.LogInformation("Handled {Request}", typeof(TRequest).Name);
        return response;
    }
}
```

**Benefits:**
- Decoupled components
- Single responsibility
- Easy to add cross-cutting concerns
- Great for [[CQRS]]

**Related:**
- [[MediatR]] - popular implementation
- [[CQRS]] - command/query pattern
- [[Pipeline-Behavior]] - cross-cutting concerns
