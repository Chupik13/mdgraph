**Tags**: #aspnet #security #identity
**Links**: [[Authentication]], [[Authorization]], [[JWT-Authentication]]

---

### Claims-Based Identity

Claims are name-value pairs representing user attributes. Foundation of ASP.NET Core identity.

**Common claims:**
```csharp
// Standard claim types
ClaimTypes.NameIdentifier  // User ID
ClaimTypes.Name            // Username
ClaimTypes.Email           // Email address
ClaimTypes.Role            // User role

// Custom claims
"tenant_id"
"subscription_level"
"permissions"
```

**Creating claims:**
```csharp
var claims = new List<Claim>
{
    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
    new Claim(ClaimTypes.Email, user.Email),
    new Claim(ClaimTypes.Role, "Admin"),
    new Claim("tenant_id", user.TenantId.ToString())
};

var identity = new ClaimsIdentity(claims, "Bearer");
var principal = new ClaimsPrincipal(identity);
```

**Accessing claims:**
```csharp
public class UserController : ControllerBase
{
    [HttpGet("me")]
    public ActionResult GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value);

        return Ok(new { userId, email, roles });
    }
}

// Extension method
public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var claim = user.FindFirst(ClaimTypes.NameIdentifier);
        return int.Parse(claim?.Value ?? "0");
    }
}
```

**Claims transformation:**
```csharp
public class CustomClaimsTransformation : IClaimsTransformation
{
    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        var identity = (ClaimsIdentity)principal.Identity!;

        // Add claims from database
        var permissions = await _permissionService.GetPermissionsAsync(principal.GetUserId());
        foreach (var permission in permissions)
        {
            identity.AddClaim(new Claim("permission", permission));
        }

        return principal;
    }
}
```

**Related:**
- [[JWT-Authentication]] - claims in tokens
- [[Authorization]] - claim-based policies
- [[Policy-Based-Authorization]] - custom policies
