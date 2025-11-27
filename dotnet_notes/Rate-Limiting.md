**Tags**: #aspnet #security #api
**Links**: [[Middleware]], [[Redis]], [[API-Design]], [[Polly]]

---

### Rate Limiting

Rate limiting protects APIs from abuse by limiting request frequency. Built-in support in .NET 7+.

**Setup:**
```csharp
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Fixed window
    options.AddFixedWindowLimiter("fixed", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 100;
        opt.QueueLimit = 10;
    });

    // Sliding window
    options.AddSlidingWindowLimiter("sliding", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.SegmentsPerWindow = 6;
        opt.PermitLimit = 100;
    });

    // Token bucket
    options.AddTokenBucketLimiter("token", opt =>
    {
        opt.TokenLimit = 100;
        opt.ReplenishmentPeriod = TimeSpan.FromSeconds(10);
        opt.TokensPerPeriod = 10;
    });

    // Per-user limiting
    options.AddPolicy("per-user", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User?.Identity?.Name ?? context.Connection.RemoteIpAddress?.ToString(),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1)
            }));
});

app.UseRateLimiter();
```

**Applying limits:**
```csharp
// Controller level
[EnableRateLimiting("fixed")]
public class ApiController : ControllerBase

// Action level
[HttpPost]
[EnableRateLimiting("per-user")]
public async Task<ActionResult> Create()

// Disable for specific action
[DisableRateLimiting]
public ActionResult HealthCheck()

// Minimal APIs
app.MapGet("/api/data", () => "data")
    .RequireRateLimiting("fixed");
```

**Response headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

**Related:**
- [[Redis]] - distributed rate limiting
- [[Polly]] - client-side throttling
- [[API-Design]] - API protection
