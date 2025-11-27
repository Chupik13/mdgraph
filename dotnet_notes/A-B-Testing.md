**Tags**: #patterns #experimentation #analytics
**Links**: [[Feature-Toggles]], [[Feature-Flags]], [[Metrics]]

---

### A/B Testing

A/B testing compares different versions of features to determine which performs better based on metrics.

**Basic A/B test with feature flags:**
```csharp
public class CheckoutExperiment(IFeatureManager features, IMetricsService metrics)
{
    public async Task<IActionResult> ProcessCheckout(Cart cart, string userId)
    {
        var variant = await GetVariantAsync(userId);

        var stopwatch = Stopwatch.StartNew();
        IActionResult result;

        if (variant == "A")
        {
            result = await OriginalCheckout(cart);
        }
        else
        {
            result = await NewCheckout(cart);
        }

        // Track metrics for analysis
        await metrics.TrackAsync("checkout_completion", new
        {
            Variant = variant,
            Duration = stopwatch.ElapsedMilliseconds,
            CartValue = cart.Total,
            UserId = userId
        });

        return result;
    }

    private async Task<string> GetVariantAsync(string userId)
    {
        // Consistent assignment per user
        var hash = userId.GetHashCode();
        return hash % 2 == 0 ? "A" : "B";
    }
}
```

**Percentage-based rollout:**
```json
{
  "FeatureManagement": {
    "NewCheckout": {
      "EnabledFor": [
        {
          "Name": "Percentage",
          "Parameters": { "Value": 20 }
        }
      ]
    }
  }
}
```

**User targeting:**
```csharp
public class UserTargetingFilter : IFeatureFilter
{
    public Task<bool> EvaluateAsync(FeatureFilterEvaluationContext context)
    {
        var settings = context.Parameters.Get<UserTargetSettings>();
        var userId = _httpContext.User.FindFirst("sub")?.Value;

        return Task.FromResult(
            settings.AllowedUsers?.Contains(userId) == true ||
            settings.AllowedGroups?.Any(g => UserInGroup(userId, g)) == true
        );
    }
}
```

**Related:**
- [[Feature-Toggles]] - toggle system
- [[Metrics]] - tracking results
- [[Feature-Flags]] - flag management

