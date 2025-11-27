**Tags**: #aspnet #web #fundamentals
**Links**: [[Middleware]], [[Dependency-Injection]], [[Configuration]], [[Minimal-APIs]], [[Controllers]]

---

### ASP.NET Core

ASP.NET Core is a cross-platform, high-performance framework for building web applications, APIs, and microservices.

**Program.cs (Minimal hosting):**
```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddScoped<IUserService, UserService>();

var app = builder.Build();

// Configure middleware pipeline
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

**Key concepts:**
- [[Middleware]] - request/response pipeline
- [[Dependency-Injection]] - built-in DI container
- [[Configuration]] - appsettings, environment vars
- [[Routing]] - URL to endpoint mapping
- [[Logging]] - structured logging

**Project types:**
- Web API - [[Controllers]] or [[Minimal-APIs]]
- MVC - Razor views
- Blazor - C# in browser
- gRPC - binary protocol

**Related:**
- [[Middleware]] - pipeline components
- [[Dependency-Injection]] - service registration
- [[Configuration]] - settings management
- [[Controllers]] - API controllers
- [[Minimal-APIs]] - lightweight endpoints
