**Tags**: #performance #memory #patterns
**Links**: [[Garbage-Collection]], [[ArrayPool]], [[Memory-Optimization]], [[Benchmarking-DotNet]]

---

### Object Pooling

Object pooling reuses objects instead of creating new ones, reducing GC pressure and allocation costs.

**ArrayPool:**
```csharp
// Rent array from pool
byte[] buffer = ArrayPool<byte>.Shared.Rent(minimumLength: 1024);
try
{
    // Use buffer (may be larger than requested!)
    int bytesRead = await stream.ReadAsync(buffer.AsMemory(0, 1024));
    ProcessData(buffer.AsSpan(0, bytesRead));
}
finally
{
    ArrayPool<byte>.Shared.Return(buffer, clearArray: true);
}
```

**ObjectPool<T>:**
```csharp
// Registration
builder.Services.AddSingleton<ObjectPool<StringBuilder>>(
    new DefaultObjectPoolProvider().CreateStringBuilderPool());

// Usage
public class ReportGenerator
{
    private readonly ObjectPool<StringBuilder> _pool;

    public string Generate(Data data)
    {
        var sb = _pool.Get();
        try
        {
            sb.AppendLine("Report");
            sb.AppendLine(data.ToString());
            return sb.ToString();
        }
        finally
        {
            _pool.Return(sb);  // Cleared and returned to pool
        }
    }
}
```

**Custom pool:**
```csharp
public class ExpensiveObjectPool
{
    private readonly ConcurrentBag<ExpensiveObject> _pool = new();

    public ExpensiveObject Rent()
    {
        return _pool.TryTake(out var obj) ? obj : new ExpensiveObject();
    }

    public void Return(ExpensiveObject obj)
    {
        obj.Reset();
        _pool.Add(obj);
    }
}
```

**When to use:**
- Large arrays (use ArrayPool)
- Expensive object creation
- High-frequency allocations in hot paths
- Buffer management

**Related:**
- [[ArrayPool]] - built-in array pooling
- [[Garbage-Collection]] - memory management
- [[Span-T]] - stack-based alternative
