**Tags**: #azure #messaging #integration
**Links**: [[Message-Queue]], [[Microservices]], [[Event-Driven-Architecture]]

---

### Azure Service Bus

Azure Service Bus is a fully managed enterprise message broker with queues and publish-subscribe topics.

**Sending messages:**
```csharp
await using var client = new ServiceBusClient(connectionString);
await using var sender = client.CreateSender("myqueue");

var message = new ServiceBusMessage(JsonSerializer.Serialize(order))
{
    ContentType = "application/json",
    Subject = "NewOrder",
    MessageId = order.Id.ToString(),
    CorrelationId = correlationId
};

await sender.SendMessageAsync(message);
```

**Receiving messages:**
```csharp
await using var processor = client.CreateProcessor("myqueue", new ServiceBusProcessorOptions
{
    AutoCompleteMessages = false,
    MaxConcurrentCalls = 10
});

processor.ProcessMessageAsync += async args =>
{
    var order = JsonSerializer.Deserialize<Order>(args.Message.Body);
    await ProcessOrderAsync(order);
    await args.CompleteMessageAsync(args.Message);
};

processor.ProcessErrorAsync += args =>
{
    _logger.LogError(args.Exception, "Message processing failed");
    return Task.CompletedTask;
};

await processor.StartProcessingAsync();
```

**Topics and subscriptions:**
```csharp
// Publish to topic
await using var sender = client.CreateSender("orders-topic");
await sender.SendMessageAsync(message);

// Subscribe with filter
await using var processor = client.CreateProcessor(
    "orders-topic",
    "high-value-orders",
    options);
```

**Related:**
- [[Message-Queue]] - messaging patterns
- [[Outbox-Pattern]] - reliable messaging
- [[Microservices]] - service communication

