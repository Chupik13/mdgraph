**Tags**: #aspnet #minimal-apis #middleware
**Links**: [[Minimal-APIs]], [[Middleware]], [[Validation]]

---

### Endpoint Filters

Endpoint filters are middleware for minimal API endpoints. Execute before/after endpoint handlers.

**Basic filter:**
```csharp
app.MapGet("/users/{id}", (int id) => GetUser(id))
    .AddEndpointFilter(async (context, next) =>
    {
        var id = context.GetArgument<int>(0);
        if (id <= 0)
            return Results.BadRequest("Invalid ID");

        return await next(context);
    });
```

**Filter class:**
```csharp
public class ValidationFilter<T> : IEndpointFilter where T : class
{
    public async ValueTask<object?> InvokeAsync(
        EndpointFilterInvocationContext context,
        EndpointFilterDelegate next)
    {
        var argument = context.Arguments
            .OfType<T>()
            .FirstOrDefault();

        if (argument is null)
            return Results.BadRequest("Missing request body");

        var validator = context.HttpContext.RequestServices
            .GetService<IValidator<T>>();

        if (validator is not null)
        {
            var result = await validator.ValidateAsync(argument);
            if (!result.IsValid)
                return Results.ValidationProblem(result.ToDictionary());
        }

        return await next(context);
    }
}

// Usage
app.MapPost("/users", CreateUser)
    .AddEndpointFilter<ValidationFilter<CreateUserDto>>();
```

**Multiple filters:**
```csharp
app.MapPost("/orders", CreateOrder)
    .AddEndpointFilter<LoggingFilter>()
    .AddEndpointFilter<ValidationFilter<CreateOrderDto>>()
    .AddEndpointFilter<AuthorizationFilter>();
```

**Filter on route group:**
```csharp
var users = app.MapGroup("/api/users")
    .AddEndpointFilter<AuthenticationFilter>();

users.MapGet("/", GetAllUsers);      // Filter applied
users.MapGet("/{id}", GetUserById);  // Filter applied
```

**Accessing services:**
```csharp
public async ValueTask<object?> InvokeAsync(
    EndpointFilterInvocationContext context,
    EndpointFilterDelegate next)
{
    var logger = context.HttpContext.RequestServices
        .GetRequiredService<ILogger<MyFilter>>();

    logger.LogInformation("Before endpoint");
    var result = await next(context);
    logger.LogInformation("After endpoint");

    return result;
}
```

**Related:**
- [[Minimal-APIs]] - endpoint definition
- [[Middleware]] - global middleware
- [[Validation]] - request validation
