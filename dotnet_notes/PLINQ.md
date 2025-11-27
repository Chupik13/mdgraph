**Tags**: #linq #parallel #performance
**Links**: [[LINQ]], [[Task-Parallel-Library]], [[Parallel-ForEach]], [[Concurrency-Patterns]]

---

### PLINQ (Parallel LINQ)

PLINQ parallelizes LINQ queries across multiple threads. Useful for CPU-bound operations on large datasets.

**Basic usage:**
```csharp
var results = data
    .AsParallel()
    .Where(x => ExpensiveFilter(x))
    .Select(x => ExpensiveTransform(x))
    .ToList();
```

**Controlling parallelism:**
```csharp
var results = data
    .AsParallel()
    .WithDegreeOfParallelism(4)  // Max 4 threads
    .WithExecutionMode(ParallelExecutionMode.ForceParallelism)
    .Select(x => Process(x))
    .ToList();
```

**Preserving order:**
```csharp
// Order not guaranteed by default
var unordered = data.AsParallel().Select(x => x * 2);

// Preserve original order
var ordered = data
    .AsParallel()
    .AsOrdered()  // Slower but maintains order
    .Select(x => x * 2);
```

**ForAll - parallel enumeration:**
```csharp
data.AsParallel()
    .Where(x => x.IsActive)
    .ForAll(x => Process(x));  // Parallel iteration, no order
```

**When to use:**
- Large collections (thousands+)
- CPU-bound operations
- No shared mutable state
- Operation cost > parallelization overhead

**When NOT to use:**
- Small collections
- I/O-bound operations (use async)
- Operations with side effects
- Database queries (use async SQL)

**Cancellation:**
```csharp
var cts = new CancellationTokenSource();

var results = data
    .AsParallel()
    .WithCancellation(cts.Token)
    .Select(x => Process(x));
```

**Related:**
- [[LINQ]] - query fundamentals
- [[Parallel-ForEach]] - parallel loops
- [[Task-Parallel-Library]] - TPL overview
