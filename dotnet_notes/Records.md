**Tags**: #csharp #types #modern
**Links**: [[Immutability]], [[Value-Equality]], [[Pattern-Matching]], [[DTOs]]

---

### Records (C# 9+)

Records are reference types designed for immutable data with value-based equality. Perfect for [[DTOs]] and domain objects.

**Record class:**
```csharp
public record Person(string Name, int Age);

// Equivalent to:
public record Person
{
    public string Name { get; init; }
    public int Age { get; init; }
}
```

**Record struct (C# 10+):**
```csharp
public readonly record struct Point(int X, int Y);
```

**Features:**
- Value-based equality (compares all properties)
- Built-in `ToString()` implementation
- Deconstruction support
- `with` expressions for copying

**With expressions:**
```csharp
var person = new Person("Alice", 30);
var older = person with { Age = 31 };  // Non-destructive mutation
```

**Inheritance:**
```csharp
public record Person(string Name);
public record Employee(string Name, string Department) : Person(Name);
```

**When to use:**
- [[DTOs]] and API responses
- Event sourcing events
- Immutable domain objects
- [[Pattern-Matching]] targets

**Related:**
- [[Immutability]] - design principles
- [[Value-Equality]] - how equality works
- [[Init-Only-Properties]] - init setters
- [[Primary-Constructors]] - C# 12 feature
