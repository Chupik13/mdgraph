**Tags**: #aspnet #middleware #patterns
**Links**: [[Middleware]], [[Request-Pipeline]], [[Exception-Handling]]

---

### Middleware Best Practices

Best practices for writing and configuring ASP.NET Core middleware.

**Order matters:**
```csharp
// Correct order
app.UseExceptionHandler("/error");  // 1. Catch exceptions
app.UseHsts();                       // 2. Security headers
app.UseHttpsRedirection();           // 3. HTTPS redirect
app.UseStaticFiles();                // 4. Serve static files (short-circuit)
app.UseRouting();                    // 5. Route matching
app.UseCors();                       // 6. CORS (after routing)
app.UseAuthentication();             // 7. Auth (needs routing)
app.UseAuthorization();              // 8. Authz (after authn)
app.UseRateLimiter();                // 9. Rate limiting
app.MapControllers();                // 10. Endpoint execution
```

**Efficient middleware:**
```csharp
public class EfficientMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger _logger;  // Injected once

    public EfficientMiddleware(RequestDelegate next, ILogger<EfficientMiddleware> logger)
    {
        _next = next;
        _logger = logger;  // Don't resolve per-request
    }

    public async Task InvokeAsync(HttpContext context, IUserService userService)
    {
        // Scoped services can be injected in InvokeAsync
        await _next(context);
    }
}
```

**Conditional middleware:**
```csharp
// Only in development
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// Map-based branching
app.Map("/api", apiApp =>
{
    apiApp.UseAuthentication();
    apiApp.UseAuthorization();
});

// Conditional per-request
app.UseWhen(context => context.Request.Path.StartsWithSegments("/admin"),
    adminApp => adminApp.UseAdminMiddleware());
```

**Terminal middleware (short-circuit):**
```csharp
app.Use(async (context, next) =>
{
    if (context.Request.Path == "/health")
    {
        await context.Response.WriteAsync("OK");
        return;  // Don't call next - terminal
    }
    await next();
});
```

**Avoid:**
- Heavy computation in middleware
- Blocking calls (use async)
- Resolving scoped services in constructor
- Modifying response after it started

**Related:**
- [[Middleware]] - middleware basics
- [[Request-Pipeline]] - pipeline flow
- [[Performance-Best-Practices]] - optimization
