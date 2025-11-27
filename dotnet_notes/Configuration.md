**Tags**: #aspnet #fundamentals #config
**Links**: [[Options-Pattern]], [[Secret-Management]], [[Environment-Variables]], [[appsettings]]

---

### Configuration

ASP.NET Core configuration system supports multiple sources with layered overrides.

**Configuration sources (in order):**
1. appsettings.json
2. appsettings.{Environment}.json
3. User secrets (development)
4. Environment variables
5. Command-line arguments

**appsettings.json:**
```json
{
  "ConnectionStrings": {
    "Default": "Server=localhost;Database=mydb"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  },
  "MySettings": {
    "ApiKey": "xxx",
    "Timeout": 30
  }
}
```

**Accessing configuration:**
```csharp
// Direct access
var connectionString = builder.Configuration.GetConnectionString("Default");
var apiKey = builder.Configuration["MySettings:ApiKey"];

// Binding to class (recommended)
builder.Services.Configure<MySettings>(
    builder.Configuration.GetSection("MySettings"));
```

**Options pattern:** See [[Options-Pattern]]
```csharp
public class MySettings
{
    public string ApiKey { get; set; } = "";
    public int Timeout { get; set; }
}

// Inject
public class MyService(IOptions<MySettings> options)
{
    private readonly MySettings _settings = options.Value;
}
```

**Environment-specific:**
```csharp
// Automatically loaded based on ASPNETCORE_ENVIRONMENT
// appsettings.Development.json
// appsettings.Production.json
```

**Related:**
- [[Options-Pattern]] - typed configuration
- [[Secret-Management]] - managing secrets
- [[Environment-Variables]] - override settings
