**Tags**: #aspnet #patterns #fundamentals
**Links**: [[Service-Lifetimes]], [[IServiceCollection]], [[Options-Pattern]], [[Factory-Pattern]]

---

### Dependency Injection

ASP.NET Core has built-in DI container. Services are registered in `IServiceCollection` and resolved automatically.

**Registration:**
```csharp
builder.Services.AddTransient<IEmailService, EmailService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddSingleton<ICacheService, CacheService>();
```

**Service lifetimes:** See [[Service-Lifetimes]]
- `Transient` - new instance every request
- `Scoped` - one per HTTP request
- `Singleton` - one for application lifetime

**Constructor injection:**
```csharp
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UserController> _logger;

    public UserController(IUserService userService, ILogger<UserController> logger)
    {
        _userService = userService;
        _logger = logger;
    }
}
```

**Keyed services (NET 8+):**
```csharp
builder.Services.AddKeyedScoped<IStorage, S3Storage>("s3");
builder.Services.AddKeyedScoped<IStorage, AzureStorage>("azure");

// Inject with [FromKeyedServices("s3")]
```

**Common patterns:**
- [[Options-Pattern]] - typed configuration
- [[Factory-Pattern]] - complex creation logic
- Interface segregation - small, focused interfaces

**Anti-patterns:**
- Service locator pattern
- Captive dependencies (singleton holding scoped)
- Circular dependencies

**Related:**
- [[Service-Lifetimes]] - choosing lifetimes
- [[Options-Pattern]] - configuration injection
- [[IServiceCollection]] - registration API
