**Tags**: #jobs #background #scheduling
**Links**: [[Background-Services]], [[Cron-Jobs]], [[Redis]]

---

### Hangfire

Hangfire provides background job processing with persistence, retries, and dashboard. Production-ready job scheduler.

**Setup:**
```csharp
builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(connectionString));

builder.Services.AddHangfireServer();

app.UseHangfireDashboard("/hangfire");
```

**Fire-and-forget jobs:**
```csharp
BackgroundJob.Enqueue(() => SendEmail("user@example.com"));
BackgroundJob.Enqueue<IEmailService>(x => x.SendAsync("user@example.com"));
```

**Delayed jobs:**
```csharp
BackgroundJob.Schedule(
    () => SendReminder(userId),
    TimeSpan.FromDays(7));
```

**Recurring jobs:**
```csharp
RecurringJob.AddOrUpdate(
    "daily-report",
    () => GenerateDailyReport(),
    Cron.Daily);

RecurringJob.AddOrUpdate(
    "cleanup",
    () => CleanupOldData(),
    "0 0 * * 0");  // Sundays at midnight
```

**Continuations:**
```csharp
var jobId = BackgroundJob.Enqueue(() => ProcessOrder(orderId));
BackgroundJob.ContinueJobWith(jobId, () => SendConfirmation(orderId));
```

**With DI:**
```csharp
public class EmailJob
{
    private readonly IEmailService _emailService;

    public EmailJob(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task SendWelcomeEmail(string email)
    {
        await _emailService.SendWelcomeAsync(email);
    }
}

BackgroundJob.Enqueue<EmailJob>(x => x.SendWelcomeEmail("user@example.com"));
```

**Features:**
- Automatic retries
- Dashboard UI
- Multiple storage backends
- Job filtering and search

**Related:**
- [[Background-Services]] - built-in alternative
- [[Cron-Jobs]] - scheduling syntax
- [[Redis]] - storage option
