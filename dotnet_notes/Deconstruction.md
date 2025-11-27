**Tags**: #csharp #modern #syntax
**Links**: [[Records]], [[Pattern-Matching]], [[Tuples]]

---

### Deconstruction

Deconstruction extracts values from objects into separate variables. Works with tuples, records, and custom types.

**Tuple deconstruction:**
```csharp
var tuple = (1, "hello", true);
var (number, text, flag) = tuple;

// Method return
(int min, int max) = GetRange();

// Ignore with discard
var (_, name, _) = GetPerson();
```

**Record deconstruction:**
```csharp
public record Person(string Name, int Age);

var person = new Person("Alice", 30);
var (name, age) = person;
```

**Custom deconstruction:**
```csharp
public class Point
{
    public int X { get; }
    public int Y { get; }

    public void Deconstruct(out int x, out int y)
    {
        x = X;
        y = Y;
    }
}

var point = new Point(10, 20);
var (x, y) = point;
```

**Extension deconstruction:**
```csharp
public static class Extensions
{
    public static void Deconstruct(this DateTime dt,
        out int year, out int month, out int day)
    {
        year = dt.Year;
        month = dt.Month;
        day = dt.Day;
    }
}

var (year, month, day) = DateTime.Now;
```

**In foreach:**
```csharp
var dict = new Dictionary<string, int> { ["a"] = 1, ["b"] = 2 };

foreach (var (key, value) in dict)
{
    Console.WriteLine($"{key}: {value}");
}
```

**With pattern matching:**
```csharp
if (point is (0, 0))
    Console.WriteLine("Origin");

var result = point switch
{
    (0, 0) => "Origin",
    (var x, 0) => $"On X axis at {x}",
    (0, var y) => $"On Y axis at {y}",
    (var x, var y) => $"Point at ({x}, {y})"
};
```

**Related:**
- [[Records]] - built-in deconstruction
- [[Tuples]] - tuple types
- [[Pattern-Matching]] - destructuring patterns
