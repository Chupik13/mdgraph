**Tags**: #csharp #performance #patterns
**Links**: [[Singleton-Pattern]], [[Thread-Safety]], [[Memory-Optimization]]

---

### Lazy Initialization

Lazy initialization defers creation of an object until first access. Useful for expensive objects that might not be needed.

**Lazy<T>:**
```csharp
public class Service
{
    private readonly Lazy<ExpensiveResource> _resource;

    public Service()
    {
        _resource = new Lazy<ExpensiveResource>(() => new ExpensiveResource());
    }

    public void UseResource()
    {
        // Created on first access
        _resource.Value.DoWork();
    }
}
```

**Thread-safety modes:**
```csharp
// Thread-safe (default)
new Lazy<T>(() => CreateValue(), LazyThreadSafetyMode.ExecutionAndPublication);

// Not thread-safe (fastest)
new Lazy<T>(() => CreateValue(), LazyThreadSafetyMode.None);

// Thread-safe but might call factory multiple times
new Lazy<T>(() => CreateValue(), LazyThreadSafetyMode.PublicationOnly);
```

**Lazy properties:**
```csharp
public class Config
{
    private Lazy<Settings> _settings = new(() => LoadSettings());

    public Settings Settings => _settings.Value;

    // Or with nullable
    private Settings? _cachedSettings;
    public Settings Settings => _cachedSettings ??= LoadSettings();
}
```

**With async:**
```csharp
public class AsyncService
{
    private readonly AsyncLazy<Data> _data;

    public AsyncService()
    {
        _data = new AsyncLazy<Data>(() => LoadDataAsync());
    }

    public async Task<Data> GetDataAsync() => await _data;
}

// Custom AsyncLazy
public class AsyncLazy<T> : Lazy<Task<T>>
{
    public AsyncLazy(Func<Task<T>> factory)
        : base(() => Task.Run(factory)) { }

    public TaskAwaiter<T> GetAwaiter() => Value.GetAwaiter();
}
```

**When to use:**
- Expensive object creation
- Object might not be used
- Singleton implementations
- Caching computed values

**Related:**
- [[Singleton-Pattern]] - single instance
- [[Thread-Safety]] - concurrent access
- [[Object-Pooling]] - reusing objects
