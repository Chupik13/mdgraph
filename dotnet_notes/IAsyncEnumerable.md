**Tags**: #csharp #async #streaming
**Links**: [[async-await]], [[IEnumerable]], [[yield-return]], [[Streaming-APIs]]

---

### IAsyncEnumerable<T>

IAsyncEnumerable enables asynchronous streaming of data. Ideal for large datasets or real-time data.

**Basic usage:**
```csharp
public async IAsyncEnumerable<Product> GetProductsAsync(
    [EnumeratorCancellation] CancellationToken ct = default)
{
    await foreach (var batch in GetBatchesAsync(ct))
    {
        foreach (var product in batch)
        {
            yield return product;
        }
    }
}

// Consuming
await foreach (var product in GetProductsAsync())
{
    Console.WriteLine(product.Name);
}
```

**Database streaming:**
```csharp
public IAsyncEnumerable<User> GetAllUsersAsync()
{
    return context.Users.AsAsyncEnumerable();
}

// Process millions of rows without loading all in memory
await foreach (var user in GetAllUsersAsync())
{
    await ProcessUserAsync(user);
}
```

**API streaming:**
```csharp
[HttpGet("stream")]
public async IAsyncEnumerable<Product> StreamProducts()
{
    await foreach (var product in _service.GetProductsAsync())
    {
        yield return product;
    }
}
```

**LINQ support:**
```csharp
await foreach (var user in users
    .Where(u => u.IsActive)
    .Take(100))
{
    // ...
}
```

**Cancellation:**
```csharp
public async IAsyncEnumerable<T> StreamAsync(
    [EnumeratorCancellation] CancellationToken ct)
{
    while (!ct.IsCancellationRequested)
    {
        var data = await FetchNextAsync(ct);
        yield return data;
    }
}
```

**Use cases:**
- Large database result sets
- Real-time data feeds
- Log streaming
- File processing

**Related:**
- [[yield-return]] - iterator pattern
- [[Streaming-APIs]] - chunked responses
- [[Channels]] - in-memory streaming
