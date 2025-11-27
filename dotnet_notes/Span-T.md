**Tags**: #csharp #performance #memory
**Links**: [[Memory-T]], [[Ref-Struct]], [[ArraySegment]], [[String-Manipulation]]

---

### Span<T>

`Span<T>` is a type-safe, memory-safe view over contiguous memory. Enables high-performance, allocation-free operations.

**Key characteristics:**
- Stack-only (ref struct) - see [[Ref-Struct]]
- No heap allocations
- Works with arrays, stack memory, native memory
- Bounds-checked access

**Creating spans:**
```csharp
// From array
int[] array = { 1, 2, 3, 4, 5 };
Span<int> span = array;
Span<int> slice = array.AsSpan(1, 3);  // { 2, 3, 4 }

// From stack
Span<int> stackSpan = stackalloc int[100];

// From string (ReadOnlySpan)
ReadOnlySpan<char> chars = "Hello".AsSpan();
```

**String manipulation without allocation:**
```csharp
public static bool IsValidEmail(ReadOnlySpan<char> email)
{
    int atIndex = email.IndexOf('@');
    if (atIndex < 1) return false;

    var domain = email[(atIndex + 1)..];
    return domain.IndexOf('.') > 0;
}
```

**Limitations:**
- Cannot be used in async methods
- Cannot be boxed or used as generic argument
- Cannot be stored in fields (except ref structs)

**Use cases:**
- Parsing without allocations
- Buffer manipulation
- High-performance string processing
- Interop with native memory

**Related:**
- [[Memory-T]] - heap-storable alternative
- [[Ref-Struct]] - stack-only types
- [[String-Manipulation]] - efficient string ops
- [[ArrayPool]] - array reuse
