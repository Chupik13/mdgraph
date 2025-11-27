**Tags**: #patterns #api #architecture
**Links**: [[Clean-Architecture]], [[AutoMapper]], [[Records]], [[Validation]]

---

### DTOs (Data Transfer Objects)

DTOs are simple objects for transferring data between layers or systems. They decouple internal models from external contracts.

**Why DTOs:**
- Hide internal implementation details
- Control what data is exposed
- Different shapes for different clients
- Versioning API responses
- Prevent over-posting attacks

**Request DTOs:**
```csharp
public record CreateUserRequest(
    [Required] string Name,
    [Required, EmailAddress] string Email,
    [Required, MinLength(8)] string Password);

public record UpdateUserRequest(
    string? Name,
    string? Email);

public record UserFilterRequest(
    string? Search,
    int Page = 1,
    int PageSize = 20);
```

**Response DTOs:**
```csharp
public record UserResponse(
    int Id,
    string Name,
    string Email,
    DateTime CreatedAt);

public record UserListResponse(
    List<UserResponse> Items,
    int TotalCount,
    int Page,
    int PageSize);

// Different detail levels
public record UserSummary(int Id, string Name);
public record UserDetails(int Id, string Name, string Email, List<OrderSummary> RecentOrders);
```

**Mapping approaches:**

**Manual mapping:**
```csharp
public static UserResponse ToResponse(this User user) =>
    new(user.Id, user.Name, user.Email, user.CreatedAt);
```

**AutoMapper:**
```csharp
CreateMap<User, UserResponse>();
```

**With EF projection:**
```csharp
var users = await context.Users
    .Select(u => new UserResponse(u.Id, u.Name, u.Email, u.CreatedAt))
    .ToListAsync();
```

**Best practices:**
- Use records for immutability
- Separate request/response DTOs
- Include validation on request DTOs
- Don't expose entity IDs for security-sensitive operations

**Related:**
- [[AutoMapper]] - object mapping
- [[Records]] - immutable DTOs
- [[Validation]] - input validation
