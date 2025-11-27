**Tags**: #patterns #design #api
**Links**: [[Test-Data-Builders]], [[Entity-Framework]], [[FluentValidation]]

---

### Fluent API

Fluent APIs use method chaining for readable, expressive code. Common in builders, configuration, and DSLs.

**Building a fluent API:**
```csharp
public class EmailBuilder
{
    private readonly Email _email = new();

    public EmailBuilder From(string address)
    {
        _email.From = address;
        return this;
    }

    public EmailBuilder To(string address)
    {
        _email.Recipients.Add(address);
        return this;
    }

    public EmailBuilder WithSubject(string subject)
    {
        _email.Subject = subject;
        return this;
    }

    public EmailBuilder WithBody(string body)
    {
        _email.Body = body;
        return this;
    }

    public Email Build() => _email;
}

// Usage
var email = new EmailBuilder()
    .From("sender@example.com")
    .To("recipient@example.com")
    .WithSubject("Hello")
    .WithBody("World")
    .Build();
```

**Conditional chaining:**
```csharp
public class QueryBuilder<T>
{
    private IQueryable<T> _query;

    public QueryBuilder<T> Where(bool condition, Expression<Func<T, bool>> predicate)
    {
        if (condition)
            _query = _query.Where(predicate);
        return this;
    }
}

// Usage
var query = new QueryBuilder<Order>()
    .Where(customerId.HasValue, o => o.CustomerId == customerId)
    .Where(startDate.HasValue, o => o.Date >= startDate)
    .Build();
```

**Examples in .NET:**
```csharp
// Entity Framework
modelBuilder.Entity<Order>()
    .HasKey(o => o.Id)
    .HasMany(o => o.Items)
    .WithOne(i => i.Order);

// LINQ
var result = orders
    .Where(o => o.Total > 100)
    .OrderBy(o => o.Date)
    .Select(o => o.Id);
```

**Related:**
- [[Test-Data-Builders]] - test data creation
- [[Entity-Framework]] - EF fluent config
- [[FluentValidation]] - validation rules

