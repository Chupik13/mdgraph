**Tags**: #ddd #patterns #design
**Links**: [[DDD]], [[Records]], [[Immutability]], [[Entity-vs-Value-Object]]

---

### Value Objects

Value objects are immutable objects defined by their attributes, not identity. Two value objects with same attributes are equal.

**Using records (C# 9+):**
```csharp
public record Money(decimal Amount, string Currency)
{
    public static Money Zero(string currency) => new(0, currency);

    public static Money operator +(Money a, Money b)
    {
        if (a.Currency != b.Currency)
            throw new InvalidOperationException("Currency mismatch");
        return new Money(a.Amount + b.Amount, a.Currency);
    }

    public Money MultiplyBy(decimal factor) => this with { Amount = Amount * factor };
}

public record Address(string Street, string City, string PostalCode, string Country);

public record Email
{
    public string Value { get; }

    public Email(string value)
    {
        if (!IsValid(value))
            throw new ArgumentException("Invalid email format");
        Value = value.ToLowerInvariant();
    }

    private static bool IsValid(string email) =>
        Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");
}
```

**Characteristics:**
- Immutable - no setters
- Value equality - compared by attributes
- Self-validating - enforce invariants
- No identity - interchangeable if equal
- Side-effect free methods

**In Entity Framework:**
```csharp
// Owned entity (stored in same table)
modelBuilder.Entity<Order>()
    .OwnsOne(o => o.ShippingAddress);

// Or complex type (EF Core 8+)
modelBuilder.ComplexProperty<Address>();
```

**Entity vs Value Object:**
| Entity | Value Object |
|--------|--------------|
| Has identity (Id) | No identity |
| Mutable | Immutable |
| Compared by Id | Compared by attributes |
| Example: User | Example: Address |

**Related:**
- [[DDD]] - strategic design
- [[Records]] - C# implementation
- [[Aggregates]] - containing value objects
