**Tags**: #http #security #aspnet
**Links**: [[Middleware]], [[API-Security]], [[Caching]]

---

### Response Headers

HTTP response headers control caching, security, and client behavior. Essential for secure and performant APIs.

**Security headers middleware:**
```csharp
app.Use(async (context, next) =>
{
    // Prevent MIME type sniffing
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");

    // Prevent clickjacking
    context.Response.Headers.Append("X-Frame-Options", "DENY");

    // XSS protection (legacy browsers)
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");

    // Control referrer information
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");

    // Content Security Policy
    context.Response.Headers.Append("Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self'");

    await next();
});
```

**Cache headers:**
```csharp
// No caching
context.Response.Headers.CacheControl = "no-store, no-cache, must-revalidate";

// Cache for 1 hour
context.Response.Headers.CacheControl = "public, max-age=3600";

// ETag for validation
context.Response.Headers.ETag = $"\"{contentHash}\"";

// Last modified
context.Response.Headers.LastModified = lastModified.ToString("R");
```

**CORS headers:**
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecific", policy =>
    {
        policy.WithOrigins("https://example.com")
              .WithMethods("GET", "POST")
              .WithHeaders("Content-Type", "Authorization")
              .WithExposedHeaders("X-Pagination")
              .AllowCredentials();
    });
});
```

**Custom headers:**
```csharp
app.MapGet("/api/data", (HttpContext context) =>
{
    context.Response.Headers.Append("X-Request-Id", Guid.NewGuid().ToString());
    context.Response.Headers.Append("X-Processing-Time", "42ms");
    return Results.Ok(data);
});
```

**Related:**
- [[Middleware]] - adding headers
- [[API-Security]] - security headers
- [[Caching]] - cache headers

