**Tags**: #csharp #linq #ef
**Links**: [[LINQ]], [[IEnumerable]], [[Expression-Trees]], [[Entity-Framework]], [[EF-Query-Optimization]]

---

### IQueryable<T>

`IQueryable<T>` represents a query that can be translated to another format (SQL, API calls, etc.) using [[Expression-Trees]].

**Key difference from IEnumerable:**
```csharp
// IEnumerable - filtering in memory
IEnumerable<User> users = dbContext.Users.ToList();
var filtered = users.Where(u => u.Age > 18); // In-memory

// IQueryable - filtering in database
IQueryable<User> users = dbContext.Users;
var filtered = users.Where(u => u.Age > 18); // SQL: WHERE Age > 18
```

**How it works:**
- Queries stored as [[Expression-Trees]]
- Provider translates expression to target language
- Execution deferred until enumeration

**Common providers:**
- [[Entity-Framework]] - SQL databases
- MongoDB driver - MongoDB queries
- OData - REST API queries

**Best practices:**
- Keep queries as IQueryable as long as possible
- Call `ToList()` / `ToArray()` at the last moment
- Use `AsNoTracking()` for read-only queries
- See [[EF-Query-Optimization]] for performance

**Composition:**
```csharp
IQueryable<Product> query = dbContext.Products;

if (categoryId.HasValue)
    query = query.Where(p => p.CategoryId == categoryId);

if (!string.IsNullOrEmpty(search))
    query = query.Where(p => p.Name.Contains(search));

return await query.ToListAsync();
```

**Related:**
- [[Expression-Trees]] - how queries are represented
- [[EF-Query-Optimization]] - performance tips
- [[Specification-Pattern]] - reusable query logic
