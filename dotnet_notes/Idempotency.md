**Tags**: #api #patterns #reliability
**Links**: [[HTTP-Methods]], [[REST-API]], [[Retry-Patterns]]

---

### Idempotency

Idempotent operations produce the same result regardless of how many times they're executed. Critical for reliable APIs.

**Idempotency key pattern:**
```csharp
public class IdempotencyMiddleware
{
    public async Task InvokeAsync(HttpContext context, IIdempotencyStore store)
    {
        if (context.Request.Method is "POST" or "PATCH")
        {
            var key = context.Request.Headers["Idempotency-Key"].FirstOrDefault();
            if (key != null)
            {
                var cached = await store.GetAsync(key);
                if (cached != null)
                {
                    // Return cached response
                    context.Response.StatusCode = cached.StatusCode;
                    await context.Response.WriteAsJsonAsync(cached.Body);
                    return;
                }
            }
        }

        await _next(context);
    }
}
```

**Database-level idempotency:**
```csharp
public async Task<Order> CreateOrderAsync(CreateOrderRequest request)
{
    // Use idempotency key as unique constraint
    var existing = await _context.Orders
        .FirstOrDefaultAsync(o => o.IdempotencyKey == request.IdempotencyKey);

    if (existing != null)
        return existing;

    var order = new Order
    {
        IdempotencyKey = request.IdempotencyKey,
        // ... other properties
    };

    _context.Orders.Add(order);
    await _context.SaveChangesAsync();
    return order;
}
```

**Making operations idempotent:**
```csharp
// Non-idempotent: counter++
// Idempotent: counter = 5

// Non-idempotent: Add item to list
// Idempotent: Upsert item with unique key
await _context.Items.Upsert(item)
    .On(i => i.ExternalId)
    .RunAsync();
```

**Related:**
- [[HTTP-Methods]] - idempotent methods
- [[Retry-Patterns]] - safe retries
- [[Distributed-Systems]] - consistency

