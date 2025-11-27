**Tags**: #csharp #memory #patterns
**Links**: [[IDisposable]], [[using-Statement]], [[Garbage-Collection]]

---

### Dispose Pattern

The dispose pattern properly releases unmanaged resources and integrates with garbage collection.

**Basic IDisposable:**
```csharp
public class SimpleResource : IDisposable
{
    private bool _disposed;

    public void Dispose()
    {
        if (_disposed) return;

        // Release managed resources
        _managedResource?.Dispose();

        _disposed = true;
    }

    public void DoWork()
    {
        ObjectDisposedException.ThrowIf(_disposed, this);
        // ...
    }
}
```

**Full pattern (with unmanaged resources):**
```csharp
public class ComplexResource : IDisposable
{
    private IntPtr _unmanagedHandle;
    private Stream _managedStream;
    private bool _disposed;

    ~ComplexResource()
    {
        Dispose(disposing: false);
    }

    public void Dispose()
    {
        Dispose(disposing: true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (_disposed) return;

        if (disposing)
        {
            // Managed resources
            _managedStream?.Dispose();
        }

        // Unmanaged resources
        if (_unmanagedHandle != IntPtr.Zero)
        {
            NativeMethods.CloseHandle(_unmanagedHandle);
            _unmanagedHandle = IntPtr.Zero;
        }

        _disposed = true;
    }
}
```

**IAsyncDisposable:**
```csharp
public class AsyncResource : IAsyncDisposable, IDisposable
{
    public async ValueTask DisposeAsync()
    {
        await _connection.CloseAsync();
        Dispose(disposing: false);
        GC.SuppressFinalize(this);
    }

    public void Dispose()
    {
        _connection.Close();
        GC.SuppressFinalize(this);
    }
}

// Usage
await using var resource = new AsyncResource();
```

**Using statements:**
```csharp
// Classic
using (var stream = File.OpenRead("file.txt"))
{
    // ...
}  // Disposed here

// Modern (C# 8+)
using var stream = File.OpenRead("file.txt");
// Disposed at end of scope
```

**Related:**
- [[using-Statement]] - automatic disposal
- [[Garbage-Collection]] - GC interaction
- [[Memory-Optimization]] - resource management
