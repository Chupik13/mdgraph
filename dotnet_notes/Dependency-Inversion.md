**Tags**: #solid #architecture #patterns
**Links**: [[Dependency-Injection]], [[Clean-Architecture]], [[Interface-Design]], [[SOLID]]

---

### Dependency Inversion Principle

High-level modules should not depend on low-level modules. Both should depend on abstractions.

**Without DIP (wrong):**
```csharp
// High-level depends on low-level concrete class
public class OrderService
{
    private readonly SqlOrderRepository _repository;  // Concrete!
    private readonly SmtpEmailService _emailService;  // Concrete!

    public OrderService()
    {
        _repository = new SqlOrderRepository();  // Creates own dependencies
        _emailService = new SmtpEmailService();
    }
}
```

**With DIP (correct):**
```csharp
// High-level depends on abstractions
public class OrderService
{
    private readonly IOrderRepository _repository;  // Abstraction
    private readonly IEmailService _emailService;   // Abstraction

    public OrderService(IOrderRepository repository, IEmailService emailService)
    {
        _repository = repository;
        _emailService = emailService;
    }
}

// Low-level implements abstractions
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(int id);
    Task SaveAsync(Order order);
}

public class SqlOrderRepository : IOrderRepository { ... }
public class MongoOrderRepository : IOrderRepository { ... }
```

**Benefits:**
- Testable (inject mocks)
- Flexible (swap implementations)
- Decoupled (changes don't cascade)
- Follows Open/Closed principle

**Dependency flow:**
```
Without DIP:
  OrderService → SqlOrderRepository → Database

With DIP:
  OrderService → IOrderRepository ← SqlOrderRepository → Database
  (points toward abstraction)
```

**In Clean Architecture:**
```
Domain (center) - defines interfaces
Application - uses interfaces
Infrastructure (outer) - implements interfaces
```

**Related:**
- [[Dependency-Injection]] - implementing DIP
- [[Clean-Architecture]] - architecture using DIP
- [[SOLID]] - other principles
