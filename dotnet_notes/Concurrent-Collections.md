**Tags**: #concurrency #collections #thread-safety
**Links**: [[Collections]], [[Thread-Safety]], [[Channels]], [[Lock-Free]]

---

### Concurrent Collections

Thread-safe collections in `System.Collections.Concurrent` for multi-threaded scenarios without explicit locking.

**ConcurrentDictionary:**
```csharp
var dict = new ConcurrentDictionary<string, int>();

// Thread-safe add/update
dict.TryAdd("key", 1);
dict.AddOrUpdate("key",
    addValue: 1,
    updateValueFactory: (key, oldValue) => oldValue + 1);

// Get or create
var value = dict.GetOrAdd("key", key => ComputeValue(key));
```

**ConcurrentQueue:**
```csharp
var queue = new ConcurrentQueue<WorkItem>();

// Producer
queue.Enqueue(item);

// Consumer
if (queue.TryDequeue(out var item))
{
    Process(item);
}
```

**ConcurrentBag:**
```csharp
var bag = new ConcurrentBag<int>();

// Unordered collection - good for parallel producers
Parallel.For(0, 100, i => bag.Add(i));

// Get any item
if (bag.TryTake(out var item)) { ... }
```

**BlockingCollection:**
```csharp
using var collection = new BlockingCollection<WorkItem>(boundedCapacity: 100);

// Producer - blocks if full
collection.Add(item);

// Consumer - blocks if empty
foreach (var item in collection.GetConsumingEnumerable())
{
    Process(item);  // Blocks until item available
}

// Signal completion
collection.CompleteAdding();
```

**ConcurrentStack:**
```csharp
var stack = new ConcurrentStack<int>();
stack.Push(1);
stack.PushRange(new[] { 2, 3, 4 });

if (stack.TryPop(out var item)) { ... }
```

**When to use:**
- Multiple threads accessing same collection
- Producer-consumer scenarios
- Avoid manual locking complexity

**Related:**
- [[Channels]] - modern alternative
- [[Thread-Safety]] - concurrency patterns
- [[Collections]] - non-concurrent options
