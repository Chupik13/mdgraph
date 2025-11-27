**Tags**: #aspnet #modern #fundamentals
**Links**: [[ASP-NET-Core]], [[Dependency-Injection]], [[Configuration]], [[Middleware]]

---

### Minimal Hosting Model

The minimal hosting model (introduced in .NET 6) simplifies ASP.NET Core application setup with a single Program.cs file.

**Basic structure:**
```csharp
var builder = WebApplication.CreateBuilder(args);

// Configure services
builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddScoped<IUserService, UserService>();

var app = builder.Build();

// Configure middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

**WebApplicationBuilder:**
```csharp
var builder = WebApplication.CreateBuilder(args);

// Access configuration
var connectionString = builder.Configuration.GetConnectionString("Default");

// Access environment
if (builder.Environment.IsDevelopment()) { ... }

// Access services
builder.Services.AddSingleton<IService, Service>();

// Access logging
builder.Logging.AddConsole();

// Access Kestrel
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 10 * 1024 * 1024;
});
```

**WebApplication:**
```csharp
var app = builder.Build();

// Access services
using var scope = app.Services.CreateScope();
var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

// Access configuration
var setting = app.Configuration["MySetting"];

// Map endpoints
app.MapGet("/", () => "Hello World");
app.MapControllers();
app.MapHub<ChatHub>("/chat");

// Lifetime events
app.Lifetime.ApplicationStarted.Register(() => Console.WriteLine("Started"));
```

**Top-level statements:**
No explicit Main method needed - compiler generates it.

**Related:**
- [[ASP-NET-Core]] - framework overview
- [[Dependency-Injection]] - service registration
- [[Minimal-APIs]] - endpoint mapping
