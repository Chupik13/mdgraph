**Tags**: #architecture #patterns #library
**Links**: [[Mediator-Pattern]], [[CQRS]], [[Pipeline-Behavior]], [[Clean-Architecture]]

---

### MediatR

MediatR is a simple mediator implementation for .NET. Popular for implementing [[CQRS]] and decoupling request handling.

**Setup:**
```csharp
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));
```

**Request and handler:**
```csharp
// Request
public record GetUserQuery(int Id) : IRequest<UserDto?>;

// Handler
public class GetUserQueryHandler : IRequestHandler<GetUserQuery, UserDto?>
{
    private readonly IUserRepository _repository;

    public GetUserQueryHandler(IUserRepository repository)
    {
        _repository = repository;
    }

    public async Task<UserDto?> Handle(GetUserQuery request, CancellationToken ct)
    {
        var user = await _repository.GetByIdAsync(request.Id, ct);
        return user is null ? null : new UserDto(user.Id, user.Name);
    }
}
```

**Usage in controller:**
```csharp
[ApiController]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> Get(int id)
    {
        var result = await _mediator.Send(new GetUserQuery(id));
        return result is null ? NotFound() : Ok(result);
    }
}
```

**Pipeline behaviors:** See [[Pipeline-Behavior]]
```csharp
public class ValidationBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public async Task<TResponse> Handle(TRequest request,
        RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        var failures = _validators
            .Select(v => v.Validate(request))
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Any())
            throw new ValidationException(failures);

        return await next();
    }
}
```

**Notifications (pub/sub):**
```csharp
public record UserCreatedEvent(int UserId) : INotification;

public class SendWelcomeEmail : INotificationHandler<UserCreatedEvent> { ... }
public class CreateAuditLog : INotificationHandler<UserCreatedEvent> { ... }

await _mediator.Publish(new UserCreatedEvent(user.Id));
```

**Related:**
- [[Mediator-Pattern]] - design pattern
- [[CQRS]] - command/query separation
- [[Pipeline-Behavior]] - cross-cutting concerns
