**Tags**: #resilience #patterns #networking
**Links**: [[Polly]], [[Circuit-Breaker]], [[HttpClient]]

---

### Retry Patterns

Retry patterns handle transient failures by automatically retrying failed operations with configurable strategies.

**Simple retry:**
```csharp
var retryPolicy = Policy
    .Handle<HttpRequestException>()
    .RetryAsync(3);

await retryPolicy.ExecuteAsync(() => httpClient.GetAsync(url));
```

**Wait and retry:**
```csharp
var retryPolicy = Policy
    .Handle<HttpRequestException>()
    .WaitAndRetryAsync(
        retryCount: 3,
        sleepDurationProvider: attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt)));
// Waits: 2s, 4s, 8s
```

**Exponential backoff with jitter:**
```csharp
var delay = Backoff.DecorrelatedJitterBackoffV2(
    medianFirstRetryDelay: TimeSpan.FromSeconds(1),
    retryCount: 5);

var retryPolicy = Policy
    .Handle<HttpRequestException>()
    .WaitAndRetryAsync(delay);
```

**With logging:**
```csharp
var retryPolicy = Policy
    .Handle<HttpRequestException>()
    .WaitAndRetryAsync(
        retryCount: 3,
        sleepDurationProvider: attempt => TimeSpan.FromSeconds(attempt),
        onRetry: (exception, timeSpan, retryCount, context) =>
        {
            _logger.LogWarning(
                "Retry {RetryCount} after {Delay}s due to: {Message}",
                retryCount, timeSpan.TotalSeconds, exception.Message);
        });
```

**HTTP-specific:**
```csharp
builder.Services.AddHttpClient<IApiClient, ApiClient>()
    .AddTransientHttpErrorPolicy(policy =>
        policy.WaitAndRetryAsync(
            Backoff.DecorrelatedJitterBackoffV2(
                TimeSpan.FromSeconds(1), 5)));
```

**When to retry:**
- Network timeouts
- 5xx server errors
- 429 Too Many Requests
- Database deadlocks

**When NOT to retry:**
- 4xx client errors (except 429)
- Business logic failures
- Authentication failures

**Related:**
- [[Polly]] - resilience library
- [[Circuit-Breaker]] - failure isolation
- [[HttpClient]] - HTTP requests
