**Tags**: #concurrency #threading #patterns
**Links**: [[Concurrent-Collections]], [[Immutability]], [[Locking]], [[async-await]]

---

### Thread Safety

Thread safety ensures code behaves correctly when accessed by multiple threads simultaneously.

**Race condition example:**
```csharp
// NOT THREAD-SAFE
private int _counter;

public void Increment()
{
    _counter++;  // Read-modify-write is not atomic!
}
```

**Solutions:**

**Lock:**
```csharp
private readonly object _lock = new();
private int _counter;

public void Increment()
{
    lock (_lock)
    {
        _counter++;
    }
}
```

**Interlocked (atomic operations):**
```csharp
private int _counter;

public void Increment()
{
    Interlocked.Increment(ref _counter);
}

public int GetAndReset()
{
    return Interlocked.Exchange(ref _counter, 0);
}
```

**Concurrent collections:**
```csharp
private readonly ConcurrentDictionary<string, int> _cache = new();

public int GetOrAdd(string key, Func<string, int> factory)
{
    return _cache.GetOrAdd(key, factory);
}
```

**Immutability:**
```csharp
// Immutable objects are inherently thread-safe
public record UserState(string Name, int Score);

// Sharing is safe
private UserState _state = new("Player", 0);

public void UpdateScore(int delta)
{
    // Atomic replacement
    var newState = _state with { Score = _state.Score + delta };
    Interlocked.Exchange(ref _state, newState);
}
```

**ReaderWriterLockSlim:**
```csharp
private readonly ReaderWriterLockSlim _rwLock = new();

public Data Read()
{
    _rwLock.EnterReadLock();
    try { return _data; }
    finally { _rwLock.ExitReadLock(); }
}

public void Write(Data data)
{
    _rwLock.EnterWriteLock();
    try { _data = data; }
    finally { _rwLock.ExitWriteLock(); }
}
```

**Best practices:**
- Prefer immutability
- Use concurrent collections
- Minimize lock scope
- Avoid nested locks (deadlock risk)

**Related:**
- [[Concurrent-Collections]] - thread-safe collections
- [[Immutability]] - immutable design
- [[Deadlock-Patterns]] - avoiding deadlocks
