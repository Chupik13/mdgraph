**Tags**: #csharp #linq #fundamentals
**Links**: [[IEnumerable]], [[IQueryable]], [[Expression-Trees]], [[PLINQ]], [[EF-Query-Optimization]]

---

### LINQ (Language Integrated Query)

LINQ provides a unified query syntax for collections, databases, XML, and more. Two syntaxes: query and method.

**Query syntax:**
```csharp
var adults = from p in people
             where p.Age >= 18
             orderby p.Name
             select new { p.Name, p.Age };
```

**Method syntax:**
```csharp
var adults = people
    .Where(p => p.Age >= 18)
    .OrderBy(p => p.Name)
    .Select(p => new { p.Name, p.Age });
```

**Key operators:**
- Filtering: `Where`, `OfType`
- Projection: `Select`, `SelectMany`
- Ordering: `OrderBy`, `ThenBy`, `Reverse`
- Grouping: `GroupBy`, `ToLookup`
- Aggregation: `Count`, `Sum`, `Average`, `Aggregate`
- Set: `Distinct`, `Union`, `Intersect`, `Except`
- Element: `First`, `Single`, `ElementAt`

**Deferred execution:**
LINQ queries are lazy - they execute when iterated:
```csharp
var query = items.Where(x => x > 5); // No execution yet
var list = query.ToList(); // Executes here
```

**IEnumerable vs IQueryable:**
- [[IEnumerable]] - in-memory, delegates
- [[IQueryable]] - translatable, [[Expression-Trees]]

**Related:**
- [[PLINQ]] - parallel LINQ
- [[EF-Query-Optimization]] - database queries
- [[Expression-Trees]] - query translation
