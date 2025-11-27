**Tags**: #performance #linq #parallel
**Links**: [[LINQ]], [[Task-Parallel-Library]], [[Parallel-Processing]]

---

### Parallel LINQ (PLINQ)

PLINQ parallelizes LINQ queries across multiple processors. Simple way to add parallelism to data processing.

**Basic parallelization:**
```csharp
// Sequential
var results = numbers.Where(n => IsPrime(n)).ToList();

// Parallel - just add AsParallel()
var results = numbers.AsParallel().Where(n => IsPrime(n)).ToList();
```

**Controlling parallelism:**
```csharp
var results = source
    .AsParallel()
    .WithDegreeOfParallelism(4)           // Max 4 threads
    .WithExecutionMode(ParallelExecutionMode.ForceParallelism)
    .WithMergeOptions(ParallelMergeOptions.NotBuffered)  // Stream results
    .Select(ProcessItem)
    .ToList();
```

**Ordering:**
```csharp
// Results may be out of order by default
var unordered = source.AsParallel().Select(Transform).ToList();

// Preserve order (may reduce parallelism)
var ordered = source.AsParallel().AsOrdered().Select(Transform).ToList();
```

**Exception handling:**
```csharp
try
{
    var results = source
        .AsParallel()
        .Select(item =>
        {
            if (item.IsInvalid)
                throw new InvalidOperationException();
            return Process(item);
        })
        .ToList();
}
catch (AggregateException ae)
{
    foreach (var ex in ae.InnerExceptions)
    {
        Console.WriteLine(ex.Message);
    }
}
```

**When to use:**
- CPU-bound operations
- Large datasets
- Independent operations
- Embarrassingly parallel problems

**When NOT to use:**
- I/O-bound operations (use async instead)
- Small collections
- Operations with side effects

**Related:**
- [[LINQ]] - LINQ basics
- [[Task-Parallel-Library]] - TPL
- [[Parallel-Processing]] - parallel patterns

