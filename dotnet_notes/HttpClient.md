**Tags**: #aspnet #networking #patterns
**Links**: [[IHttpClientFactory]], [[Polly]], [[Retry-Patterns]], [[Circuit-Breaker]]

---

### HttpClient

HttpClient is for making HTTP requests. Use [[IHttpClientFactory]] to manage instances and avoid socket exhaustion.

**Wrong way (don't do this):**
```csharp
// BAD: Creates new HttpClient each time, causes socket exhaustion
using var client = new HttpClient();
var response = await client.GetAsync(url);
```

**Correct way with IHttpClientFactory:**
```csharp
// Registration
builder.Services.AddHttpClient<IWeatherService, WeatherService>(client =>
{
    client.BaseAddress = new Uri("https://api.weather.com/");
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});

// Usage
public class WeatherService : IWeatherService
{
    private readonly HttpClient _client;

    public WeatherService(HttpClient client)
    {
        _client = client;  // Injected, managed by factory
    }

    public async Task<Weather> GetWeatherAsync(string city)
    {
        var response = await _client.GetAsync($"weather/{city}");
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<Weather>();
    }
}
```

**Named clients:**
```csharp
services.AddHttpClient("github", client =>
{
    client.BaseAddress = new Uri("https://api.github.com/");
});

// Usage
var client = _clientFactory.CreateClient("github");
```

**With Polly:** See [[Polly]]
```csharp
builder.Services.AddHttpClient<IWeatherService, WeatherService>()
    .AddTransientHttpErrorPolicy(p =>
        p.WaitAndRetryAsync(3, _ => TimeSpan.FromSeconds(1)))
    .AddTransientHttpErrorPolicy(p =>
        p.CircuitBreakerAsync(5, TimeSpan.FromSeconds(30)));
```

**Related:**
- [[IHttpClientFactory]] - client management
- [[Polly]] - resilience policies
- [[Retry-Patterns]] - handling failures
- [[Circuit-Breaker]] - preventing cascading failures
