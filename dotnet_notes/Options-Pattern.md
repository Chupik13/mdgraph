**Tags**: #aspnet #config #patterns
**Links**: [[Configuration]], [[Dependency-Injection]], [[Validation]], [[IOptions]]

---

### Options Pattern

The Options pattern provides strongly-typed access to configuration with validation and change notification.

**Define options class:**
```csharp
public class EmailSettings
{
    public const string SectionName = "Email";

    public string SmtpServer { get; set; } = "";
    public int Port { get; set; } = 587;
    public string FromAddress { get; set; } = "";
}
```

**Register:**
```csharp
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection(EmailSettings.SectionName));
```

**Inject options:**
```csharp
// IOptions<T> - singleton, read at startup
public class EmailService(IOptions<EmailSettings> options)

// IOptionsSnapshot<T> - scoped, reloads on change
public class EmailService(IOptionsSnapshot<EmailSettings> options)

// IOptionsMonitor<T> - singleton, notifies on change
public class EmailService(IOptionsMonitor<EmailSettings> options)
{
    options.OnChange(settings => { /* handle change */ });
}
```

**Validation:**
```csharp
builder.Services.AddOptions<EmailSettings>()
    .BindConfiguration(EmailSettings.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();  // Fail fast

public class EmailSettings
{
    [Required]
    public string SmtpServer { get; set; } = "";

    [Range(1, 65535)]
    public int Port { get; set; }
}
```

**Named options:**
```csharp
services.Configure<StorageOptions>("azure", config.GetSection("AzureStorage"));
services.Configure<StorageOptions>("aws", config.GetSection("AwsStorage"));

// Inject with IOptionsSnapshot<StorageOptions>.Get("azure")
```

**Related:**
- [[Configuration]] - configuration sources
- [[Validation]] - data annotations
- [[IOptions]] - options interfaces comparison
