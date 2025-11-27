**Tags**: #async #threading #advanced
**Links**: [[async-await]], [[ConfigureAwait]], [[Deadlock-Patterns]], [[Task]]

---

### SynchronizationContext

SynchronizationContext controls where async continuations execute. Critical for understanding async behavior in different environments.

**What it does:**
- Captures "context" when you await
- Resumes execution on that context
- UI thread, ASP.NET request context, etc.

**UI applications:**
```csharp
// On UI thread
await DoWorkAsync();  // Captures UI context
UpdateUI();           // Runs on UI thread - safe!
```

**How await uses it:**
```csharp
// Simplified await behavior
var context = SynchronizationContext.Current;
var task = DoWorkAsync();
task.ContinueWith(t =>
{
    if (context != null)
        context.Post(_ => continuation(), null);  // Resume on captured context
    else
        continuation();  // Resume on thread pool
});
```

**ASP.NET Core:**
- Has NO SynchronizationContext
- Continuations run on thread pool
- No deadlock risk from `.Result`

**Legacy ASP.NET:**
- HAD SynchronizationContext
- Could cause deadlocks
- `ConfigureAwait(false)` was critical

**Custom context:**
```csharp
public class SingleThreadContext : SynchronizationContext
{
    private readonly BlockingCollection<Action> _queue = new();

    public override void Post(SendOrPostCallback d, object? state)
    {
        _queue.Add(() => d(state));
    }

    public void RunLoop()
    {
        foreach (var action in _queue.GetConsumingEnumerable())
        {
            action();
        }
    }
}
```

**Checking context:**
```csharp
var context = SynchronizationContext.Current;
if (context is WindowsFormsSynchronizationContext)
    Console.WriteLine("WinForms UI thread");
```

**Related:**
- [[ConfigureAwait]] - context control
- [[Deadlock-Patterns]] - context-related deadlocks
- [[async-await]] - async fundamentals
