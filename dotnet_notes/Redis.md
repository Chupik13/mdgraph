**Tags**: #caching #database #performance
**Links**: [[Caching]], [[Distributed-Cache]], [[Session-Management]], [[Pub-Sub]]

---

### Redis in .NET

Redis is an in-memory data structure store used for caching, session management, and messaging.

**Setup:**
```csharp
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = "localhost:6379";
    options.InstanceName = "myapp:";
});

// Or direct connection
builder.Services.AddSingleton<IConnectionMultiplexer>(
    ConnectionMultiplexer.Connect("localhost:6379"));
```

**Distributed cache usage:**
```csharp
public class CachedUserService
{
    private readonly IDistributedCache _cache;
    private readonly IUserRepository _repo;

    public async Task<User?> GetUserAsync(int id)
    {
        var key = $"user:{id}";
        var cached = await _cache.GetStringAsync(key);

        if (cached != null)
            return JsonSerializer.Deserialize<User>(cached);

        var user = await _repo.GetByIdAsync(id);
        if (user != null)
        {
            await _cache.SetStringAsync(key,
                JsonSerializer.Serialize(user),
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
                });
        }
        return user;
    }

    public async Task InvalidateUserAsync(int id)
    {
        await _cache.RemoveAsync($"user:{id}");
    }
}
```

**Direct Redis operations:**
```csharp
public class RedisService
{
    private readonly IDatabase _db;

    public RedisService(IConnectionMultiplexer redis)
    {
        _db = redis.GetDatabase();
    }

    public async Task<bool> SetWithLockAsync(string key, string value)
    {
        return await _db.StringSetAsync(key, value,
            TimeSpan.FromMinutes(5), When.NotExists);
    }

    public async Task IncrementAsync(string key)
    {
        await _db.StringIncrementAsync(key);
    }
}
```

**Use cases:**
- Session storage
- Rate limiting
- Real-time leaderboards
- Pub/sub messaging

**Related:**
- [[Caching]] - caching strategies
- [[Distributed-Cache]] - cache abstraction
- [[Rate-Limiting]] - API throttling
