**Tags**: #patterns #networking #architecture
**Links**: [[WebSockets]], [[SignalR]], [[Server-Sent-Events]]

---

### Real-Time Communication

Patterns for pushing updates to clients in real-time. Choose based on requirements.

**Long polling:**
```csharp
// Simplest, widely supported
app.MapGet("/poll", async (IMessageQueue queue) =>
{
    var message = await queue.WaitForMessageAsync(timeout: TimeSpan.FromSeconds(30));
    return message ?? Results.NoContent();
});
```

**Server-Sent Events (SSE):**
```csharp
app.MapGet("/events", async (HttpContext context) =>
{
    context.Response.Headers.Append("Content-Type", "text/event-stream");

    while (!context.RequestAborted.IsCancellationRequested)
    {
        var data = await GetNextEventAsync();
        await context.Response.WriteAsync($"data: {data}\n\n");
        await context.Response.Body.FlushAsync();
    }
});
```

**WebSocket patterns:**
```csharp
// Pub/sub with in-memory channels
public class ConnectionManager
{
    private readonly ConcurrentDictionary<string, WebSocket> _sockets = new();

    public async Task BroadcastAsync(string message)
    {
        var bytes = Encoding.UTF8.GetBytes(message);
        foreach (var socket in _sockets.Values.Where(s => s.State == WebSocketState.Open))
        {
            await socket.SendAsync(bytes, WebSocketMessageType.Text, true, default);
        }
    }
}
```

**Choosing the right approach:**
| Approach | Use Case | Browser Support |
|----------|----------|-----------------|
| Long polling | Legacy support | Universal |
| SSE | Server-to-client only | Modern |
| WebSocket | Bidirectional | Modern |
| SignalR | Full-featured | Modern |

**Related:**
- [[WebSockets]] - low-level protocol
- [[SignalR]] - ASP.NET abstraction
- [[Server-Sent-Events]] - unidirectional

