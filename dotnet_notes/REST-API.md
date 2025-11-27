**Tags**: #api #design #best-practices
**Links**: [[Controllers]], [[Minimal-APIs]], [[HTTP-Methods]]

---

### REST API Design

REST (Representational State Transfer) principles for designing clean, predictable APIs.

**Resource naming:**
```
GET    /api/users           - Get all users
GET    /api/users/123       - Get specific user
POST   /api/users           - Create user
PUT    /api/users/123       - Replace user
PATCH  /api/users/123       - Update user fields
DELETE /api/users/123       - Delete user

GET    /api/users/123/orders    - Get user's orders
POST   /api/users/123/orders    - Create order for user
```

**Response codes:**
```csharp
// Success
return Ok(data);           // 200 - Success with data
return Created(uri, data); // 201 - Resource created
return NoContent();        // 204 - Success, no content

// Client errors
return BadRequest(errors); // 400 - Invalid request
return Unauthorized();     // 401 - Not authenticated
return Forbid();           // 403 - Not authorized
return NotFound();         // 404 - Resource not found
return Conflict();         // 409 - State conflict

// Server errors
return StatusCode(500);    // 500 - Server error
```

**Pagination:**
```csharp
app.MapGet("/api/users", (int page = 1, int pageSize = 20) =>
{
    var users = _repository.GetPaged(page, pageSize);
    return Results.Ok(new
    {
        Data = users,
        Page = page,
        PageSize = pageSize,
        TotalCount = _repository.Count()
    });
});
```

**Filtering and sorting:**
```
GET /api/products?category=electronics&minPrice=100&sort=price:desc
```

**Related:**
- [[HTTP-Methods]] - GET, POST, PUT, DELETE
- [[Controllers]] - MVC controllers
- [[API-Versioning]] - versioning strategies

