**Tags**: #patterns #best-practices #error-handling
**Links**: [[Exception-Handling]], [[Result-Pattern]], [[Problem-Details]]

---

### Error Handling

Error handling strategies determine how applications respond to failures. Choose between exceptions and result types based on context.

**Domain errors vs exceptions:**
```csharp
// Exceptions for unexpected failures
if (connection == null)
    throw new InvalidOperationException("Database connection not initialized");

// Result types for expected failures
public async Task<Result<Order>> CreateOrderAsync(CreateOrderDto dto)
{
    if (dto.Items.Count == 0)
        return Result.Failure<Order>("Order must have items");

    var inventory = await _inventoryService.CheckAsync(dto.Items);
    if (!inventory.IsAvailable)
        return Result.Failure<Order>("Items not in stock");

    var order = new Order(dto);
    await _repository.AddAsync(order);
    return Result.Success(order);
}
```

**API error responses:**
```csharp
public class ErrorHandlingMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Status = 400,
                Title = "Validation Error",
                Detail = ex.Message
            });
        }
        catch (NotFoundException ex)
        {
            context.Response.StatusCode = 404;
            await context.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Status = 404,
                Title = "Not Found",
                Detail = ex.Message
            });
        }
    }
}
```

**Fail fast principle:**
```csharp
public OrderService(IOrderRepository repository)
{
    _repository = repository ?? throw new ArgumentNullException(nameof(repository));
}
```

**Related:**
- [[Exception-Handling]] - catching exceptions
- [[Result-Pattern]] - functional error handling
- [[Problem-Details]] - RFC 7807 errors

