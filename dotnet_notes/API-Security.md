**Tags**: #security #api #best-practices
**Links**: [[Authentication]], [[Authorization]], [[Rate-Limiting]]

---

### API Security

Essential security practices for protecting ASP.NET Core APIs.

**Authentication:**
```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = config["Jwt:Issuer"],
            ValidAudience = config["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(config["Jwt:Key"]!))
        };
    });
```

**Input validation:**
```csharp
public record CreateUserRequest
{
    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; init; }

    [Required, MinLength(8), MaxLength(100)]
    public string Password { get; init; }
}

// Always validate and sanitize
app.MapPost("/users", async (CreateUserRequest request, IValidator<CreateUserRequest> validator) =>
{
    var result = await validator.ValidateAsync(request);
    if (!result.IsValid)
        return Results.ValidationProblem(result.ToDictionary());
    // ...
});
```

**CORS:**
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins", policy =>
    {
        policy.WithOrigins("https://myapp.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
```

**Security headers:**
```csharp
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    await next();
});
```

**Related:**
- [[Authentication]] - identity verification
- [[Authorization]] - access control
- [[Rate-Limiting]] - abuse prevention

