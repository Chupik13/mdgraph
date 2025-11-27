**Tags**: #aspnet #web #fundamentals
**Links**: [[Middleware]], [[ASP-NET-Core]], [[Caching]]

---

### Static Files

Static files middleware serves static content (HTML, CSS, JavaScript, images) from the file system.

**Basic setup:**
```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Serve files from wwwroot folder
app.UseStaticFiles();

app.Run();
```

**Custom directory:**
```csharp
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "StaticFiles")),
    RequestPath = "/static"
});
// Access: /static/image.png serves StaticFiles/image.png
```

**Multiple directories:**
```csharp
// Default wwwroot
app.UseStaticFiles();

// Additional directory
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "uploads")),
    RequestPath = "/uploads"
});
```

**Caching headers:**
```csharp
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append(
            "Cache-Control", "public,max-age=31536000");
    }
});
```

**Directory browsing:**
```csharp
builder.Services.AddDirectoryBrowser();

app.UseDirectoryBrowser(new DirectoryBrowserOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "shared")),
    RequestPath = "/shared"
});
```

**Security:**
```csharp
// Serve only specific extensions
app.UseStaticFiles(new StaticFileOptions
{
    ServeUnknownFileTypes = false,
    DefaultContentType = "application/octet-stream"
});
```

**Related:**
- [[Middleware]] - request pipeline
- [[ASP-NET-Core]] - web framework
- [[Caching]] - response caching

