**Tags**: #csharp #modern #patterns
**Links**: [[Pattern-Matching]], [[Records]], [[Expression-Bodied-Members]]

---

### Switch Expressions (C# 8+)

Switch expressions are concise, expression-based alternatives to switch statements. Return values directly without break statements.

**Basic syntax:**
```csharp
string GetDayType(DayOfWeek day) => day switch
{
    DayOfWeek.Saturday or DayOfWeek.Sunday => "Weekend",
    _ => "Weekday"
};
```

**With pattern matching:**
```csharp
string Describe(object obj) => obj switch
{
    int n when n < 0 => "Negative number",
    int n => $"Number: {n}",
    string s => $"String of length {s.Length}",
    null => "Nothing",
    _ => "Unknown type"
};
```

**Property patterns:**
```csharp
decimal GetShippingCost(Order order) => order switch
{
    { Total: > 100 } => 0,
    { Weight: < 1, Destination: "US" } => 5,
    { Weight: < 1 } => 10,
    { Destination: "US" } => 15,
    _ => 25
};
```

**Tuple patterns:**
```csharp
string GetQuadrant(int x, int y) => (x, y) switch
{
    ( > 0,  > 0) => "Q1",
    ( < 0,  > 0) => "Q2",
    ( < 0,  < 0) => "Q3",
    ( > 0,  < 0) => "Q4",
    _ => "Origin or axis"
};
```

**Type patterns with extraction:**
```csharp
double CalculateArea(Shape shape) => shape switch
{
    Circle { Radius: var r } => Math.PI * r * r,
    Rectangle { Width: var w, Height: var h } => w * h,
    Triangle { Base: var b, Height: var h } => 0.5 * b * h,
    _ => throw new ArgumentException("Unknown shape")
};
```

**List patterns (C# 11):**
```csharp
string Describe(int[] arr) => arr switch
{
    [] => "Empty",
    [var x] => $"Single: {x}",
    [var x, var y] => $"Pair: {x}, {y}",
    [var first, .., var last] => $"First: {first}, Last: {last}",
};
```

**Related:**
- [[Pattern-Matching]] - matching patterns
- [[Records]] - with patterns
- [[Deconstruction]] - extracting values
