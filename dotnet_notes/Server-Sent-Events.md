**Tags**: #networking #realtime #http
**Links**: [[Real-Time-Communication]], [[WebSockets]], [[Streaming]]

---

### Server-Sent Events

Server-Sent Events (SSE) allow servers to push updates to clients over HTTP. Simpler than WebSockets for one-way communication.

**Server implementation:**
```csharp
app.MapGet("/stream", async (HttpContext context, CancellationToken ct) =>
{
    context.Response.ContentType = "text/event-stream";
    context.Response.Headers.Append("Cache-Control", "no-cache");
    context.Response.Headers.Append("Connection", "keep-alive");

    var writer = context.Response.BodyWriter;

    while (!ct.IsCancellationRequested)
    {
        var data = await GetLatestDataAsync();

        // SSE format: "data: content\n\n"
        var message = $"data: {JsonSerializer.Serialize(data)}\n\n";
        await writer.WriteAsync(Encoding.UTF8.GetBytes(message), ct);
        await writer.FlushAsync(ct);

        await Task.Delay(1000, ct);
    }
});
```

**Named events:**
```csharp
// Server
await context.Response.WriteAsync($"event: userJoined\ndata: {userName}\n\n");
await context.Response.WriteAsync($"event: message\ndata: {content}\n\n");

// Client handles by event type
eventSource.addEventListener('userJoined', (e) => console.log('User:', e.data));
eventSource.addEventListener('message', (e) => console.log('Message:', e.data));
```

**JavaScript client:**
```javascript
const eventSource = new EventSource('/stream');

eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updateUI(data);
};

eventSource.onerror = () => {
    console.log('Connection lost, reconnecting...');
    // Browser auto-reconnects
};
```

**Benefits:**
- Automatic reconnection
- Built-in browser support
- Works through proxies
- Simple HTTP protocol

**Related:**
- [[Real-Time-Communication]] - communication patterns
- [[WebSockets]] - bidirectional alternative
- [[Streaming]] - response streaming

