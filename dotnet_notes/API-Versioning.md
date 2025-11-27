**Tags**: #aspnet #api #design
**Links**: [[REST-API-Design]], [[Controllers]], [[Minimal-APIs]], [[Swagger]]

---

### API Versioning

API versioning allows breaking changes while maintaining backward compatibility for existing clients.

**Setup:**
```csharp
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = ApiVersionReader.Combine(
        new UrlSegmentApiVersionReader(),
        new HeaderApiVersionReader("X-Api-Version"),
        new QueryStringApiVersionReader("api-version"));
})
.AddApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});
```

**URL versioning:**
```csharp
[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiVersion("1.0")]
public class UsersV1Controller : ControllerBase
{
    [HttpGet("{id}")]
    public ActionResult<UserV1Dto> Get(int id) => ...
}

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiVersion("2.0")]
public class UsersV2Controller : ControllerBase
{
    [HttpGet("{id}")]
    public ActionResult<UserV2Dto> Get(int id) => ...  // New response format
}
```

**Deprecation:**
```csharp
[ApiVersion("1.0", Deprecated = true)]
[ApiVersion("2.0")]
public class UsersController : ControllerBase
{
    [HttpGet, MapToApiVersion("1.0")]
    public ActionResult<UserV1Dto> GetV1() => ...

    [HttpGet, MapToApiVersion("2.0")]
    public ActionResult<UserV2Dto> GetV2() => ...
}
```

**Swagger integration:**
```csharp
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "API", Version = "v1" });
    options.SwaggerDoc("v2", new OpenApiInfo { Title = "API", Version = "v2" });
});

app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "V1");
    options.SwaggerEndpoint("/swagger/v2/swagger.json", "V2");
});
```

**Related:**
- [[REST-API-Design]] - API principles
- [[Swagger]] - documentation
- [[Breaking-Changes]] - managing changes
