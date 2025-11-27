**Tags**: #architecture #patterns #design
**Links**: [[DDD]], [[CQRS]], [[Repository-Pattern]], [[Dependency-Injection]], [[Onion-Architecture]]

---

### Clean Architecture

Clean Architecture separates concerns into layers with dependencies pointing inward. The domain is at the center, independent of frameworks and infrastructure.

**Layers (inside to outside):**
1. **Domain** - Entities, value objects, domain events
2. **Application** - Use cases, interfaces, DTOs
3. **Infrastructure** - Database, external services, frameworks
4. **Presentation** - API controllers, UI

**Project structure:**
```
src/
  Domain/
    Entities/
    ValueObjects/
    Events/
    Exceptions/
  Application/
    Common/
      Interfaces/
      Behaviors/
    Features/
      Users/
        Commands/
        Queries/
  Infrastructure/
    Persistence/
    Services/
  WebApi/
    Controllers/
```

**Dependency rule:**
- Inner layers know nothing about outer layers
- Outer layers depend on inner layers
- Interfaces defined in Application, implemented in Infrastructure

**Example:**
```csharp
// Domain
public class Order : Entity { ... }

// Application
public interface IOrderRepository { Task<Order?> GetByIdAsync(int id); }
public record CreateOrderCommand : IRequest<int> { ... }

// Infrastructure
public class OrderRepository : IOrderRepository { ... }

// WebApi
[HttpPost]
public Task<int> Create(CreateOrderCommand command)
    => _mediator.Send(command);
```

**Benefits:**
- Testable business logic
- Framework independence
- Flexible infrastructure

**Related:**
- [[DDD]] - domain modeling
- [[CQRS]] - command/query separation
- [[Mediator-Pattern]] - request handling
- [[Onion-Architecture]] - similar approach
