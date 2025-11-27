**Tags**: #aspnet #api #http
**Links**: [[REST-API]], [[Controllers]], [[JSON-Serialization]]

---

### Content Negotiation

Content negotiation allows APIs to return different formats based on client preferences (Accept header).

**Enable multiple formatters:**
```csharp
builder.Services.AddControllers(options =>
{
    options.RespectBrowserAcceptHeader = true;
    options.ReturnHttpNotAcceptable = true; // 406 if no match
})
.AddXmlSerializerFormatters()
.AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});
```

**Client requests:**
```http
GET /api/products/1
Accept: application/json

GET /api/products/1
Accept: application/xml

GET /api/products/1
Accept: text/csv
```

**Custom formatter:**
```csharp
public class CsvOutputFormatter : TextOutputFormatter
{
    public CsvOutputFormatter()
    {
        SupportedMediaTypes.Add("text/csv");
        SupportedEncodings.Add(Encoding.UTF8);
    }

    protected override bool CanWriteType(Type? type)
        => typeof(IEnumerable).IsAssignableFrom(type);

    public override async Task WriteResponseBodyAsync(
        OutputFormatterWriteContext context,
        Encoding selectedEncoding)
    {
        var response = context.HttpContext.Response;
        var items = (IEnumerable)context.Object!;

        foreach (var item in items)
        {
            var line = FormatAsCsv(item);
            await response.WriteAsync(line + "\n");
        }
    }
}

// Register
builder.Services.AddControllers(options =>
{
    options.OutputFormatters.Add(new CsvOutputFormatter());
});
```

**Force specific format:**
```csharp
[HttpGet("{id}")]
[Produces("application/json", "application/xml")]
public IActionResult Get(int id) => Ok(_service.Get(id));

[HttpGet("{id}.{format}")]
public IActionResult Get(int id, string format)
    => Ok(_service.Get(id)); // /api/products/1.json
```

**Related:**
- [[REST-API]] - API design
- [[Controllers]] - MVC controllers
- [[JSON-Serialization]] - JSON formatting

