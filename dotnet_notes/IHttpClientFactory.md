**Tags**: #aspnet #networking #patterns
**Links**: [[HttpClient]], [[Polly]], [[Dependency-Injection]]

---

### IHttpClientFactory

IHttpClientFactory manages HttpClient instances, preventing socket exhaustion and enabling advanced configuration.

**Why use it:**
```csharp
// BAD - socket exhaustion
using var client = new HttpClient();  // Don't do this repeatedly!

// GOOD - managed by factory
var client = _clientFactory.CreateClient();
```

**Named clients:**
```csharp
builder.Services.AddHttpClient("github", client =>
{
    client.BaseAddress = new Uri("https://api.github.com/");
    client.DefaultRequestHeaders.Add("Accept", "application/vnd.github.v3+json");
    client.DefaultRequestHeaders.Add("User-Agent", "MyApp");
});

// Usage
public class GitHubService(IHttpClientFactory factory)
{
    public async Task<Repo> GetRepoAsync(string owner, string repo)
    {
        var client = factory.CreateClient("github");
        return await client.GetFromJsonAsync<Repo>($"repos/{owner}/{repo}");
    }
}
```

**Typed clients:**
```csharp
builder.Services.AddHttpClient<IGitHubClient, GitHubClient>(client =>
{
    client.BaseAddress = new Uri("https://api.github.com/");
});

public class GitHubClient : IGitHubClient
{
    private readonly HttpClient _client;

    public GitHubClient(HttpClient client)
    {
        _client = client;  // Injected, configured
    }
}
```

**With Polly:**
```csharp
builder.Services.AddHttpClient<IApiClient, ApiClient>()
    .AddTransientHttpErrorPolicy(p => p.WaitAndRetryAsync(3, _ => TimeSpan.FromSeconds(1)))
    .AddTransientHttpErrorPolicy(p => p.CircuitBreakerAsync(5, TimeSpan.FromSeconds(30)));
```

**Message handlers:**
```csharp
builder.Services.AddHttpClient<IApiClient, ApiClient>()
    .AddHttpMessageHandler<AuthenticationHandler>()
    .AddHttpMessageHandler<LoggingHandler>();
```

**Benefits:**
- Connection pooling
- DNS refresh
- Centralized configuration
- Polly integration

**Related:**
- [[HttpClient]] - usage patterns
- [[Polly]] - resilience policies
- [[Retry-Patterns]] - retry configuration
