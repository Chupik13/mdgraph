**Tags**: #aspnet #api #modern
**Links**: [[ASP-NET-Core]], [[Controllers]], [[Routing]], [[Endpoint-Filters]]

---

### Minimal APIs

Minimal APIs provide a lightweight way to build HTTP APIs with minimal ceremony. Introduced in .NET 6.

**Basic usage:**
```csharp
var app = WebApplication.CreateBuilder(args).Build();

app.MapGet("/", () => "Hello World");

app.MapGet("/users/{id}", async (int id, IUserService service) =>
{
    var user = await service.GetByIdAsync(id);
    return user is null ? Results.NotFound() : Results.Ok(user);
});

app.MapPost("/users", async (CreateUserDto dto, IUserService service) =>
{
    var user = await service.CreateAsync(dto);
    return Results.Created($"/users/{user.Id}", user);
});

app.Run();
```

**Route groups:**
```csharp
var users = app.MapGroup("/api/users");
users.MapGet("/", GetAllUsers);
users.MapGet("/{id}", GetUserById);
users.MapPost("/", CreateUser);
users.RequireAuthorization();  // Apply to all
```

**Endpoint filters:** See [[Endpoint-Filters]]
```csharp
app.MapPost("/users", CreateUser)
    .AddEndpointFilter<ValidationFilter<CreateUserDto>>();
```

**When to use:**
- Small APIs and microservices
- Prototypes and demos
- Performance-critical endpoints
- When you don't need controller conventions

**Controllers vs Minimal APIs:**
| Feature | Controllers | Minimal |
|---------|------------|---------|
| Ceremony | More | Less |
| Grouping | Built-in | MapGroup |
| Filters | Action filters | Endpoint filters |
| Conventions | Rich | Basic |

**Related:**
- [[Controllers]] - traditional approach
- [[Endpoint-Filters]] - middleware for endpoints
- [[TypedResults]] - strongly-typed results
