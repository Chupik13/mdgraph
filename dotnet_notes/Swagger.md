**Tags**: #aspnet #api #documentation
**Links**: [[REST-API-Design]], [[OpenAPI]], [[Controllers]], [[Minimal-APIs]]

---

### Swagger / OpenAPI

Swagger (OpenAPI) provides automatic API documentation and testing UI for ASP.NET Core APIs.

**Setup:**
```csharp
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "My API",
        Version = "v1",
        Description = "API for managing products"
    });

    // Include XML comments
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    options.IncludeXmlComments(xmlPath);
});

// Enable in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
```

**XML documentation:**
```csharp
/// <summary>
/// Creates a new user
/// </summary>
/// <param name="dto">User creation data</param>
/// <returns>The created user</returns>
/// <response code="201">User created successfully</response>
/// <response code="400">Invalid input data</response>
[HttpPost]
[ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
public async Task<ActionResult<UserDto>> Create(CreateUserDto dto)
```

**JWT authentication:**
```csharp
options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
{
    Type = SecuritySchemeType.Http,
    Scheme = "bearer",
    BearerFormat = "JWT",
    Description = "Enter JWT token"
});

options.AddSecurityRequirement(new OpenApiSecurityRequirement
{
    {
        new OpenApiSecurityScheme
        {
            Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
        },
        Array.Empty<string>()
    }
});
```

**Customization:**
- Group endpoints by tags
- Hide internal endpoints
- Custom operation filters

**Related:**
- [[OpenAPI]] - specification format
- [[REST-API-Design]] - API conventions
- [[API-Versioning]] - version management
