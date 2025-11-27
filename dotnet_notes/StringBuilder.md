**Tags**: #csharp #performance #strings
**Links**: [[String-Handling]], [[Memory-Optimization]], [[Object-Pooling]]

---

### StringBuilder

StringBuilder provides a mutable buffer for efficient string construction. Essential when concatenating many strings.

**Basic usage:**
```csharp
var sb = new StringBuilder();
sb.Append("Hello");
sb.Append(' ');
sb.Append("World");
sb.AppendLine("!");

string result = sb.ToString();
```

**Chained methods:**
```csharp
var html = new StringBuilder()
    .AppendLine("<html>")
    .AppendLine("<body>")
    .Append("<h1>").Append(title).AppendLine("</h1>")
    .AppendLine("</body>")
    .AppendLine("</html>")
    .ToString();
```

**With initial capacity:**
```csharp
// Avoid reallocations by setting capacity
var sb = new StringBuilder(capacity: 1024);

// Or estimate based on content
var sb = new StringBuilder(items.Count * 50);
```

**Format and interpolation:**
```csharp
sb.AppendFormat("User {0} logged in at {1:HH:mm}", user, DateTime.Now);

// .NET 6+ interpolation handler (efficient!)
sb.Append($"Processing item {itemId} of {total}");
```

**Pooled StringBuilder:**
```csharp
// Rent from pool to avoid allocation
var sb = StringBuilderPool.Shared.Get();
try
{
    sb.Append("...");
    return sb.ToString();
}
finally
{
    StringBuilderPool.Shared.Return(sb);
}
```

**When to use:**
- Concatenating in loops
- Building large strings dynamically
- Generating text output (HTML, CSV, logs)

**Related:**
- [[String-Handling]] - string operations
- [[Object-Pooling]] - reusing builders
- [[Memory-Optimization]] - reducing allocations

