**Tags**: #aspnet #security #identity
**Links**: [[Authorization]], [[JWT-Authentication]], [[Identity]], [[OAuth]]

---

### Authentication

Authentication verifies WHO the user is. ASP.NET Core supports multiple authentication schemes.

**Setup:**
```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = "myapp",
            ValidateAudience = true,
            ValidAudience = "myapp",
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

app.UseAuthentication();  // Before UseAuthorization
app.UseAuthorization();
```

**Authentication schemes:**
- [[JWT-Authentication]] - stateless tokens
- Cookie authentication - session-based
- [[OAuth]] / OpenID Connect - external providers
- [[Identity]] - full user management

**Accessing user:**
```csharp
[Authorize]
public class UserController : ControllerBase
{
    [HttpGet("me")]
    public ActionResult<UserDto> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        // ...
    }
}
```

**Multiple schemes:**
```csharp
services.AddAuthentication()
    .AddJwtBearer("Bearer", options => { ... })
    .AddCookie("Cookies", options => { ... });

[Authorize(AuthenticationSchemes = "Bearer,Cookies")]
```

**Related:**
- [[Authorization]] - what user can do
- [[JWT-Authentication]] - token-based auth
- [[Identity]] - user management
- [[Claims]] - user information
