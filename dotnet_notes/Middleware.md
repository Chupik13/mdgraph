**Tags**: #aspnet #web #patterns
**Links**: [[ASP-NET-Core]], [[Request-Pipeline]], [[Exception-Handling-Middleware]], [[Custom-Middleware]]

---

### Middleware

Middleware are components that handle requests and responses in the ASP.NET Core pipeline. Each middleware can process, short-circuit, or pass to the next.

**Pipeline order matters:**
```csharp
app.UseExceptionHandler("/error");  // First - catches all
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();            // Before authorization
app.UseAuthorization();             // After authentication
app.MapControllers();
```

**Built-in middleware:**
- `UseExceptionHandler` - global error handling
- `UseStaticFiles` - serve wwwroot files
- `UseRouting` / `UseEndpoints` - routing
- `UseAuthentication` / `UseAuthorization` - security
- `UseCors` - cross-origin requests

**Custom middleware:**
```csharp
public class RequestTimingMiddleware
{
    private readonly RequestDelegate _next;

    public RequestTimingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        await _next(context);  // Call next middleware
        sw.Stop();
        context.Response.Headers["X-Response-Time"] = $"{sw.ElapsedMilliseconds}ms";
    }
}

// Registration
app.UseMiddleware<RequestTimingMiddleware>();
```

**Short-circuiting:**
```csharp
app.Use(async (context, next) =>
{
    if (context.Request.Path == "/health")
    {
        await context.Response.WriteAsync("OK");
        return;  // Don't call next - short circuit
    }
    await next();
});
```

**Related:**
- [[Exception-Handling-Middleware]] - error handling
- [[Custom-Middleware]] - writing middleware
- [[Request-Pipeline]] - pipeline flow
