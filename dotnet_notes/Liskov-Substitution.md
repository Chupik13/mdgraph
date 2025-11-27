**Tags**: #solid #principles #design
**Links**: [[SOLID-Principles]], [[Inheritance]], [[Polymorphism]]

---

### Liskov Substitution Principle (LSP)

Objects of a superclass should be replaceable with objects of its subclasses without breaking the program.

**Classic violation - Square/Rectangle:**
```csharp
// BAD - Square breaks Rectangle contract
public class Rectangle
{
    public virtual int Width { get; set; }
    public virtual int Height { get; set; }
    public int Area => Width * Height;
}

public class Square : Rectangle
{
    public override int Width
    {
        set { base.Width = base.Height = value; }
    }
    public override int Height
    {
        set { base.Width = base.Height = value; }
    }
}

// This breaks unexpectedly
Rectangle rect = new Square();
rect.Width = 5;
rect.Height = 10;
Console.WriteLine(rect.Area); // Expected: 50, Actual: 100
```

**Following LSP:**
```csharp
// GOOD - separate abstractions
public interface IShape
{
    int Area { get; }
}

public class Rectangle : IShape
{
    public int Width { get; set; }
    public int Height { get; set; }
    public int Area => Width * Height;
}

public class Square : IShape
{
    public int Side { get; set; }
    public int Area => Side * Side;
}
```

**LSP rules:**
- Preconditions cannot be strengthened
- Postconditions cannot be weakened
- Invariants must be preserved
- Don't throw unexpected exceptions

**Related:**
- [[SOLID-Principles]] - LSP is the L in SOLID
- [[Inheritance]] - LSP guides proper inheritance
- [[Design-by-Contract]] - formal approach to LSP

