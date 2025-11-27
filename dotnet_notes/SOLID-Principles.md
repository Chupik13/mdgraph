**Tags**: #architecture #principles #best-practices
**Links**: [[Single-Responsibility]], [[Open-Closed]], [[Liskov-Substitution]], [[Interface-Segregation]], [[Dependency-Inversion]]

---

### SOLID Principles

SOLID is an acronym for five design principles that make software more maintainable, flexible, and understandable.

**The five principles:**
- **S** - [[Single-Responsibility]] - A class should have one reason to change
- **O** - [[Open-Closed]] - Open for extension, closed for modification
- **L** - [[Liskov-Substitution]] - Subtypes must be substitutable for base types
- **I** - [[Interface-Segregation]] - Many specific interfaces over one general
- **D** - [[Dependency-Inversion]] - Depend on abstractions, not concretions

**Why SOLID matters:**
```csharp
// Without SOLID - tightly coupled, hard to change
public class OrderService
{
    public void ProcessOrder(Order order)
    {
        // Validates order
        // Saves to database
        // Sends email
        // Logs everything
        // 500 lines of code...
    }
}

// With SOLID - separated concerns, easy to test
public class OrderService(
    IOrderValidator validator,
    IOrderRepository repository,
    INotificationService notifications,
    ILogger<OrderService> logger)
{
    public async Task ProcessOrderAsync(Order order)
    {
        await validator.ValidateAsync(order);
        await repository.SaveAsync(order);
        await notifications.SendOrderConfirmationAsync(order);
        logger.LogInformation("Order {OrderId} processed", order.Id);
    }
}
```

**Related:**
- [[Clean-Architecture]] - applies SOLID at architectural level
- [[Dependency-Injection]] - enables Dependency Inversion
- [[Unit-Testing]] - SOLID code is easier to test

