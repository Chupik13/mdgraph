**Tags**: #performance #memory #fundamentals
**Links**: [[Garbage-Collection]], [[Span-T]], [[Object-Pooling]]

---

### Memory Management

Understanding .NET memory management helps write efficient applications. Know heap vs stack, GC generations, and allocation patterns.

**Value types vs reference types:**
```csharp
// Stack allocated (value type)
int number = 42;
DateTime date = DateTime.Now;
Span<byte> buffer = stackalloc byte[256];

// Heap allocated (reference type)
string text = "Hello";
int[] array = new int[100];
object boxed = 42; // Boxing allocates on heap
```

**Avoiding allocations:**
```csharp
// BAD - allocates new string each call
string GetStatus(bool active) => active ? "Active" : "Inactive";

// GOOD - returns same string instances
private static readonly string Active = "Active";
private static readonly string Inactive = "Inactive";
string GetStatus(bool active) => active ? Active : Inactive;

// BAD - LINQ allocates
var sum = items.Where(x => x > 0).Sum();

// GOOD - for loop, no allocation
var sum = 0;
foreach (var item in items)
    if (item > 0) sum += item;
```

**ArrayPool for temporary arrays:**
```csharp
var buffer = ArrayPool<byte>.Shared.Rent(1024);
try
{
    // Use buffer
    stream.Read(buffer, 0, buffer.Length);
}
finally
{
    ArrayPool<byte>.Shared.Return(buffer);
}
```

**Struct vs class decision:**
| Use struct when | Use class when |
|-----------------|----------------|
| < 16 bytes | Larger data |
| Immutable | Mutable |
| Short-lived | Long-lived |
| No inheritance needed | Polymorphism required |

**Related:**
- [[Garbage-Collection]] - GC details
- [[Span-T]] - stack-only memory
- [[Object-Pooling]] - reusing objects

