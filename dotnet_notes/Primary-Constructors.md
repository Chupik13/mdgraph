**Tags**: #csharp #modern #syntax
**Links**: [[Records]], [[Dependency-Injection]], [[Constructor-Injection]]

---

### Primary Constructors (C# 12)

Primary constructors allow parameters directly in the class declaration, reducing boilerplate for DI and initialization.

**Basic syntax:**
```csharp
public class UserService(IUserRepository repository, ILogger<UserService> logger)
{
    public async Task<User?> GetUserAsync(int id)
    {
        logger.LogInformation("Getting user {UserId}", id);
        return await repository.GetByIdAsync(id);
    }
}

// Parameters are captured, not fields
// They're available throughout the class
```

**Before primary constructors:**
```csharp
public class UserService
{
    private readonly IUserRepository _repository;
    private readonly ILogger<UserService> _logger;

    public UserService(IUserRepository repository, ILogger<UserService> logger)
    {
        _repository = repository;
        _logger = logger;
    }
}
```

**With field initialization:**
```csharp
public class OrderService(IOrderRepository repository)
{
    private readonly IOrderRepository _repository = repository;  // Explicit field
    private readonly List<Order> _cache = new();  // Additional field

    public void Process() => _repository.Save(...);
}
```

**Structs:**
```csharp
public struct Point(int x, int y)
{
    public int X { get; } = x;
    public int Y { get; } = y;
}
```

**Important notes:**
- Parameters are NOT fields (no `this.`)
- Cannot be accessed via reflection
- Captured by lambdas (closure-like)
- Use explicit fields if you need field semantics

**When to use:**
- Dependency injection
- Simple data carriers
- Reducing boilerplate

**Related:**
- [[Records]] - had primary constructors first
- [[Dependency-Injection]] - main use case
- [[Constructor-Injection]] - DI pattern
