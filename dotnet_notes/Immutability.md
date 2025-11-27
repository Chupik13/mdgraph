**Tags**: #csharp #patterns #functional
**Links**: [[Records]], [[Value-Objects]], [[Concurrency-Patterns]], [[Thread-Safety]]

---

### Immutability

Immutable objects cannot be modified after creation. They're inherently thread-safe and prevent unexpected side effects.

**Creating immutable types:**

**Records (preferred):**
```csharp
public record Person(string Name, int Age);

var person = new Person("Alice", 30);
var older = person with { Age = 31 };  // New instance
```

**Init-only properties:**
```csharp
public class Config
{
    public string ConnectionString { get; init; } = "";
    public int Timeout { get; init; }
}

var config = new Config { ConnectionString = "...", Timeout = 30 };
// config.Timeout = 60;  // Error!
```

**Readonly fields:**
```csharp
public class ImmutablePoint
{
    public readonly int X;
    public readonly int Y;

    public ImmutablePoint(int x, int y) => (X, Y) = (x, y);
}
```

**Immutable collections:**
```csharp
using System.Collections.Immutable;

var list = ImmutableList.Create(1, 2, 3);
var newList = list.Add(4);  // Returns new list

var dict = ImmutableDictionary<string, int>.Empty
    .Add("one", 1)
    .Add("two", 2);
```

**Benefits:**
- Thread-safe by design
- No defensive copies needed
- Predictable behavior
- Easy to reason about
- Safe for dictionary keys

**When to use:**
- [[Value-Objects]] in DDD
- Configuration objects
- Event data
- Concurrent access scenarios

**Drawbacks:**
- More allocations (mitigated with object pooling)
- Builder pattern needed for complex construction

**Related:**
- [[Records]] - C# support
- [[Value-Objects]] - DDD pattern
- [[Thread-Safety]] - concurrency
