**Tags**: #csharp #async #threading
**Links**: [[async-await]], [[SynchronizationContext]], [[Task]], [[Deadlock-Patterns]]

---

### ConfigureAwait

`ConfigureAwait(false)` tells the awaiter not to capture and resume on the original [[SynchronizationContext]].

**Why it matters:**
- In UI apps, `await` resumes on UI thread by default
- In ASP.NET Core, there's no sync context (less relevant)
- In libraries, always use `ConfigureAwait(false)`

**Usage:**
```csharp
// Library code - don't capture context
public async Task<Data> GetDataAsync()
{
    var result = await _httpClient
        .GetAsync(url)
        .ConfigureAwait(false);

    return await result.Content
        .ReadAsAsync<Data>()
        .ConfigureAwait(false);
}
```

**Rules:**
- Application code: usually don't need it
- Library code: ALWAYS use `ConfigureAwait(false)`
- After first `ConfigureAwait(false)`, subsequent awaits stay off context

**Avoiding deadlocks:**
Without `ConfigureAwait(false)`, blocking on async code in UI/ASP.NET can cause [[Deadlock-Patterns]]:
```csharp
// DEADLOCK in UI app!
var result = GetDataAsync().Result;
```

**Related:**
- [[SynchronizationContext]] - how contexts work
- [[Deadlock-Patterns]] - common async deadlocks
- [[Async-Best-Practices]] - comprehensive guide
