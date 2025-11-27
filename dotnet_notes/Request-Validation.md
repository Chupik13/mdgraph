**Tags**: #aspnet #validation #security
**Links**: [[Data-Annotations]], [[FluentValidation]], [[Model-Binding]]

---

### Request Validation

Validate incoming requests to ensure data integrity and security before processing.

**Data annotations validation:**
```csharp
public class CreateOrderRequest
{
    [Required]
    [StringLength(100)]
    public string CustomerName { get; set; }

    [Required]
    [MinLength(1)]
    public List<OrderItemRequest> Items { get; set; }

    [Range(0, 1000000)]
    public decimal? DiscountAmount { get; set; }
}

// Automatic validation in controllers
[HttpPost]
public IActionResult Create(CreateOrderRequest request)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);
    // Process valid request
}
```

**FluentValidation:**
```csharp
public class CreateOrderValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.CustomerName)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Items)
            .NotEmpty()
            .WithMessage("Order must have at least one item");

        RuleForEach(x => x.Items)
            .SetValidator(new OrderItemValidator());

        RuleFor(x => x.DiscountAmount)
            .LessThanOrEqualTo(x => x.Items.Sum(i => i.Price))
            .When(x => x.DiscountAmount.HasValue)
            .WithMessage("Discount cannot exceed order total");
    }
}
```

**Minimal API validation:**
```csharp
app.MapPost("/orders", async (CreateOrderRequest request, IValidator<CreateOrderRequest> validator) =>
{
    var result = await validator.ValidateAsync(request);
    if (!result.IsValid)
        return Results.ValidationProblem(result.ToDictionary());

    // Process valid request
    return Results.Created($"/orders/{order.Id}", order);
});
```

**Related:**
- [[Data-Annotations]] - annotation validation
- [[FluentValidation]] - complex validation
- [[Model-Binding]] - request binding

