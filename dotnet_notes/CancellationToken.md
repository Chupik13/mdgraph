**Tags**: #csharp #async #patterns
**Links**: [[async-await]], [[Task]], [[HttpClient]], [[Timeout-Patterns]]

---

### CancellationToken

`CancellationToken` enables cooperative cancellation of async operations. The token signals a request to cancel; the operation decides how to respond.

**Creating tokens:**
```csharp
// Manual control
var cts = new CancellationTokenSource();
CancellationToken token = cts.Token;

// With timeout
var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));

// Linked tokens
var linked = CancellationTokenSource.CreateLinkedTokenSource(token1, token2);
```

**Using in async methods:**
```csharp
public async Task ProcessAsync(CancellationToken ct = default)
{
    ct.ThrowIfCancellationRequested();

    await foreach (var item in GetItemsAsync(ct))
    {
        await ProcessItemAsync(item, ct);
    }
}
```

**Best practices:**
- Always accept `CancellationToken` in async APIs
- Use `= default` for optional cancellation
- Pass token to ALL async calls down the chain
- Dispose `CancellationTokenSource` when done

**Handling cancellation:**
```csharp
try
{
    await LongOperationAsync(token);
}
catch (OperationCanceledException) when (token.IsCancellationRequested)
{
    // Clean cancellation - expected
}
```

**Related:**
- [[Timeout-Patterns]] - implementing timeouts
- [[Graceful-Shutdown]] - application shutdown
- [[HttpClient]] - network cancellation
