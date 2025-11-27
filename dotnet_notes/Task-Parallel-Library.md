**Tags**: #csharp #async #parallel
**Links**: [[Task]], [[async-await]], [[Parallel-ForEach]], [[PLINQ]], [[ThreadPool]]

---

### Task Parallel Library (TPL)

TPL provides a higher-level abstraction for parallel and async programming, built on top of the [[ThreadPool]].

**Key components:**
- `Task` and `Task<T>` - [[Task]]
- `Parallel.For` / `Parallel.ForEach` - [[Parallel-ForEach]]
- `PLINQ` - [[PLINQ]]
- `Dataflow` - [[TPL-Dataflow]]

**Parallel execution:**
```csharp
// CPU-bound parallelism
Parallel.ForEach(items, item =>
{
    ProcessItem(item);
});

// With options
var options = new ParallelOptions
{
    MaxDegreeOfParallelism = Environment.ProcessorCount
};
Parallel.ForEach(items, options, item => Process(item));
```

**Task combinators:**
```csharp
// Wait for all
await Task.WhenAll(task1, task2, task3);

// Wait for first
var completed = await Task.WhenAny(tasks);

// With timeout
var winner = await Task.WhenAny(
    actualTask,
    Task.Delay(TimeSpan.FromSeconds(10))
);
```

**CPU-bound vs I/O-bound:**
- CPU-bound: Use `Parallel.For`, [[PLINQ]]
- I/O-bound: Use [[async-await]], `Task.WhenAll`

**Related:**
- [[Parallel-ForEach]] - parallel loops
- [[PLINQ]] - parallel LINQ
- [[Concurrency-Patterns]] - common patterns
