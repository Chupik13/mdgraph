**Tags**: #messaging #integration #microservices
**Links**: [[Message-Queue]], [[Azure-Service-Bus]], [[Event-Driven-Architecture]]

---

### RabbitMQ

RabbitMQ is an open-source message broker implementing AMQP protocol. Popular for microservices communication.

**Installation:**
```bash
dotnet add package RabbitMQ.Client
```

**Publisher:**
```csharp
public class RabbitMqPublisher : IDisposable
{
    private readonly IConnection _connection;
    private readonly IModel _channel;

    public RabbitMqPublisher(string connectionString)
    {
        var factory = new ConnectionFactory { Uri = new Uri(connectionString) };
        _connection = factory.CreateConnection();
        _channel = _connection.CreateModel();

        _channel.QueueDeclare(
            queue: "orders",
            durable: true,
            exclusive: false,
            autoDelete: false);
    }

    public void Publish<T>(T message)
    {
        var body = JsonSerializer.SerializeToUtf8Bytes(message);
        var properties = _channel.CreateBasicProperties();
        properties.Persistent = true;

        _channel.BasicPublish(
            exchange: "",
            routingKey: "orders",
            basicProperties: properties,
            body: body);
    }
}
```

**Consumer:**
```csharp
public class RabbitMqConsumer : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        var factory = new ConnectionFactory { Uri = new Uri(_connectionString) };
        using var connection = factory.CreateConnection();
        using var channel = connection.CreateModel();

        channel.QueueDeclare("orders", durable: true, exclusive: false, autoDelete: false);

        var consumer = new EventingBasicConsumer(channel);
        consumer.Received += async (model, ea) =>
        {
            var message = JsonSerializer.Deserialize<Order>(ea.Body.Span);
            await ProcessOrderAsync(message);
            channel.BasicAck(ea.DeliveryTag, multiple: false);
        };

        channel.BasicConsume("orders", autoAck: false, consumer);

        await Task.Delay(Timeout.Infinite, ct);
    }
}
```

**Related:**
- [[Message-Queue]] - messaging patterns
- [[Azure-Service-Bus]] - cloud alternative
- [[Event-Driven-Architecture]] - event patterns

