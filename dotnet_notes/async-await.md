**Tags**: #csharp #async #fundamentals
**Links**: [[Task]], [[ValueTask]], [[ConfigureAwait]], [[CancellationToken]], [[Task-Parallel-Library]]

---

### Async/Await

The async/await pattern in C# enables asynchronous programming without complex callbacks or manual thread management. It allows code to be non-blocking while remaining readable.

**Key points:**
- Use `async` modifier on methods that contain `await`
- `await` suspends execution until the awaited task completes
- The method returns control to the caller during suspension
- Best for I/O-bound operations (network, file, database)

**Common mistakes:**
- Using `async void` (only valid for event handlers) - see [[Async-Void-Pitfalls]]
- Blocking with `.Result` or `.Wait()` - causes [[Deadlock-Patterns]]
- Not using [[CancellationToken]] for long-running operations

**Example:**
```csharp
public async Task<string> FetchDataAsync(string url)
{
    using var client = new HttpClient();
    return await client.GetStringAsync(url);
}
```

**Related:**
- [[Task]] - the return type for async methods
- [[ValueTask]] - for high-performance scenarios
- [[IAsyncEnumerable]] - for async streams
