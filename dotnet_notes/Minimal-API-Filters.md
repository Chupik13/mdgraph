**Tags**: #aspnet #minimal-api #middleware
**Links**: [[Minimal-APIs]], [[Endpoint-Filters]], [[Middleware]]

---

### Minimal API Filters

Endpoint filters in minimal APIs allow running code before and after endpoint handlers. Similar to action filters in MVC.

**Basic filter:**
```csharp
app.MapGet("/items/{id}", (int id) => Results.Ok(item))
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
        var model = context.Arguments.OfType<T>().FirstOrDefault();

        var validator = context.HttpContext.RequestServices
            .GetService<IValidator<T>>();

        if (validator != null)
        {
            var result = await validator.ValidateAsync(model);
            if (!result.IsValid)
                return Results.ValidationProblem(result.ToDictionary());
        }

        return await next(context);
    }
}

// Usage
app.MapPost("/orders", (CreateOrderRequest request) => ...)
    .AddEndpointFilter<ValidationFilter<CreateOrderRequest>>();
```

**Filter factory:**
```csharp
app.MapGroup("/api")
    .AddEndpointFilterFactory((filterContext, next) =>
    {
        // Access endpoint metadata
        var requiresAuth = filterContext.MethodInfo
            .GetCustomAttribute<RequiresAuthAttribute>() != null;

        return async context =>
        {
            if (requiresAuth && !context.HttpContext.User.Identity?.IsAuthenticated == true)
                return Results.Unauthorized();

            return await next(context);
        };
    });
```

**Related:**
- [[Minimal-APIs]] - minimal API overview
- [[Endpoint-Filters]] - filter patterns
- [[Middleware]] - request pipeline

