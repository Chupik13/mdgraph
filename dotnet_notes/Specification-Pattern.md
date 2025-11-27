**Tags**: #ddd #patterns #data
**Links**: [[Repository-Pattern]], [[Expression-Trees]], [[IQueryable]], [[Clean-Architecture]]

---

### Specification Pattern

Specification encapsulates query logic into reusable, composable objects. Useful for complex filtering.

**Interface:**
```csharp
public interface ISpecification<T>
{
    Expression<Func<T, bool>> Criteria { get; }
    List<Expression<Func<T, object>>> Includes { get; }
    Expression<Func<T, object>>? OrderBy { get; }
    Expression<Func<T, object>>? OrderByDescending { get; }
    int? Take { get; }
    int? Skip { get; }
}
```

**Base class:**
```csharp
public abstract class Specification<T> : ISpecification<T>
{
    public Expression<Func<T, bool>> Criteria { get; protected set; } = _ => true;
    public List<Expression<Func<T, object>>> Includes { get; } = new();
    public Expression<Func<T, object>>? OrderBy { get; protected set; }
    public Expression<Func<T, object>>? OrderByDescending { get; protected set; }
    public int? Take { get; protected set; }
    public int? Skip { get; protected set; }

    protected void AddInclude(Expression<Func<T, object>> include) =>
        Includes.Add(include);
}
```

**Concrete specifications:**
```csharp
public class ActiveUsersSpec : Specification<User>
{
    public ActiveUsersSpec()
    {
        Criteria = u => u.IsActive && !u.IsDeleted;
        OrderBy = u => u.Name;
    }
}

public class UsersByRoleSpec : Specification<User>
{
    public UsersByRoleSpec(string role, int page, int pageSize)
    {
        Criteria = u => u.Role == role && u.IsActive;
        AddInclude(u => u.Orders);
        OrderByDescending = u => u.CreatedAt;
        Skip = (page - 1) * pageSize;
        Take = pageSize;
    }
}
```

**Repository usage:**
```csharp
public async Task<List<T>> ListAsync(ISpecification<T> spec)
{
    var query = _context.Set<T>().AsQueryable();

    query = query.Where(spec.Criteria);

    foreach (var include in spec.Includes)
        query = query.Include(include);

    if (spec.OrderBy != null)
        query = query.OrderBy(spec.OrderBy);

    if (spec.Skip.HasValue)
        query = query.Skip(spec.Skip.Value);

    if (spec.Take.HasValue)
        query = query.Take(spec.Take.Value);

    return await query.ToListAsync();
}
```

**Related:**
- [[Repository-Pattern]] - data access
- [[Expression-Trees]] - query representation
- [[IQueryable]] - composable queries
