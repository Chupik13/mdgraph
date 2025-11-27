**Tags**: #testing #aspnet #quality
**Links**: [[Unit-Testing]], [[xUnit]], [[WebApplicationFactory]], [[TestContainers]]

---

### Integration Testing

Integration tests verify that multiple components work together correctly. In ASP.NET Core, this often means testing the full HTTP pipeline.

**WebApplicationFactory:**
```csharp
public class ApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetUsers_ReturnsSuccessStatusCode()
    {
        var response = await _client.GetAsync("/api/users");
        response.EnsureSuccessStatusCode();
    }
}
```

**Custom factory:**
```csharp
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Replace database with in-memory
            var descriptor = services.Single(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            services.Remove(descriptor);

            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase("TestDb"));

            // Replace services with mocks
            services.AddScoped<IEmailService, FakeEmailService>();
        });
    }
}
```

**Testing with real database:** See [[TestContainers]]
```csharp
public class DatabaseTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder().Build();

    public async Task InitializeAsync() => await _postgres.StartAsync();
    public async Task DisposeAsync() => await _postgres.DisposeAsync();

    [Fact]
    public async Task CanConnectToDatabase()
    {
        var connectionString = _postgres.GetConnectionString();
        // Use real PostgreSQL in Docker
    }
}
```

**Test data:**
```csharp
// Seed test data
var scope = factory.Services.CreateScope();
var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
context.Users.Add(new User { Name = "Test" });
await context.SaveChangesAsync();
```

**Related:**
- [[WebApplicationFactory]] - test server
- [[TestContainers]] - Docker-based testing
- [[Unit-Testing]] - isolated tests
