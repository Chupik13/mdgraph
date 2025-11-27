**Tags**: #patterns #deployment #configuration
**Links**: [[Feature-Flags]], [[Configuration]], [[A-B-Testing]]

---

### Feature Toggles

Feature toggles enable/disable features at runtime without deploying new code. Essential for continuous delivery.

**Microsoft.FeatureManagement:**
```bash
dotnet add package Microsoft.FeatureManagement.AspNetCore
```

**Configuration:**
```json
{
  "FeatureManagement": {
    "NewCheckout": true,
    "BetaFeatures": false,
    "PremiumFeatures": {
      "EnabledFor": [
        {
          "Name": "Percentage",
          "Parameters": { "Value": 50 }
        }
      ]
    }
  }
}
```

**Registration:**
```csharp
builder.Services.AddFeatureManagement();
```

**Usage in code:**
```csharp
public class CheckoutService(IFeatureManager featureManager)
{
    public async Task<CheckoutResult> ProcessAsync(Cart cart)
    {
        if (await featureManager.IsEnabledAsync("NewCheckout"))
        {
            return await NewCheckoutFlow(cart);
        }
        return await LegacyCheckoutFlow(cart);
    }
}
```

**In Razor views:**
```razor
<feature name="NewUI">
    <div class="new-design">...</div>
</feature>
<feature name="NewUI" negate="true">
    <div class="old-design">...</div>
</feature>
```

**Feature filters:**
```csharp
[FilterAlias("TimeWindow")]
public class TimeWindowFilter : IFeatureFilter
{
    public Task<bool> EvaluateAsync(FeatureFilterEvaluationContext context)
    {
        var settings = context.Parameters.Get<TimeWindowSettings>();
        var now = DateTime.UtcNow;
        return Task.FromResult(now >= settings.Start && now <= settings.End);
    }
}
```

**Related:**
- [[Feature-Flags]] - flag patterns
- [[Configuration]] - configuration system
- [[A-B-Testing]] - experimentation

