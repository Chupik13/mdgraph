**Tags**: #csharp #generics #types
**Links**: [[Generics]], [[Covariance-Contravariance]], [[Interface-Design]]

---

### Generic Constraints

Constraints restrict which types can be used as type arguments, enabling access to specific members and operations.

**Available constraints:**
```csharp
where T : struct          // Value type (non-nullable)
where T : class           // Reference type
where T : class?          // Nullable reference type
where T : notnull         // Non-nullable type
where T : new()           // Has parameterless constructor
where T : BaseClass       // Inherits from BaseClass
where T : IInterface      // Implements interface
where T : U               // T derives from U
where T : unmanaged       // Unmanaged type (for interop)
where T : default         // Allows override of constraint
```

**Multiple constraints:**
```csharp
public class Service<T> where T : class, IEntity, new()
{
    public T Create()
    {
        var entity = new T();  // new() constraint
        entity.Id = GenerateId();  // IEntity constraint
        return entity;
    }
}
```

**Mathematical operations (C# 11+):**
```csharp
public T Sum<T>(T[] values) where T : INumber<T>
{
    T result = T.Zero;
    foreach (var value in values)
        result += value;
    return result;
}
```

**When to use:**
- Need to call specific methods on T
- Need to create instances of T
- Need to ensure type compatibility

**Related:**
- [[Generics]] - generic fundamentals
- [[Static-Abstract-Members]] - C# 11 interfaces
- [[Interface-Design]] - designing for generics
