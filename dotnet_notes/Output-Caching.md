**Tags**: #aspnet #performance #caching
**Links**: [[Caching]], [[Middleware]], [[Response-Caching]], [[Redis]]

---

### Output Caching (.NET 7+)

Output caching stores entire HTTP responses to serve subsequent requests without re-executing endpoint logic.

**Setup:**
```csharp
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => builder.Expire(TimeSpan.FromMinutes(10)));

    options.AddPolicy("Products", builder => builder
        .Expire(TimeSpan.FromMinutes(5))
        .Tag("products"));

    options.AddPolicy("ByUser", builder => builder
        .SetVaryByHeader("Authorization")
        .Expire(TimeSpan.FromMinutes(1)));
});

app.UseOutputCache();
```

**Applying to endpoints:**
```csharp
// Minimal APIs
app.MapGet("/products", GetProducts)
    .CacheOutput("Products");

app.MapGet("/products/{id}", GetProduct)
    .CacheOutput(policy => policy
        .Expire(TimeSpan.FromMinutes(5))
        .SetVaryByRouteValue("id"));

// Controllers
[OutputCache(PolicyName = "Products")]
[HttpGet]
public async Task<IEnumerable<Product>> GetAll()
```

**Cache invalidation:**
```csharp
public class ProductsController(IOutputCacheStore cache) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult> Create(ProductDto dto)
    {
        await _service.CreateAsync(dto);

        // Invalidate by tag
        await cache.EvictByTagAsync("products", default);

        return Ok();
    }
}
```

**Vary by:**
```csharp
.CacheOutput(policy => policy
    .SetVaryByQuery("page", "sort")     // Different cache per query params
    .SetVaryByHeader("Accept-Language") // Different cache per language
    .SetVaryByRouteValue("id"))         // Different cache per route value
```

**Distributed cache (Redis):**
```csharp
builder.Services.AddStackExchangeRedisOutputCache(options =>
{
    options.Configuration = "localhost:6379";
});
```

**Related:**
- [[Caching]] - caching overview
- [[Response-Caching]] - HTTP cache headers
- [[Redis]] - distributed storage
