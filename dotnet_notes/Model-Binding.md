**Tags**: #aspnet #web #fundamentals
**Links**: [[Controllers]], [[Routing]], [[Validation]], [[Minimal-APIs]]

---

### Model Binding

Model binding maps HTTP request data to action parameters. ASP.NET Core automatically binds from multiple sources.

**Binding sources:**
```csharp
[HttpPost("users/{id}/orders")]
public ActionResult Create(
    [FromRoute] int id,           // From URL: /users/5/orders
    [FromQuery] string sort,      // From query: ?sort=date
    [FromBody] CreateOrderDto dto, // From request body (JSON)
    [FromHeader(Name = "X-Api-Key")] string apiKey,
    [FromServices] IOrderService service)  // From DI container
{
    // ...
}
```

**[ApiController] inference:**
```csharp
[ApiController]
public class UsersController : ControllerBase
{
    // With [ApiController]:
    // - Complex types inferred as [FromBody]
    // - Simple types inferred as [FromRoute]/[FromQuery]
    // - Automatic 400 on validation failure

    [HttpPost]
    public ActionResult Create(CreateUserDto dto)  // Inferred [FromBody]
    {
        // ...
    }
}
```

**Complex binding:**
```csharp
public class UserFilter
{
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public List<string> Tags { get; set; } = new();
}

// Binds from: ?search=john&page=2&tags=admin&tags=user
[HttpGet]
public ActionResult<List<User>> List([FromQuery] UserFilter filter)
```

**Custom binder:**
```csharp
public class DateRangeModelBinder : IModelBinder
{
    public Task BindModelAsync(ModelBindingContext bindingContext)
    {
        var from = bindingContext.ValueProvider.GetValue("from");
        var to = bindingContext.ValueProvider.GetValue("to");

        var range = new DateRange(
            DateTime.Parse(from.FirstValue!),
            DateTime.Parse(to.FirstValue!));

        bindingContext.Result = ModelBindingResult.Success(range);
        return Task.CompletedTask;
    }
}
```

**Related:**
- [[Validation]] - validating bound models
- [[Controllers]] - using model binding
- [[DTOs]] - binding targets
