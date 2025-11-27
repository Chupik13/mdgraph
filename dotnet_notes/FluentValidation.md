**Tags**: #validation #tools #patterns
**Links**: [[Validation]], [[Data-Annotations]], [[MediatR]], [[Pipeline-Behavior]]

---

### FluentValidation

FluentValidation provides a fluent interface for building validation rules, offering more flexibility than Data Annotations.

**Setup:**
```csharp
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// Auto validation in pipeline (optional)
builder.Services.AddFluentValidationAutoValidation();
```

**Validator:**
```csharp
public class CreateUserValidator : AbstractValidator<CreateUserDto>
{
    private readonly IUserRepository _userRepo;

    public CreateUserValidator(IUserRepository userRepo)
    {
        _userRepo = userRepo;

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format")
            .MustAsync(BeUniqueEmail).WithMessage("Email already exists");

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Must contain uppercase")
            .Matches("[a-z]").WithMessage("Must contain lowercase")
            .Matches("[0-9]").WithMessage("Must contain number");

        RuleFor(x => x.Age)
            .InclusiveBetween(18, 120);

        RuleFor(x => x.PhoneNumber)
            .Matches(@"^\+?[0-9]{10,15}$")
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber));
    }

    private async Task<bool> BeUniqueEmail(string email, CancellationToken ct)
    {
        return !await _userRepo.EmailExistsAsync(email, ct);
    }
}
```

**Complex rules:**
```csharp
RuleFor(x => x.EndDate)
    .GreaterThan(x => x.StartDate)
    .WithMessage("End date must be after start date");

RuleForEach(x => x.Items)
    .SetValidator(new OrderItemValidator());

When(x => x.IsCompany, () =>
{
    RuleFor(x => x.CompanyName).NotEmpty();
    RuleFor(x => x.TaxId).NotEmpty();
});
```

**MediatR integration:** See [[Pipeline-Behavior]]
```csharp
public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public async Task<TResponse> Handle(TRequest request, ...)
    {
        var failures = _validators
            .Select(v => v.Validate(request))
            .SelectMany(r => r.Errors)
            .Where(f => f != null);

        if (failures.Any())
            throw new ValidationException(failures);

        return await next();
    }
}
```

**Related:**
- [[Validation]] - validation overview
- [[Pipeline-Behavior]] - MediatR pipeline
- [[Data-Annotations]] - alternative approach
