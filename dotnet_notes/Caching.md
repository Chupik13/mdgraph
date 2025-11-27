**Tags**: #performance #aspnet #patterns
**Links**: [[IMemoryCache]], [[Distributed-Cache]], [[Redis]], [[Cache-Aside-Pattern]]

---

### Caching in .NET

Caching stores frequently accessed data in memory to reduce database/API calls. Critical for performance.

**In-memory cache:** See [[IMemoryCache]]
```csharp
public class ProductService
{
    private readonly IMemoryCache _cache;

    public async Task<Product> GetProductAsync(int id)
    {
        return await _cache.GetOrCreateAsync($"product:{id}", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);
            entry.SlidingExpiration = TimeSpan.FromMinutes(2);
            return await _repository.GetByIdAsync(id);
        });
    }
}
```

**Distributed cache:** See [[Distributed-Cache]]
```csharp
// Registration (Redis)
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = "localhost:6379";
    options.InstanceName = "myapp:";
});

// Usage
public class ProductService
{
    private readonly IDistributedCache _cache;

    public async Task<Product?> GetProductAsync(int id)
    {
        var key = $"product:{id}";
        var cached = await _cache.GetStringAsync(key);

        if (cached != null)
            return JsonSerializer.Deserialize<Product>(cached);

        var product = await _repository.GetByIdAsync(id);
        await _cache.SetStringAsync(key,
            JsonSerializer.Serialize(product),
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
            });
        return product;
    }
}
```

**Cache patterns:**
- [[Cache-Aside-Pattern]] - app manages cache
- Write-through - write to cache and DB
- Write-behind - write to cache, async DB

**Cache invalidation:**
- Time-based expiration
- Event-based invalidation
- Cache tags (grouped invalidation)

**Related:**
- [[IMemoryCache]] - local cache
- [[Redis]] - distributed cache
- [[Output-Caching]] - response caching
