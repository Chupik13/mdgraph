**Tags**: #async #anti-patterns #debugging
**Links**: [[async-await]], [[ConfigureAwait]], [[SynchronizationContext]], [[Task]]

---

### Async Deadlock Patterns

Deadlocks occur when blocking on async code in contexts with a synchronization context. Classic .NET pitfall.

**The classic deadlock:**
```csharp
// In UI or ASP.NET (old) with sync context
public void Button_Click()
{
    var data = GetDataAsync().Result;  // DEADLOCK!
}

public async Task<string> GetDataAsync()
{
    await Task.Delay(100);  // Tries to resume on UI thread
    return "data";          // But UI thread is blocked waiting!
}
```

**Why it happens:**
1. `.Result` blocks the calling thread (UI thread)
2. `await` captures sync context
3. After `await`, tries to resume on UI thread
4. UI thread is blocked → deadlock!

**Solutions:**

**1. Use async all the way:**
```csharp
public async void Button_Click()
{
    var data = await GetDataAsync();  // No blocking
}
```

**2. Use ConfigureAwait(false):**
```csharp
public async Task<string> GetDataAsync()
{
    await Task.Delay(100).ConfigureAwait(false);
    return "data";  // Resumes on thread pool, not UI
}
```

**3. Use Task.Run (last resort):**
```csharp
public void Button_Click()
{
    var data = Task.Run(() => GetDataAsync()).Result;  // Works but wasteful
}
```

**ASP.NET Core note:**
ASP.NET Core has NO sync context, so deadlocks are less common. But still avoid `.Result` - it blocks threads.

**Rules:**
- Never use `.Result` or `.Wait()` on async code
- Use `ConfigureAwait(false)` in libraries
- Async all the way down

**Related:**
- [[ConfigureAwait]] - context configuration
- [[SynchronizationContext]] - how contexts work
- [[async-await]] - async basics
