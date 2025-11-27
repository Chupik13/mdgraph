**Tags**: #resilience #patterns #microservices
**Links**: [[Polly]], [[Retry-Patterns]], [[Fallback-Pattern]], [[HttpClient]]

---

### Circuit Breaker Pattern

Circuit breaker prevents cascading failures by failing fast when a dependency is unhealthy. Like an electrical circuit breaker.

**States:**
- **Closed** - normal operation, requests flow through
- **Open** - failing fast, no requests to dependency
- **Half-Open** - testing if dependency recovered

**With Polly:**
```csharp
var circuitBreaker = Policy
    .Handle<HttpRequestException>()
    .Or<TimeoutException>()
    .CircuitBreakerAsync(
        exceptionsAllowedBeforeBreaking: 5,
        durationOfBreak: TimeSpan.FromSeconds(30),
        onBreak: (exception, duration) =>
        {
            _logger.LogWarning("Circuit opened for {Duration}s", duration.TotalSeconds);
        },
        onReset: () =>
        {
            _logger.LogInformation("Circuit closed - service recovered");
        },
        onHalfOpen: () =>
        {
            _logger.LogInformation("Circuit half-open - testing service");
        });
```

**Advanced circuit breaker:**
```csharp
var advancedBreaker = Policy
    .Handle<Exception>()
    .AdvancedCircuitBreakerAsync(
        failureThreshold: 0.5,        // 50% failure rate
        samplingDuration: TimeSpan.FromSeconds(10),
        minimumThroughput: 8,         // Minimum calls before breaking
        durationOfBreak: TimeSpan.FromSeconds(30));
```

**With HttpClient:**
```csharp
builder.Services.AddHttpClient<IPaymentService, PaymentService>()
    .AddTransientHttpErrorPolicy(p => p.CircuitBreakerAsync(
        handledEventsAllowedBeforeBreaking: 3,
        durationOfBreak: TimeSpan.FromSeconds(30)));
```

**Handling open circuit:**
```csharp
try
{
    return await _circuitBreaker.ExecuteAsync(() => _api.GetDataAsync());
}
catch (BrokenCircuitException)
{
    _logger.LogWarning("Circuit is open, returning cached data");
    return _cache.GetFallbackData();
}
```

**Related:**
- [[Polly]] - resilience library
- [[Retry-Patterns]] - retry strategies
- [[Fallback-Pattern]] - graceful degradation
