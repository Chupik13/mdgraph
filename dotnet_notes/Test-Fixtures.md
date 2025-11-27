**Tags**: #testing #xunit #setup
**Links**: [[xUnit]], [[Integration-Testing]], [[TestContainers]]

---

### Test Fixtures

Test fixtures share setup and cleanup code across tests. Use for expensive resources like databases.

**Class fixture (shared within class):**
```csharp
public class DatabaseFixture : IDisposable
{
    public AppDbContext Context { get; }

    public DatabaseFixture()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        Context = new AppDbContext(options);
        SeedTestData();
    }

    private void SeedTestData()
    {
        Context.Users.Add(new User { Id = 1, Name = "Test User" });
        Context.SaveChanges();
    }

    public void Dispose() => Context.Dispose();
}

public class UserTests : IClassFixture<DatabaseFixture>
{
    private readonly DatabaseFixture _fixture;

    public UserTests(DatabaseFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public void GetUser_ReturnsUser()
    {
        var user = _fixture.Context.Users.Find(1);
        Assert.NotNull(user);
    }
}
```

**Collection fixture (shared across classes):**
```csharp
[CollectionDefinition("Database")]
public class DatabaseCollection : ICollectionFixture<DatabaseFixture> { }

[Collection("Database")]
public class OrderTests
{
    private readonly DatabaseFixture _fixture;
    public OrderTests(DatabaseFixture fixture) => _fixture = fixture;
}

[Collection("Database")]
public class CustomerTests
{
    private readonly DatabaseFixture _fixture;
    public CustomerTests(DatabaseFixture fixture) => _fixture = fixture;
}
```

**Async fixture:**
```csharp
public class ApiFixture : IAsyncLifetime
{
    public HttpClient Client { get; private set; }

    public async Task InitializeAsync()
    {
        // Async setup
        Client = await CreateAuthenticatedClientAsync();
    }

    public async Task DisposeAsync()
    {
        Client.Dispose();
    }
}
```

**Related:**
- [[xUnit]] - test framework
- [[Integration-Testing]] - integration test setup
- [[TestContainers]] - database containers

