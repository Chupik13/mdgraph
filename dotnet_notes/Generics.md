**Tags**: #csharp #fundamentals #types
**Links**: [[Generic-Constraints]], [[Covariance-Contravariance]], [[Collections]], [[Type-Parameters]]

---

### Generics

Generics enable type-safe data structures and methods without committing to a specific type. They avoid boxing and provide compile-time type checking.

**Generic class:**
```csharp
public class Repository<T> where T : class, IEntity
{
    private readonly List<T> _items = new();

    public void Add(T item) => _items.Add(item);
    public T? GetById(int id) => _items.FirstOrDefault(x => x.Id == id);
}
```

**Generic method:**
```csharp
public T Max<T>(T a, T b) where T : IComparable<T>
{
    return a.CompareTo(b) > 0 ? a : b;
}
```

**Benefits:**
- Type safety at compile time
- No boxing/unboxing for value types
- Code reuse without duplication
- Better performance than `object`

**Constraints:** See [[Generic-Constraints]]
- `where T : class` - reference type
- `where T : struct` - value type
- `where T : new()` - parameterless constructor
- `where T : IInterface` - implements interface
- `where T : BaseClass` - inherits from class

**Related:**
- [[Generic-Constraints]] - limiting type parameters
- [[Covariance-Contravariance]] - variance in generics
- [[Collections]] - generic collections
