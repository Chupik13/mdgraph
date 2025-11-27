**Tags**: #testing #docker #integration
**Links**: [[Integration-Testing]], [[Docker]], [[xUnit]]

---

### Testcontainers

Testcontainers provides disposable Docker containers for integration testing. Real databases, queues, etc. in tests.

**Setup:**
```csharp
// NuGet: Testcontainers.PostgreSql, Testcontainers.Redis, etc.
```

**PostgreSQL example:**
```csharp
public class DatabaseTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgres:15")
        .WithDatabase("testdb")
        .WithUsername("test")
        .WithPassword("test")
        .Build();

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
    }

    public async Task DisposeAsync()
    {
        await _postgres.DisposeAsync();
    }

    [Fact]
    public async Task CanQueryDatabase()
    {
        var connectionString = _postgres.GetConnectionString();

        await using var context = new AppDbContext(
            new DbContextOptionsBuilder<AppDbContext>()
                .UseNpgsql(connectionString)
                .Options);

        await context.Database.MigrateAsync();

        context.Users.Add(new User { Name = "Test" });
        await context.SaveChangesAsync();

        var user = await context.Users.FirstAsync();
        Assert.Equal("Test", user.Name);
    }
}
```

**Redis example:**
```csharp
private readonly RedisContainer _redis = new RedisBuilder()
    .WithImage("redis:7")
    .Build();

[Fact]
public async Task CanUseRedis()
{
    var connectionString = _redis.GetConnectionString();
    var redis = await ConnectionMultiplexer.ConnectAsync(connectionString);
    var db = redis.GetDatabase();

    await db.StringSetAsync("key", "value");
    var result = await db.StringGetAsync("key");

    Assert.Equal("value", result);
}
```

**With WebApplicationFactory:**
```csharp
public class ApiTests : IClassFixture<CustomWebApplicationFactory>
{
    // Factory uses Testcontainers for real database
}
```

**Benefits:**
- Real dependencies, not mocks
- Isolated test environments
- Reproducible across machines
- CI/CD friendly

**Related:**
- [[Integration-Testing]] - test strategies
- [[Docker]] - container basics
- [[xUnit]] - test framework
