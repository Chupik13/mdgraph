**Tags**: #aspnet #web #fundamentals
**Links**: [[Controllers]], [[Minimal-APIs]], [[Route-Constraints]], [[Endpoint-Routing]]

---

### Routing

Routing matches incoming HTTP requests to endpoints. ASP.NET Core uses endpoint routing.

**Attribute routing:**
```csharp
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    [HttpGet]                           // GET /api/products
    [HttpGet("{id}")]                   // GET /api/products/5
    [HttpGet("category/{category}")]    // GET /api/products/category/electronics
    [HttpPost]                          // POST /api/products
}
```

**Route parameters:**
```csharp
[HttpGet("{id}")]
public ActionResult<Product> Get(int id)

[HttpGet("{category}/{id}")]
public ActionResult<Product> Get(string category, int id)

// Catch-all
[HttpGet("{**path}")]
public ActionResult Get(string path)
```

**Route constraints:** See [[Route-Constraints]]
```csharp
[HttpGet("{id:int}")]           // Must be integer
[HttpGet("{name:alpha}")]       // Letters only
[HttpGet("{id:min(1)}")]        // Minimum value
[HttpGet("{slug:regex(^[a-z]+$)}")]  // Custom regex
```

**Minimal API routing:**
```csharp
app.MapGet("/users/{id:int}", (int id) => ...);
app.MapGet("/search", (string? q, int page = 1) => ...);
```

**Route precedence:**
1. Literal segments: `/products/featured`
2. Parameter with constraints: `{id:int}`
3. Parameter without constraints: `{id}`
4. Catch-all: `{**path}`

**Related:**
- [[Route-Constraints]] - parameter constraints
- [[Endpoint-Routing]] - how routing works
- [[Model-Binding]] - request data binding
