**Tags**: #csharp #fundamentals #patterns
**Links**: [[LINQ]], [[Fluent-Interfaces]], [[Static-Classes]], [[Method-Chaining]]

---

### Extension Methods

Extension methods add functionality to existing types without modifying them. They're static methods that appear as instance methods.

**Defining:**
```csharp
public static class StringExtensions
{
    public static bool IsNullOrEmpty(this string? value)
    {
        return string.IsNullOrEmpty(value);
    }

    public static string Truncate(this string value, int maxLength)
    {
        if (value.Length <= maxLength) return value;
        return value[..maxLength] + "...";
    }
}
```

**Using:**
```csharp
string name = "Hello World";
bool empty = name.IsNullOrEmpty();     // Like instance method
string short = name.Truncate(5);       // "Hello..."
```

**LINQ is extension methods:**
```csharp
// Where, Select, etc. are extensions on IEnumerable<T>
var result = items.Where(x => x > 5).Select(x => x * 2);
```

**Best practices:**
- Use for utility operations
- Don't overuse - prefer instance methods when possible
- Keep extensions in dedicated static classes
- Use meaningful namespaces

**[[Fluent-Interfaces]]:**
```csharp
public static IQueryBuilder<T> Where<T>(this IQueryBuilder<T> builder, ...)
public static IQueryBuilder<T> OrderBy<T>(this IQueryBuilder<T> builder, ...)

// Enables:
query.Where(x => x.Active).OrderBy(x => x.Name);
```

**Related:**
- [[LINQ]] - built on extensions
- [[Fluent-Interfaces]] - chainable APIs
- [[Method-Chaining]] - return patterns
