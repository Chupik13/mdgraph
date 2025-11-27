**Tags**: #csharp #async #performance
**Links**: [[Task]], [[async-await]], [[Memory-Optimization]], [[Object-Pooling]]

---

### ValueTask and ValueTask<T>

`ValueTask<T>` is a discriminated union of `T` and `Task<T>`, designed to avoid heap allocations when results are often available synchronously.

**When to use:**
- Method often completes synchronously (cached results)
- High-performance scenarios with frequent calls
- Implementing [[IAsyncEnumerable]]

**When NOT to use:**
- Most application code (use [[Task]] instead)
- When the result will always be awaited once
- If you need to await multiple times

**Example:**
```csharp
public ValueTask<int> GetCachedValueAsync(string key)
{
    if (_cache.TryGetValue(key, out int value))
        return new ValueTask<int>(value); // No allocation

    return new ValueTask<int>(LoadFromDatabaseAsync(key));
}
```

**Important rules:**
- Never await a ValueTask more than once
- Never use `.GetAwaiter().GetResult()` before completion
- Use `AsTask()` if you need Task semantics

**Related:**
- [[IValueTaskSource]] - custom implementations
- [[Memory-Optimization]] - reducing allocations
- [[Benchmarking-DotNet]] - measuring impact
