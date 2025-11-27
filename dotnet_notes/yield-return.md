**Tags**: #csharp #iterators #linq
**Links**: [[IEnumerable]], [[IAsyncEnumerable]], [[LINQ]], [[Lazy-Evaluation]]

---

### yield return

The `yield` keyword creates iterators without implementing IEnumerator manually. Enables lazy evaluation of sequences.

**Basic usage:**
```csharp
public IEnumerable<int> GetNumbers(int count)
{
    for (int i = 0; i < count; i++)
    {
        yield return i;
    }
}

// Each value is generated on demand
foreach (var n in GetNumbers(1000000))
{
    if (n > 10) break;  // Only generates 11 values
}
```

**yield break:**
```csharp
public IEnumerable<int> GetPositive(IEnumerable<int> source)
{
    foreach (var item in source)
    {
        if (item < 0)
            yield break;  // Stops iteration
        yield return item;
    }
}
```

**Infinite sequences:**
```csharp
public IEnumerable<int> Fibonacci()
{
    int a = 0, b = 1;
    while (true)
    {
        yield return a;
        (a, b) = (b, a + b);
    }
}

// Take what you need
var first10 = Fibonacci().Take(10);
```

**How it works:**
- Compiler generates state machine
- Execution pauses at each `yield return`
- Resumes when next value requested
- Memory efficient for large sequences

**Async iterators:**
```csharp
public async IAsyncEnumerable<User> GetUsersAsync()
{
    await foreach (var batch in GetBatchesAsync())
    {
        foreach (var user in batch)
        {
            yield return user;
        }
    }
}
```

**Limitations:**
- Cannot use `yield` in try block with catch
- Cannot use in anonymous methods (before C# 10)

**Related:**
- [[IEnumerable]] - iterator interface
- [[Lazy-Evaluation]] - deferred execution
- [[LINQ]] - uses iterators internally
