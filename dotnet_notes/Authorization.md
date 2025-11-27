**Tags**: #aspnet #security #patterns
**Links**: [[Authentication]], [[Policy-Based-Authorization]], [[Claims]], [[Role-Based-Authorization]]

---

### Authorization

Authorization determines WHAT an authenticated user can do. Multiple approaches available.

**Simple authorization:**
```csharp
[Authorize]  // Must be authenticated
public class SecureController : ControllerBase

[AllowAnonymous]  // Override for specific action
public ActionResult PublicEndpoint()
```

**Role-based:** See [[Role-Based-Authorization]]
```csharp
[Authorize(Roles = "Admin")]
[Authorize(Roles = "Admin,Manager")]  // OR
```

**Policy-based:** See [[Policy-Based-Authorization]]
```csharp
// Define policy
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("MinimumAge", policy =>
        policy.RequireClaim("age")
              .RequireAssertion(ctx =>
                  int.Parse(ctx.User.FindFirst("age")!.Value) >= 18));

    options.AddPolicy("CanEditPost", policy =>
        policy.Requirements.Add(new PostAuthorizationRequirement()));
});

// Use policy
[Authorize(Policy = "MinimumAge")]
public ActionResult AdultContent()
```

**Resource-based authorization:**
```csharp
public class PostController : ControllerBase
{
    private readonly IAuthorizationService _auth;

    public async Task<ActionResult> Edit(int id)
    {
        var post = await _postService.GetByIdAsync(id);
        var result = await _auth.AuthorizeAsync(User, post, "CanEdit");

        if (!result.Succeeded) return Forbid();
        // ...
    }
}
```

**Custom requirements:**
```csharp
public class PostAuthorizationHandler
    : AuthorizationHandler<PostAuthorizationRequirement, Post>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PostAuthorizationRequirement requirement,
        Post post)
    {
        if (post.AuthorId == context.User.GetUserId())
            context.Succeed(requirement);

        return Task.CompletedTask;
    }
}
```

**Related:**
- [[Authentication]] - who is the user
- [[Policy-Based-Authorization]] - complex rules
- [[Claims]] - user attributes
