**Tags**: #testing #methodology #quality
**Links**: [[Unit-Testing]], [[xUnit]], [[Red-Green-Refactor]], [[Test-Doubles]]

---

### Test-Driven Development (TDD)

TDD is a development approach where tests are written before production code. The cycle: Red → Green → Refactor.

**Red-Green-Refactor cycle:**
```
1. RED    - Write failing test
2. GREEN  - Write minimal code to pass
3. REFACTOR - Improve code, keep tests passing
```

**Example workflow:**

**1. Red - Write the test:**
```csharp
[Fact]
public void Calculate_ValidOrder_ReturnsTotal()
{
    var calculator = new OrderCalculator();
    var order = new Order
    {
        Lines = new List<OrderLine>
        {
            new(ProductId: 1, Price: 10.00m, Quantity: 2),
            new(ProductId: 2, Price: 5.00m, Quantity: 3)
        }
    };

    var total = calculator.Calculate(order);

    Assert.Equal(35.00m, total);
}
```

**2. Green - Make it pass:**
```csharp
public class OrderCalculator
{
    public decimal Calculate(Order order)
    {
        return order.Lines.Sum(l => l.Price * l.Quantity);
    }
}
```

**3. Refactor - Improve:**
```csharp
public decimal Calculate(Order order)
{
    ArgumentNullException.ThrowIfNull(order);
    return order.Lines?.Sum(l => l.LineTotal) ?? 0;
}
```

**TDD benefits:**
- Requirements clarified before coding
- High test coverage by default
- Better design through testability focus
- Confidence in refactoring
- Living documentation

**TDD challenges:**
- Learning curve
- Slower initial development
- May drive bad tests if done wrong
- Not suitable for all scenarios (exploratory coding)

**Tips:**
- Start with simple cases
- One assertion per test
- Test behavior, not implementation
- Don't skip refactor step

**Related:**
- [[Unit-Testing]] - testing fundamentals
- [[Red-Green-Refactor]] - the cycle
- [[Test-Doubles]] - mocking in TDD
