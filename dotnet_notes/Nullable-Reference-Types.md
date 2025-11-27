**Tags**: #csharp #safety #modern
**Links**: [[Null-Safety]], [[Nullable-Value-Types]], [[Null-Coalescing]], [[Defensive-Programming]]

---

### Nullable Reference Types (C# 8+)

Nullable reference types help prevent null reference exceptions by distinguishing between nullable and non-nullable references at compile time.

**Enabling:**
```xml
<!-- In .csproj -->
<Nullable>enable</Nullable>
```

**Syntax:**
```csharp
string name = "Alice";    // Non-nullable, cannot be null
string? nickname = null;  // Nullable, can be null

// Compiler warning if you access nullable without check
nickname.Length;  // Warning CS8602

// Safe access
if (nickname is not null)
{
    Console.WriteLine(nickname.Length);  // OK
}
```

**Annotations:**
```csharp
public class User
{
    public string Name { get; set; } = "";  // Non-nullable with default
    public string? Email { get; set; }       // Nullable
}
```

**Null-forgiving operator:**
```csharp
string? maybeNull = GetValue();
string definitelyNotNull = maybeNull!;  // Trust me, compiler
```

**Best practices:**
- Enable in all new projects
- Use `??` and `?.` operators - see [[Null-Coalescing]]
- Avoid null-forgiving operator when possible
- Initialize non-nullable properties

**Migration strategy:**
1. Enable warnings first
2. Fix warnings gradually
3. Enable as error when clean

**Related:**
- [[Null-Coalescing]] - ?? and ??= operators
- [[Nullable-Value-Types]] - int?, DateTime?
- [[Null-Object-Pattern]] - avoiding null checks
