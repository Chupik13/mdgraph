**Tags**: #solid #principles #design
**Links**: [[SOLID-Principles]], [[Strategy-Pattern]], [[Polymorphism]]

---

### Open/Closed Principle (OCP)

Software entities should be open for extension but closed for modification. Add new behavior without changing existing code.

**Violation:**
```csharp
// BAD - must modify class for each new shape
public class AreaCalculator
{
    public double Calculate(object shape)
    {
        if (shape is Rectangle r)
            return r.Width * r.Height;
        if (shape is Circle c)
            return Math.PI * c.Radius * c.Radius;
        // Must add new if-statement for each shape
        throw new NotSupportedException();
    }
}
```

**Following OCP:**
```csharp
// GOOD - extend without modification
public interface IShape
{
    double CalculateArea();
}

public class Rectangle : IShape
{
    public double Width { get; set; }
    public double Height { get; set; }
    public double CalculateArea() => Width * Height;
}

public class Circle : IShape
{
    public double Radius { get; set; }
    public double CalculateArea() => Math.PI * Radius * Radius;
}

// New shapes don't require changes to existing code
public class Triangle : IShape
{
    public double Base { get; set; }
    public double Height { get; set; }
    public double CalculateArea() => 0.5 * Base * Height;
}
```

**Common OCP patterns:**
- Strategy pattern for interchangeable algorithms
- Decorator pattern for adding behavior
- Plugin architectures

**Related:**
- [[SOLID-Principles]] - OCP is the O in SOLID
- [[Strategy-Pattern]] - common way to achieve OCP
- [[Polymorphism]] - enables OCP through inheritance

