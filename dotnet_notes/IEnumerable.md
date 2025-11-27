**Tags**: #csharp #collections #fundamentals
**Links**: [[LINQ]], [[IQueryable]], [[yield-return]], [[IAsyncEnumerable]]

---

### IEnumerable<T>

The fundamental interface for iteration in .NET. Exposes an enumerator for forward-only traversal.

**Definition:**
```csharp
public interface IEnumerable<T> : IEnumerable
{
    IEnumerator<T> GetEnumerator();
}
```

**Implementing with yield:**
```csharp
public IEnumerable<int> GetNumbers(int count)
{
    for (int i = 0; i < count; i++)
    {
        yield return i; // Lazy generation
    }
}
```

**Key characteristics:**
- Forward-only iteration
- Lazy evaluation (deferred execution)
- Can only be enumerated (no count, no indexing)
- May be infinite

**Common pitfalls:**
- Multiple enumeration (query runs multiple times)
- Not suitable for database queries - use [[IQueryable]]
- Consider `ToList()` / `ToArray()` to materialize

**Multiple enumeration warning:**
```csharp
IEnumerable<User> users = GetUsers(); // Query
var count = users.Count();  // Executes query
var list = users.ToList();  // Executes AGAIN!
```

**Related:**
- [[yield-return]] - creating enumerables
- [[IQueryable]] - for translatable queries
- [[IAsyncEnumerable]] - async iteration
- [[LINQ]] - query operators
