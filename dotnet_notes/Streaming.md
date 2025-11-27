**Tags**: #aspnet #performance #http
**Links**: [[Server-Sent-Events]], [[IAsyncEnumerable]], [[Response-Compression]]

---

### Streaming

Streaming allows sending large responses incrementally, reducing memory usage and improving perceived performance.

**IAsyncEnumerable streaming:**
```csharp
app.MapGet("/stream-data", async IAsyncEnumerable<Item> (
    IItemRepository repository,
    CancellationToken ct) =>
{
    await foreach (var item in repository.GetAllAsync(ct))
    {
        yield return item;
    }
});
```

**File streaming:**
```csharp
app.MapGet("/download/{fileName}", async (string fileName) =>
{
    var filePath = Path.Combine(_uploadPath, fileName);

    if (!File.Exists(filePath))
        return Results.NotFound();

    var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
    return Results.File(stream, "application/octet-stream", fileName);
});
```

**Manual response streaming:**
```csharp
app.MapGet("/large-report", async (HttpContext context) =>
{
    context.Response.ContentType = "application/json";

    await using var writer = new StreamWriter(context.Response.Body);
    await writer.WriteAsync("[");

    var first = true;
    await foreach (var item in GetLargeDatasetAsync())
    {
        if (!first) await writer.WriteAsync(",");
        await writer.WriteAsync(JsonSerializer.Serialize(item));
        await writer.FlushAsync();
        first = false;
    }

    await writer.WriteAsync("]");
});
```

**Request body streaming:**
```csharp
app.MapPost("/upload", async (HttpRequest request) =>
{
    await using var fileStream = File.Create("uploaded.bin");
    await request.Body.CopyToAsync(fileStream);
    return Results.Ok();
});
```

**Related:**
- [[IAsyncEnumerable]] - async iteration
- [[Response-Compression]] - compressing streams
- [[Server-Sent-Events]] - event streaming

