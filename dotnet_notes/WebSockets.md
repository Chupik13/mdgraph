**Tags**: #networking #realtime #protocols
**Links**: [[SignalR]], [[ASP-NET-Core]], [[Real-Time-Communication]]

---

### WebSockets

WebSockets provide full-duplex communication channels over a single TCP connection. Foundation for real-time applications.

**Server setup:**
```csharp
app.UseWebSockets();

app.Map("/ws", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        await HandleWebSocketAsync(webSocket);
    }
    else
    {
        context.Response.StatusCode = 400;
    }
});
```

**Handling messages:**
```csharp
private async Task HandleWebSocketAsync(WebSocket webSocket)
{
    var buffer = new byte[1024 * 4];

    while (webSocket.State == WebSocketState.Open)
    {
        var result = await webSocket.ReceiveAsync(
            new ArraySegment<byte>(buffer),
            CancellationToken.None);

        if (result.MessageType == WebSocketMessageType.Close)
        {
            await webSocket.CloseAsync(
                WebSocketCloseStatus.NormalClosure,
                "Closing",
                CancellationToken.None);
        }
        else
        {
            var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
            var response = ProcessMessage(message);

            await webSocket.SendAsync(
                new ArraySegment<byte>(Encoding.UTF8.GetBytes(response)),
                WebSocketMessageType.Text,
                true,
                CancellationToken.None);
        }
    }
}
```

**Client (JavaScript):**
```javascript
const socket = new WebSocket('wss://localhost:5001/ws');

socket.onopen = () => socket.send('Hello');
socket.onmessage = (event) => console.log(event.data);
socket.onclose = () => console.log('Disconnected');
```

**Related:**
- [[SignalR]] - higher-level abstraction
- [[Real-Time-Communication]] - patterns
- [[ASP-NET-Core]] - hosting

