**Tags**: #csharp #fundamentals #types
**Links**: [[Deconstruction]], [[Records]], [[Anonymous-Types]]

---

### Tuples

Value tuples provide lightweight data structures for grouping values without creating a class.

**Creating tuples:**
```csharp
// Unnamed
var point = (10, 20);
Console.WriteLine(point.Item1);  // 10

// Named
var person = (Name: "Alice", Age: 30);
Console.WriteLine(person.Name);   // Alice

// Explicit type
(string Name, int Age) person = ("Bob", 25);
```

**Return multiple values:**
```csharp
public (int Min, int Max, double Average) GetStats(int[] numbers)
{
    return (numbers.Min(), numbers.Max(), numbers.Average());
}

var stats = GetStats(data);
Console.WriteLine($"Range: {stats.Min}-{stats.Max}, Avg: {stats.Average}");

// Or deconstruct
var (min, max, avg) = GetStats(data);
```

**Tuple equality:**
```csharp
var a = (1, "hello");
var b = (1, "hello");
Console.WriteLine(a == b);  // True - value equality
```

**In dictionaries:**
```csharp
var lookup = new Dictionary<(int X, int Y), string>
{
    [(0, 0)] = "Origin",
    [(1, 0)] = "Right",
    [(0, 1)] = "Up"
};

var value = lookup[(0, 0)];  // "Origin"
```

**With LINQ:**
```csharp
var results = items
    .Select(x => (x.Id, Total: x.Price * x.Quantity))
    .Where(x => x.Total > 100);
```

**Tuple vs Record:**
| Tuple | Record |
|-------|--------|
| Quick, inline | Named type |
| Value semantics | Reference type |
| No methods | Can have methods |
| Limited tooling | Full class features |

**Related:**
- [[Records]] - named alternative
- [[Deconstruction]] - extracting values
- [[Anonymous-Types]] - query projections
