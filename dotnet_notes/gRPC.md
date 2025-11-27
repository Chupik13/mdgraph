**Tags**: #aspnet #api #performance
**Links**: [[Microservices]], [[Protobuf]], [[HTTP2]]

---

### gRPC in .NET

gRPC is a high-performance RPC framework using Protocol Buffers. Ideal for microservice communication.

**Proto definition:**
```protobuf
syntax = "proto3";

option csharp_namespace = "MyApp.Grpc";

service UserService {
  rpc GetUser (GetUserRequest) returns (UserResponse);
  rpc GetUsers (GetUsersRequest) returns (stream UserResponse);
}

message GetUserRequest {
  int32 id = 1;
}

message UserResponse {
  int32 id = 1;
  string name = 2;
  string email = 3;
}
```

**Server implementation:**
```csharp
public class UserServiceImpl : UserService.UserServiceBase
{
    public override async Task<UserResponse> GetUser(
        GetUserRequest request,
        ServerCallContext context)
    {
        var user = await _repository.GetByIdAsync(request.Id);
        return new UserResponse
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email
        };
    }

    public override async Task GetUsers(
        GetUsersRequest request,
        IServerStreamWriter<UserResponse> responseStream,
        ServerCallContext context)
    {
        await foreach (var user in _repository.GetAllAsync())
        {
            await responseStream.WriteAsync(MapToResponse(user));
        }
    }
}

// Registration
builder.Services.AddGrpc();
app.MapGrpcService<UserServiceImpl>();
```

**Client:**
```csharp
builder.Services.AddGrpcClient<UserService.UserServiceClient>(options =>
{
    options.Address = new Uri("https://localhost:5001");
});

// Usage
public class UserClient(UserService.UserServiceClient client)
{
    public async Task<User> GetUserAsync(int id)
    {
        var response = await client.GetUserAsync(new GetUserRequest { Id = id });
        return MapToDomain(response);
    }
}
```

**Benefits over REST:**
- Binary protocol (smaller payloads)
- HTTP/2 (multiplexing, streaming)
- Strongly typed contracts
- Bidirectional streaming

**Related:**
- [[Microservices]] - service communication
- [[Protobuf]] - serialization format
- [[HTTP2]] - transport protocol
