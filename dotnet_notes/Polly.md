**Tags**: #resilience #patterns #networking
**Links**: [[HttpClient]], [[Retry-Patterns]], [[Circuit-Breaker]], [[Timeout-Patterns]]

---

### Polly

Polly is a resilience and transient-fault-handling library. It provides retry, circuit breaker, timeout, and other policies.

**Retry policy:**
```csharp
var retryPolicy = Policy
    .Handle<HttpRequestException>()
    .Or<TimeoutException>()
    .WaitAndRetryAsync(
        retryCount: 3,
        sleepDurationProvider: attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt)),
        onRetry: (exception, timespan, attempt, context) =>
        {
            _logger.LogWarning("Retry {Attempt} after {Delay}s", attempt, timespan.TotalSeconds);
        });

var result = await retryPolicy.ExecuteAsync(() => httpClient.GetAsync(url));
```

**Circuit breaker:** See [[Circuit-Breaker]]
```csharp
var circuitBreaker = Policy
    .Handle<HttpRequestException>()
    .CircuitBreakerAsync(
        exceptionsAllowedBeforeBreaking: 5,
        durationOfBreak: TimeSpan.FromSeconds(30),
        onBreak: (ex, duration) => _logger.LogWarning("Circuit opened"),
        onReset: () => _logger.LogInformation("Circuit closed"));
```

**Timeout:**
```csharp
var timeoutPolicy = Policy.TimeoutAsync<HttpResponseMessage>(
    TimeSpan.FromSeconds(10),
    TimeoutStrategy.Pessimistic);
```

**Policy wrap (combine policies):**
```csharp
var policy = Policy.WrapAsync(
    circuitBreaker,
    retryPolicy,
    timeoutPolicy);
```

**With HttpClient:**
```csharp
builder.Services.AddHttpClient<IApiClient, ApiClient>()
    .AddPolicyHandler(GetRetryPolicy())
    .AddPolicyHandler(GetCircuitBreakerPolicy());

static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .WaitAndRetryAsync(3, _ => TimeSpan.FromMilliseconds(600));
}
```

**Related:**
- [[Retry-Patterns]] - retry strategies
- [[Circuit-Breaker]] - fault tolerance
- [[Bulkhead]] - isolation pattern
- [[Fallback-Pattern]] - graceful degradation
