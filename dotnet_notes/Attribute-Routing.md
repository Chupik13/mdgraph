**Tags**: #aspnet #routing #controllers
**Links**: [[Routing]], [[Controllers]], [[Minimal-APIs]]

---

### Attribute Routing

Attribute routing defines routes directly on controllers and actions using attributes.

**Basic patterns:**
```csharp
[ApiController]
[Route("api/[controller]")]  // api/users
public class UsersController : ControllerBase
{
    [HttpGet]                       // GET api/users
    [HttpGet("{id}")]               // GET api/users/5
    [HttpGet("active")]             // GET api/users/active
    [HttpPost]                      // POST api/users
    [HttpPut("{id}")]               // PUT api/users/5
    [HttpDelete("{id}")]            // DELETE api/users/5
}
```

**Route tokens:**
```csharp
[Route("api/[controller]")]  // Controller name without "Controller" suffix
[Route("api/[action]")]      // Action method name

// Combined
[Route("api/[controller]/[action]")]  // api/users/getactive
```

**Multiple routes:**
```csharp
[HttpGet]
[HttpGet("all")]
[HttpGet("list")]
public ActionResult<List<User>> GetUsers()
```

**Route constraints:**
```csharp
[HttpGet("{id:int}")]           // Only integers
[HttpGet("{name:alpha}")]       // Only letters
[HttpGet("{id:min(1)}")]        // Minimum value
[HttpGet("{slug:regex(^[a-z]+$)}")]  // Regex pattern
[HttpGet("{id:guid}")]          // GUID format

// Combined
[HttpGet("{id:int:min(1):max(100)}")]
```

**Area routing:**
```csharp
[Area("Admin")]
[Route("[area]/[controller]")]  // admin/users
public class UsersController : ControllerBase
```

**Custom route template:**
```csharp
[Route("api/v{version:apiVersion}/[controller]")]
public class ProductsController : ControllerBase
{
    [HttpGet("{category}/{id}")]  // api/v1/products/electronics/123
    public ActionResult Get(string category, int id)
}
```

**Related:**
- [[Routing]] - routing fundamentals
- [[Controllers]] - controller design
- [[Route-Constraints]] - parameter validation
