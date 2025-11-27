**Tags**: #csharp #performance #fundamentals
**Links**: [[Span-T]], [[Memory-Optimization]], [[StringBuilder]]

---

### String Handling

Strings in .NET are immutable. Understanding efficient string operations is crucial for performance.

**String interpolation:**
```csharp
// Simple interpolation
var message = $"Hello, {name}!";

// With format specifiers
var price = $"Price: {amount:C2}";      // Currency
var date = $"Date: {now:yyyy-MM-dd}";   // Date format
var aligned = $"{value,10:F2}";         // Right-align, 2 decimals
```

**StringBuilder for concatenation:**
```csharp
// BAD - creates many intermediate strings
var result = "";
for (int i = 0; i < 1000; i++)
    result += i.ToString();

// GOOD - single buffer
var sb = new StringBuilder();
for (int i = 0; i < 1000; i++)
    sb.Append(i);
var result = sb.ToString();
```

**Span-based parsing:**
```csharp
// Avoid allocations with Span
ReadOnlySpan<char> text = "Hello, World!";
var comma = text.IndexOf(',');
var greeting = text[..comma];           // "Hello"
var name = text[(comma + 2)..];         // "World!"

// Parse numbers without allocation
int.TryParse("123".AsSpan(), out var number);
```

**String comparison:**
```csharp
// Case-insensitive comparison
bool equal = string.Equals(a, b, StringComparison.OrdinalIgnoreCase);

// Culture-aware comparison
bool culturalEqual = string.Equals(a, b, StringComparison.CurrentCultureIgnoreCase);

// Best performance for simple comparisons
bool ordinalEqual = string.Equals(a, b, StringComparison.Ordinal);
```

**String interning:**
```csharp
// Reuse identical strings
var interned = string.Intern(myString);
```

**Related:**
- [[Span-T]] - zero-allocation slicing
- [[StringBuilder]] - efficient building
- [[Memory-Optimization]] - reducing allocations

