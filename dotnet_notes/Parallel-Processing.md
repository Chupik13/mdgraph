**Tags**: #performance #parallel #advanced
**Links**: [[Task-Parallel-Library]], [[Parallel-LINQ]], [[Thread-Safety]]

---

### Parallel Processing

Parallel processing executes operations simultaneously across multiple CPU cores. Use for CPU-bound work.

**Parallel.For:**
```csharp
// Process array elements in parallel
Parallel.For(0, items.Length, i =>
{
    items[i] = Process(items[i]);
});

// With options
var options = new ParallelOptions
{
    MaxDegreeOfParallelism = Environment.ProcessorCount / 2,
    CancellationToken = cancellationToken
};

Parallel.For(0, count, options, i => DoWork(i));
```

**Parallel.ForEach:**
```csharp
Parallel.ForEach(items, item =>
{
    ProcessItem(item);
});

// With local state (avoid locking)
var total = 0L;
Parallel.ForEach(
    items,
    () => 0L,  // Initialize local state
    (item, state, localTotal) => localTotal + item.Value,  // Accumulate locally
    localTotal => Interlocked.Add(ref total, localTotal)); // Merge results
```

**Parallel.ForEachAsync (.NET 6+):**
```csharp
await Parallel.ForEachAsync(urls, async (url, ct) =>
{
    var content = await httpClient.GetStringAsync(url, ct);
    await ProcessContentAsync(content, ct);
});
```

**Partitioning for better performance:**
```csharp
// Custom partitioner for small workloads
var partitioner = Partitioner.Create(items, loadBalance: true);
Parallel.ForEach(partitioner, item => Process(item));

// Range partitioner for arrays
var rangePartitioner = Partitioner.Create(0, array.Length, rangeSize: 100);
Parallel.ForEach(rangePartitioner, range =>
{
    for (int i = range.Item1; i < range.Item2; i++)
        Process(array[i]);
});
```

**Related:**
- [[Task-Parallel-Library]] - async parallelism
- [[Parallel-LINQ]] - LINQ parallelization
- [[Thread-Safety]] - concurrent access

