**Tags**: #aspnet #api #standards
**Links**: [[Global-Exception-Handler]], [[Validation]], [[REST-API-Design]]

---

### Problem Details

Problem Details (RFC 7807) is a standard format for HTTP API error responses.

**Structure:**
```json
{
  "type": "https://example.com/problems/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "One or more validation errors occurred",
  "instance": "/api/users",
  "errors": {
    "email": ["Invalid email format"],
    "age": ["Must be at least 18"]
  }
}
```

**Built-in support:**
```csharp
builder.Services.AddProblemDetails();

// Automatic for [ApiController]
[HttpGet("{id}")]
public ActionResult<User> Get(int id)
{
    return NotFound();  // Returns problem details JSON
}
```

**Custom problem details:**
```csharp
builder.Services.AddProblemDetails(options =>
{
    options.CustomizeProblemDetails = context =>
    {
        context.ProblemDetails.Instance = context.HttpContext.Request.Path;
        context.ProblemDetails.Extensions["traceId"] =
            Activity.Current?.Id ?? context.HttpContext.TraceIdentifier;
    };
});
```

**Returning problem details:**
```csharp
[HttpPost]
public ActionResult<User> Create(CreateUserDto dto)
{
    if (await _service.EmailExistsAsync(dto.Email))
    {
        return Problem(
            title: "Conflict",
            detail: "Email already exists",
            statusCode: StatusCodes.Status409Conflict,
            type: "https://api.example.com/errors/email-conflict");
    }
    // ...
}
```

**Validation errors:**
```csharp
// [ApiController] automatically returns this format
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Name": ["The Name field is required."],
    "Email": ["Invalid email address."]
  }
}
```

**Related:**
- [[Global-Exception-Handler]] - error handling
- [[Validation]] - input validation
- [[REST-API-Design]] - API conventions
