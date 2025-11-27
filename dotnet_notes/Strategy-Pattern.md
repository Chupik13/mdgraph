**Tags**: #patterns #behavioral #design
**Links**: [[Open-Closed]], [[Factory-Pattern]], [[Dependency-Injection]]

---

### Strategy Pattern

Strategy pattern defines a family of algorithms and makes them interchangeable. Client code works with the strategy interface.

**Define strategy interface:**
```csharp
public interface IShippingCalculator
{
    decimal Calculate(Order order);
}

public class StandardShipping : IShippingCalculator
{
    public decimal Calculate(Order order) => order.Weight * 0.5m;
}

public class ExpressShipping : IShippingCalculator
{
    public decimal Calculate(Order order) => order.Weight * 1.5m + 10m;
}

public class FreeShipping : IShippingCalculator
{
    public decimal Calculate(Order order) => 0m;
}
```

**Use strategy:**
```csharp
public class OrderService
{
    private readonly IShippingCalculator _shippingCalculator;

    public OrderService(IShippingCalculator shippingCalculator)
    {
        _shippingCalculator = shippingCalculator;
    }

    public decimal CalculateTotal(Order order)
    {
        var subtotal = order.Items.Sum(i => i.Price);
        var shipping = _shippingCalculator.Calculate(order);
        return subtotal + shipping;
    }
}
```

**With factory for runtime selection:**
```csharp
public class ShippingCalculatorFactory
{
    public IShippingCalculator Create(ShippingMethod method, Order order) => method switch
    {
        ShippingMethod.Standard => new StandardShipping(),
        ShippingMethod.Express => new ExpressShipping(),
        _ when order.Total > 100 => new FreeShipping(),
        _ => new StandardShipping()
    };
}
```

**DI registration:**
```csharp
builder.Services.AddScoped<IShippingCalculator, StandardShipping>();
// Or configure based on settings
builder.Services.AddScoped<IShippingCalculator>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    return config["DefaultShipping"] == "Express"
        ? new ExpressShipping()
        : new StandardShipping();
});
```

**Related:**
- [[Open-Closed]] - extend without modification
- [[Factory-Pattern]] - creating strategies
- [[Dependency-Injection]] - injecting strategies

