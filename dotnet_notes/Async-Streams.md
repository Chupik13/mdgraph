**Tags**: #csharp #async #streaming
**Links**: [[IAsyncEnumerable]], [[yield-return]], [[Channels]], [[SignalR]]

---

### Async Streams

Async streams combine async/await with iterators, enabling asynchronous data streaming with `await foreach`.

**Producing async stream:**
```csharp
async IAsyncEnumerable<int> GenerateAsync(
    [EnumeratorCancellation] CancellationToken ct = default)
{
    for (int i = 0; i < 100; i++)
    {
        await Task.Delay(100, ct);
        yield return i;
    }
}
```

**Consuming async stream:**
```csharp
await foreach (var item in GenerateAsync())
{
    Console.WriteLine(item);
}

// With cancellation
var cts = new CancellationTokenSource();
await foreach (var item in GenerateAsync().WithCancellation(cts.Token))
{
    if (item > 10) break;
}
```

**Database streaming:**
```csharp
public async IAsyncEnumerable<User> GetUsersStreamAsync(
    [EnumeratorCancellation] CancellationToken ct)
{
    await using var command = connection.CreateCommand();
    command.CommandText = "SELECT * FROM Users";

    await using var reader = await command.ExecuteReaderAsync(ct);
    while (await reader.ReadAsync(ct))
    {
        yield return MapUser(reader);
    }
}
```

**API streaming:**
```csharp
[HttpGet("stream")]
public async IAsyncEnumerable<LogEntry> StreamLogs(
    [EnumeratorCancellation] CancellationToken ct)
{
    await foreach (var entry in _logService.WatchLogsAsync(ct))
    {
        yield return entry;
    }
}
```

**LINQ with async streams:**
```csharp
await foreach (var item in source
    .Where(x => x.IsActive)
    .Take(100)
    .ConfigureAwait(false))
{
    // ...
}
```

**Buffering:**
```csharp
// Collect all at once (loses streaming benefit)
var list = await source.ToListAsync();

// Process in batches
await foreach (var batch in source.Buffer(10))
{
    await ProcessBatchAsync(batch);
}
```

**Related:**
- [[IAsyncEnumerable]] - interface details
- [[yield-return]] - iterator pattern
- [[Channels]] - alternative streaming
