**Tags**: #messaging #libraries #microservices
**Links**: [[RabbitMQ]], [[Azure-Service-Bus]], [[Message-Queue]]

---

### MassTransit

MassTransit is a distributed application framework that simplifies message-based communication.

**Installation:**
```bash
dotnet add package MassTransit.RabbitMQ
```

**Configuration:**
```csharp
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<OrderCreatedConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost", "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });

        cfg.ConfigureEndpoints(context);
    });
});
```

**Message and consumer:**
```csharp
public record OrderCreated(Guid OrderId, string CustomerEmail, decimal Total);

public class OrderCreatedConsumer : IConsumer<OrderCreated>
{
    public async Task Consume(ConsumeContext<OrderCreated> context)
    {
        var message = context.Message;
        await SendConfirmationEmail(message.CustomerEmail, message.OrderId);
    }
}
```

**Publishing messages:**
```csharp
public class OrderService(IPublishEndpoint publishEndpoint)
{
    public async Task CreateOrderAsync(Order order)
    {
        await _repository.SaveAsync(order);

        await publishEndpoint.Publish(new OrderCreated(
            order.Id,
            order.CustomerEmail,
            order.Total));
    }
}
```

**Request/response:**
```csharp
public class GetOrderHandler : IConsumer<GetOrder>
{
    public async Task Consume(ConsumeContext<GetOrder> context)
    {
        var order = await _repository.GetAsync(context.Message.OrderId);
        await context.RespondAsync(new OrderResponse(order));
    }
}

// Client
var response = await _requestClient.GetResponse<OrderResponse>(new GetOrder(orderId));
```

**Related:**
- [[RabbitMQ]] - message broker
- [[Azure-Service-Bus]] - cloud messaging
- [[Message-Queue]] - messaging patterns

