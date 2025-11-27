**Tags**: #aspnet #di #patterns
**Links**: [[Dependency-Injection]], [[Scoped-Services]], [[Singleton-Pattern]], [[Memory-Leaks]]

---

### Service Lifetimes

Service lifetime determines how long an instance lives and when new instances are created.

**Transient:**
```csharp
services.AddTransient<IService, Service>();
```
- New instance every time requested
- Use for: lightweight, stateless services
- Example: validators, mappers

**Scoped:**
```csharp
services.AddScoped<IService, Service>();
```
- One instance per scope (HTTP request in web apps)
- Use for: [[DbContext]], request-specific data
- Example: repositories, unit of work

**Singleton:**
```csharp
services.AddSingleton<IService, Service>();
```
- One instance for application lifetime
- Use for: caches, configuration, heavy-to-create services
- Must be thread-safe!

**Common mistakes:**

**Captive dependency:**
```csharp
// WRONG: Singleton holds Scoped
public class SingletonService
{
    private readonly IScopedService _scoped;  // Will be same instance forever!
}
```

**Choosing lifetime:**
| Service Type | Lifetime |
|-------------|----------|
| DbContext | Scoped |
| HttpClient | Singleton (via IHttpClientFactory) |
| Cache | Singleton |
| Validators | Transient |
| Repositories | Scoped |
| Background services | Singleton |

**Testing lifetime issues:**
```csharp
// This will throw if scoped service injected in singleton
builder.Services.BuildServiceProvider(validateScopes: true);
```

**Related:**
- [[Dependency-Injection]] - DI basics
- [[DbContext-Lifetime]] - EF specific
- [[Memory-Leaks]] - lifetime-related leaks
