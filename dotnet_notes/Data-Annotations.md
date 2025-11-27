**Tags**: #validation #aspnet #attributes
**Links**: [[Attributes]], [[FluentValidation]], [[Model-Binding]]

---

### Data Annotations

Data annotations provide declarative validation rules. Built into ASP.NET Core model binding.

**Common validators:**
```csharp
public class CreateProductRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; set; }

    [Range(0.01, 999999.99)]
    public decimal Price { get; set; }

    [Url]
    public string? ImageUrl { get; set; }

    [EmailAddress]
    public string ContactEmail { get; set; }

    [Phone]
    public string? PhoneNumber { get; set; }

    [RegularExpression(@"^[A-Z]{2}\d{4}$")]
    public string ProductCode { get; set; }

    [Compare(nameof(Password))]
    public string ConfirmPassword { get; set; }
}
```

**Custom validation attribute:**
```csharp
public class FutureDateAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext context)
    {
        if (value is DateTime date && date <= DateTime.Now)
        {
            return new ValidationResult("Date must be in the future");
        }
        return ValidationResult.Success;
    }
}

// Usage
[FutureDate]
public DateTime StartDate { get; set; }
```

**Manual validation:**
```csharp
var context = new ValidationContext(model);
var results = new List<ValidationResult>();

bool isValid = Validator.TryValidateObject(
    model,
    context,
    results,
    validateAllProperties: true);

if (!isValid)
{
    foreach (var error in results)
    {
        Console.WriteLine($"{error.MemberNames.First()}: {error.ErrorMessage}");
    }
}
```

**Related:**
- [[FluentValidation]] - more complex validation
- [[Model-Binding]] - ASP.NET binding
- [[Attributes]] - attribute basics

