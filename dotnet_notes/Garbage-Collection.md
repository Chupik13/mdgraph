**Tags**: #performance #memory #clr
**Links**: [[Memory-Optimization]], [[Object-Pooling]], [[Span-T]], [[Large-Object-Heap]]

---

### Garbage Collection

.NET's GC automatically manages memory. Understanding it helps write performant code.

**Generations:**
- **Gen 0** - short-lived objects, collected frequently
- **Gen 1** - buffer between Gen 0 and Gen 2
- **Gen 2** - long-lived objects, collected rarely
- **LOH** - large objects (>85KB), see [[Large-Object-Heap]]

**GC modes:**
```csharp
// Workstation (default for desktop apps)
// - Optimized for responsiveness

// Server (default for ASP.NET Core)
// - Optimized for throughput
// - One heap per CPU core
```

**Configuration:**
```xml
<PropertyGroup>
  <ServerGarbageCollection>true</ServerGarbageCollection>
  <ConcurrentGarbageCollection>true</ConcurrentGarbageCollection>
</PropertyGroup>
```

**Reducing GC pressure:**
```csharp
// Avoid allocations in hot paths
// BAD: Allocates array each call
public int[] GetIds() => _list.Select(x => x.Id).ToArray();

// BETTER: Reuse array
private int[] _idBuffer = new int[100];
public Span<int> GetIds(Span<int> buffer) { ... }

// Use object pooling
var sb = StringBuilderPool.Shared.Get();
try { ... }
finally { StringBuilderPool.Shared.Return(sb); }

// Use Span<T> and stackalloc
Span<byte> buffer = stackalloc byte[256];
```

**Monitoring:**
```csharp
// Check GC stats
GC.GetTotalMemory(forceFullCollection: false);
GC.CollectionCount(generation: 0);
GC.GetGCMemoryInfo();
```

**Related:**
- [[Memory-Optimization]] - allocation strategies
- [[Object-Pooling]] - reusing objects
- [[Large-Object-Heap]] - handling large allocations
- [[ArrayPool]] - array reuse
