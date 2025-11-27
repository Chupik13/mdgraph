**Tags**: #devops #patterns #deployment
**Links**: [[Configuration]], [[Options-Pattern]], [[Deployment-Strategies]]

---

### Feature Flags

Feature flags enable/disable features at runtime without deployment. Essential for progressive rollouts and A/B testing.

**Microsoft.FeatureManagement:**
```csharp
builder.Services.AddFeatureManagement();

// appsettings.json
{
  "FeatureManagement": {
    "NewDashboard": true,
    "BetaFeature": {
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

**Usage in code:**
```csharp
public class DashboardController(IFeatureManager featureManager) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> Get()
    {
        if (await featureManager.IsEnabledAsync("NewDashboard"))
        {
            return Ok(GetNewDashboard());
        }
        return Ok(GetLegacyDashboard());
    }
}
```

**Attribute-based:**
```csharp
[FeatureGate("BetaFeature")]
[HttpGet("beta")]
public ActionResult BetaEndpoint()
{
    return Ok("Beta content");
}
```

**In views:**
```html
<feature name="NewDashboard">
    <div>New dashboard UI</div>
</feature>
```

**Custom filters:**
```csharp
public class UserRoleFilter : IFeatureFilter
{
    public Task<bool> EvaluateAsync(FeatureFilterEvaluationContext context)
    {
        var allowedRoles = context.Parameters.Get<string[]>("AllowedRoles");
        var userRole = _httpContext.User.GetRole();
        return Task.FromResult(allowedRoles.Contains(userRole));
    }
}
```

**Use cases:**
- Gradual rollout
- A/B testing
- Kill switches
- Environment-specific features
- Trunk-based development

**Related:**
- [[Configuration]] - settings management
- [[Deployment-Strategies]] - release strategies
- [[Options-Pattern]] - typed configuration
