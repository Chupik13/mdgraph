**Tags**: #async #anti-patterns #debugging
**Links**: [[async-await]], [[Task]], [[Exception-Handling]], [[Events]]

---

### Async Void Pitfalls

`async void` methods are dangerous and should be avoided except for event handlers. Understanding why prevents subtle bugs.

**The problem:**
```csharp
// BAD - exceptions crash the process
async void DoWorkAsync()
{
    await Task.Delay(100);
    throw new Exception("Boom!");  // Unobserved, crashes app
}

// Can't await - fire and forget
DoWorkAsync();  // No way to know when done or if failed
```

**Why it's dangerous:**
1. Exceptions crash the application
2. Cannot await completion
3. Cannot catch exceptions from caller
4. Difficult to test

**Only valid use - event handlers:**
```csharp
// OK - UI event handlers require void
private async void Button_Click(object sender, EventArgs e)
{
    try
    {
        await ProcessAsync();
    }
    catch (Exception ex)
    {
        ShowError(ex.Message);  // Handle within handler
    }
}
```

**Correct patterns:**
```csharp
// GOOD - return Task
async Task DoWorkAsync()
{
    await Task.Delay(100);
    throw new Exception("Boom!");  // Can be caught by caller
}

// Can await and handle
try
{
    await DoWorkAsync();
}
catch (Exception ex)
{
    // Handled properly
}
```

**Fire-and-forget (if really needed):**
```csharp
// Explicit discard with logging
_ = DoWorkAsync().ContinueWith(t =>
{
    if (t.IsFaulted)
        _logger.LogError(t.Exception, "Background task failed");
}, TaskContinuationOptions.OnlyOnFaulted);
```

**Rules:**
- Use `async Task` instead of `async void`
- Use `async void` ONLY for event handlers
- Always handle exceptions in async void

**Related:**
- [[async-await]] - async fundamentals
- [[Exception-Handling]] - error handling
- [[Events]] - event handlers
