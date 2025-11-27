**Tags**: #aspnet #patterns #data
**Links**: [[Data-Annotations]], [[FluentValidation]], [[Model-Binding]], [[Problem-Details]]

---

### Input Validation

Validation ensures incoming data meets requirements. Multiple approaches available.

**Data Annotations:**
```csharp
public class CreateUserDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = "";

    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";

    [Range(18, 150)]
    public int Age { get; set; }

    [RegularExpression(@"^\+?[0-9]{10,15}$")]
    public string? Phone { get; set; }
}
```

**[ApiController] auto-validation:**
```csharp
// Automatically returns 400 if validation fails
[HttpPost]
public ActionResult<User> Create(CreateUserDto dto)
{
    // If we reach here, dto is valid
}
```

**FluentValidation:** See [[FluentValidation]]
```csharp
public class CreateUserValidator : AbstractValidator<CreateUserDto>
{
    public CreateUserValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .Length(2, 100);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MustAsync(BeUniqueEmail).WithMessage("Email already exists");

        RuleFor(x => x.Age)
            .InclusiveBetween(18, 150);
    }

    private async Task<bool> BeUniqueEmail(string email, CancellationToken ct)
    {
        return !await _userRepository.ExistsAsync(email);
    }
}
```

**Manual validation:**
```csharp
if (!ModelState.IsValid)
{
    return BadRequest(ModelState);
}
```

**Best practices:**
- Validate at API boundary
- Return clear error messages
- Use [[Problem-Details]] for errors
- Don't trust client-side validation alone

**Related:**
- [[FluentValidation]] - fluent rules
- [[Data-Annotations]] - attribute-based
- [[Problem-Details]] - error format
