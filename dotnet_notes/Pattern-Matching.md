**Tags**: #csharp #modern #fundamentals
**Links**: [[Switch-Expressions]], [[Records]], [[Type-Checking]], [[Deconstruction]]

---

### Pattern Matching

Pattern matching enables testing values against patterns and extracting information. Evolved significantly from C# 7 to C# 11.

**Type patterns:**
```csharp
if (obj is string s)
{
    Console.WriteLine(s.Length);
}

// Negation
if (obj is not null)
{
    Process(obj);
}
```

**Switch expressions:** See [[Switch-Expressions]]
```csharp
string GetDescription(Shape shape) => shape switch
{
    Circle { Radius: > 10 } => "Large circle",
    Circle c => $"Circle with radius {c.Radius}",
    Rectangle { Width: var w, Height: var h } when w == h => "Square",
    Rectangle r => $"Rectangle {r.Width}x{r.Height}",
    _ => "Unknown shape"
};
```

**Property patterns:**
```csharp
if (person is { Age: >= 18, Country: "US" })
{
    AllowVoting();
}
```

**List patterns (C# 11):**
```csharp
int[] numbers = { 1, 2, 3 };
var result = numbers switch
{
    [1, 2, 3] => "Exact match",
    [1, ..] => "Starts with 1",
    [.., 3] => "Ends with 3",
    [] => "Empty",
    _ => "Other"
};
```

**Relational patterns:**
```csharp
string Classify(int n) => n switch
{
    < 0 => "Negative",
    0 => "Zero",
    > 0 and < 10 => "Single digit",
    _ => "Multiple digits"
};
```

**Related:**
- [[Switch-Expressions]] - expression-based switch
- [[Records]] - ideal for pattern matching
- [[Deconstruction]] - extracting values
