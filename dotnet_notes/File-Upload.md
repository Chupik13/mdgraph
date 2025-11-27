**Tags**: #aspnet #web #patterns
**Links**: [[Controllers]], [[Minimal-APIs]], [[Streaming]]

---

### File Upload

Handle file uploads safely in ASP.NET Core. Support for small files (buffered) and large files (streaming).

**Small file upload:**
```csharp
[HttpPost]
public async Task<IActionResult> Upload(IFormFile file)
{
    if (file.Length == 0)
        return BadRequest("Empty file");

    if (file.Length > 10 * 1024 * 1024) // 10MB limit
        return BadRequest("File too large");

    var allowedExtensions = new[] { ".jpg", ".png", ".pdf" };
    var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
    if (!allowedExtensions.Contains(extension))
        return BadRequest("Invalid file type");

    var fileName = $"{Guid.NewGuid()}{extension}";
    var filePath = Path.Combine(_uploadPath, fileName);

    await using var stream = new FileStream(filePath, FileMode.Create);
    await file.CopyToAsync(stream);

    return Ok(new { FileName = fileName });
}
```

**Multiple files:**
```csharp
[HttpPost]
public async Task<IActionResult> UploadMany(List<IFormFile> files)
{
    foreach (var file in files)
    {
        await SaveFileAsync(file);
    }
    return Ok();
}
```

**Large file streaming:**
```csharp
[HttpPost]
[DisableRequestSizeLimit]
[RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
public async Task<IActionResult> UploadLarge()
{
    var boundary = Request.GetMultipartBoundary();
    var reader = new MultipartReader(boundary, Request.Body);
    MultipartSection? section;

    while ((section = await reader.ReadNextSectionAsync()) != null)
    {
        if (ContentDispositionHeaderValue.TryParse(
            section.ContentDisposition, out var disposition))
        {
            if (disposition.IsFileDisposition())
            {
                var fileName = disposition.FileName.Value;
                await using var stream = new FileStream(
                    Path.Combine(_uploadPath, fileName),
                    FileMode.Create);
                await section.Body.CopyToAsync(stream);
            }
        }
    }

    return Ok();
}
```

**Related:**
- [[Controllers]] - MVC controllers
- [[Streaming]] - stream processing
- [[Minimal-APIs]] - endpoint handlers

