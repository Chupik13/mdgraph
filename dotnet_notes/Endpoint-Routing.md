**Tags**: #aspnet #routing #fundamentals
**Links**: [[Routing]], [[Minimal-APIs]], [[Controllers]]

---

### Endpoint Routing

Endpoint routing is the modern routing system in ASP.NET Core. Routes are matched early and middleware can access routing information.

**Route patterns:**
```csharp
// Literal segments
app.MapGet("/products", GetProducts);

// Route parameters
app.MapGet("/products/{id}", GetProduct);

// Optional parameters
app.MapGet("/products/{id?}", GetProducts);

// Constraints
app.MapGet("/products/{id:int}", GetProduct);
app.MapGet("/users/{id:guid}", GetUser);
app.MapGet("/archive/{year:int:range(2000,2100)}", GetArchive);

// Catch-all
app.MapGet("/files/{**path}", GetFile);
```

**Route constraints:**
```csharp
{id:int}           // Integer
{id:guid}          // GUID
{name:alpha}       // Letters only
{age:range(18,120)} // Range
{name:minlength(3)} // Min length
{name:maxlength(50)} // Max length
{name:regex(^[a-z]+$)} // Regex
```

**Route groups:**
```csharp
var api = app.MapGroup("/api");
var v1 = api.MapGroup("/v1");

v1.MapGet("/products", GetProducts);    // /api/v1/products
v1.MapGet("/orders", GetOrders);        // /api/v1/orders

// Apply filters to group
var admin = api.MapGroup("/admin")
    .RequireAuthorization("AdminOnly");
```

**Generating URLs:**
```csharp
app.MapGet("/products/{id}", GetProduct).WithName("GetProduct");

// Generate URL
var url = linkGenerator.GetPathByName("GetProduct", new { id = 123 });
// Returns: /products/123
```

**Related:**
- [[Routing]] - routing basics
- [[Minimal-APIs]] - endpoint definition
- [[Controllers]] - MVC routing

