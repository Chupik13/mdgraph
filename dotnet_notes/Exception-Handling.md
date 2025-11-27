**Tags**: #csharp #patterns #best-practices
**Links**: [[Exception-Types]], [[Global-Exception-Handler]], [[Result-Pattern]], [[Logging]]

---

### Exception Handling Best Practices

Proper exception handling improves reliability and debugging. Avoid common anti-patterns.

**Basic pattern:**
```csharp
try
{
    await ProcessOrderAsync(order);
}
catch (OrderValidationException ex)
{
    _logger.LogWarning(ex, "Order validation failed for {OrderId}", order.Id);
    return BadRequest(ex.Message);
}
catch (PaymentException ex) when (ex.IsRetryable)
{
    _logger.LogWarning(ex, "Payment failed, will retry");
    throw;  // Let retry policy handle
}
catch (Exception ex)
{
    _logger.LogError(ex, "Unexpected error processing order {OrderId}", order.Id);
    throw;  // Don't swallow!
}
```

**Custom exceptions:**
```csharp
public class DomainException : Exception
{
    public string Code { get; }

    public DomainException(string code, string message) : base(message)
    {
        Code = code;
    }
}

public class NotFoundException : DomainException
{
    public NotFoundException(string entity, object id)
        : base("NOT_FOUND", $"{entity} with id {id} not found") { }
}
```

**Anti-patterns:**
```csharp
// DON'T: Catch and ignore
catch (Exception) { }

// DON'T: Catch and rethrow losing stack trace
catch (Exception ex) { throw ex; }  // Use: throw;

// DON'T: Use exceptions for flow control
if (!TryParse(input, out var result))
    throw new InvalidInputException();  // Use TryParse pattern
```

**Global handler:** See [[Global-Exception-Handler]]
```csharp
app.UseExceptionHandler(app => app.Run(async context =>
{
    var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
    // Log and return problem details
}));
```

**Result pattern:** See [[Result-Pattern]]
Alternative to exceptions for expected failures.

**Related:**
- [[Global-Exception-Handler]] - ASP.NET handling
- [[Result-Pattern]] - avoiding exceptions
- [[Problem-Details]] - error responses
