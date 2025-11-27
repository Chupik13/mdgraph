**Tags**: #aspnet #realtime #websockets
**Links**: [[ASP-NET-Core]], [[WebSockets]], [[Pub-Sub]], [[Scaling-SignalR]]

---

### SignalR

SignalR enables real-time, bidirectional communication between server and clients.

**Setup:**
```csharp
builder.Services.AddSignalR();

app.MapHub<ChatHub>("/chat");
```

**Hub:**
```csharp
public class ChatHub : Hub
{
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }

    public async Task JoinGroup(string groupName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        await Clients.Group(groupName).SendAsync("UserJoined", Context.User?.Identity?.Name);
    }

    public async Task SendToGroup(string groupName, string message)
    {
        await Clients.Group(groupName).SendAsync("ReceiveMessage", message);
    }

    public override async Task OnConnectedAsync()
    {
        await Clients.Caller.SendAsync("Connected", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Cleanup
        await base.OnDisconnectedAsync(exception);
    }
}
```

**Strongly-typed hub:**
```csharp
public interface IChatClient
{
    Task ReceiveMessage(string user, string message);
    Task UserJoined(string user);
}

public class ChatHub : Hub<IChatClient>
{
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.ReceiveMessage(user, message);
    }
}
```

**Sending from outside hub:**
```csharp
public class NotificationService
{
    private readonly IHubContext<ChatHub, IChatClient> _hub;

    public async Task NotifyAllAsync(string message)
    {
        await _hub.Clients.All.ReceiveMessage("System", message);
    }

    public async Task NotifyUserAsync(string userId, string message)
    {
        await _hub.Clients.User(userId).ReceiveMessage("System", message);
    }
}
```

**Scaling:**
- Redis backplane for multiple servers
- Azure SignalR Service

**Related:**
- [[WebSockets]] - underlying protocol
- [[Redis]] - scaling with backplane
- [[Authentication]] - securing hubs
