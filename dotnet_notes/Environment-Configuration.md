**Tags**: #aspnet #configuration #deployment
**Links**: [[Configuration]], [[Options-Pattern]], [[Secret-Management]]

---

### Environment Configuration

Configure applications differently based on environment (Development, Staging, Production).

**Environment-specific settings:**
```json
// appsettings.json (base)
{
  "Logging": { "LogLevel": { "Default": "Information" } }
}

// appsettings.Development.json
{
  "Logging": { "LogLevel": { "Default": "Debug" } },
  "ConnectionStrings": { "Default": "Server=localhost;..." }
}

// appsettings.Production.json
{
  "Logging": { "LogLevel": { "Default": "Warning" } }
}
```

**Environment detection:**
```csharp
var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
{
    // Development-only services
    builder.Services.AddSwaggerGen();
}

if (builder.Environment.IsProduction())
{
    // Production-only configuration
    builder.Services.AddApplicationInsightsTelemetry();
}
```

**Setting the environment:**
```bash
# Command line
ASPNETCORE_ENVIRONMENT=Production dotnet run

# launchSettings.json
{
  "profiles": {
    "Development": {
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

**Configuration priority (lowest to highest):**
1. appsettings.json
2. appsettings.{Environment}.json
3. User secrets (Development only)
4. Environment variables
5. Command-line arguments

**Custom environments:**
```csharp
if (builder.Environment.IsEnvironment("Staging"))
{
    // Staging-specific config
}
```

**Related:**
- [[Configuration]] - configuration system
- [[Options-Pattern]] - strongly-typed options
- [[Secret-Management]] - secure secrets

