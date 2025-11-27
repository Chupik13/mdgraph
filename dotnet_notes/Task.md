**Tags**: #csharp #async #fundamentals
**Links**: [[async-await]], [[ValueTask]], [[Task-Parallel-Library]], [[CancellationToken]]

---

### Task and Task<T>

`Task` represents an asynchronous operation. `Task<T>` represents an operation that returns a value of type T.

**Creating Tasks:**
```csharp
// From async method
Task<int> task = ComputeAsync();

// From synchronous code
Task<int> task = Task.FromResult(42);

// Run on thread pool
Task task = Task.Run(() => HeavyComputation());
```

**Task States:**
- Created, WaitingForActivation, WaitingToRun
- Running, WaitingForChildrenToComplete
- RanToCompletion, Canceled, Faulted

**Combining Tasks:**
- `Task.WhenAll()` - wait for all tasks
- `Task.WhenAny()` - wait for first completion
- See [[Task-Combinators]] for patterns

**Best practices:**
- Prefer `await` over `.Result` or `.Wait()`
- Use [[ConfigureAwait]](false) in library code
- Always handle exceptions in tasks

**Related:**
- [[async-await]] - language support for tasks
- [[ValueTask]] - allocation-free alternative
- [[TaskCompletionSource]] - manual task control
