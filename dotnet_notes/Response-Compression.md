**Tags**: #aspnet #performance #web
**Links**: [[Middleware]], [[Performance-Best-Practices]], [[Output-Caching]]

---

### Response Compression

Response compression reduces bandwidth by compressing HTTP responses. Significant impact on text-based content.

**Setup:**
```csharp
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;  // Enable for HTTPS
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[]
    {
        "application/json",
        "text/plain",
        "image/svg+xml"
    });
});

builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Optimal;
});

app.UseResponseCompression();  // Before other middleware
```

**How it works:**
1. Client sends `Accept-Encoding: gzip, br`
2. Server compresses response
3. Server sends `Content-Encoding: br` (or gzip)
4. Client decompresses

**Compression algorithms:**
- **Brotli (br)** - best compression, modern browsers
- **Gzip** - widely supported, fast
- **Deflate** - legacy, avoid

**Skip compression:**
```csharp
[HttpGet]
public ActionResult GetLargeFile()
{
    Response.Headers.ContentEncoding = "";  // Disable for this response
    return File(data, "application/octet-stream");
}
```

**When NOT to compress:**
- Already compressed formats (images, videos)
- Small responses (< 1KB)
- Real-time streaming
- When CPU is bottleneck

**Alternative - static file compression:**
```csharp
// Pre-compress static files
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=31536000");
    }
});
```

**Related:**
- [[Output-Caching]] - caching responses
- [[Performance-Best-Practices]] - optimization
- [[Static-Files]] - serving static content
