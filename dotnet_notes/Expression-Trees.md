**Tags**: #csharp #advanced #linq
**Links**: [[IQueryable]], [[LINQ]], [[Specification-Pattern]], [[Dynamic-Queries]]

---

### Expression Trees

Expression trees represent code as data structures that can be examined, modified, and compiled at runtime.

**Lambda vs Expression:**
```csharp
// Lambda - compiled to delegate
Func<int, bool> isEven = x => x % 2 == 0;

// Expression - compiled to tree
Expression<Func<int, bool>> isEvenExpr = x => x % 2 == 0;
```

**Building expressions manually:**
```csharp
var param = Expression.Parameter(typeof(int), "x");
var body = Expression.Equal(
    Expression.Modulo(param, Expression.Constant(2)),
    Expression.Constant(0)
);
var lambda = Expression.Lambda<Func<int, bool>>(body, param);
var compiled = lambda.Compile();
```

**Use cases:**
- [[IQueryable]] providers (EF, MongoDB)
- [[Specification-Pattern]] - reusable queries
- [[Dynamic-Queries]] - runtime query building
- ORM query translation
- Serializable queries

**Examining expressions:**
```csharp
Expression<Func<User, bool>> expr = u => u.Age > 18;
var binary = (BinaryExpression)expr.Body;
var left = (MemberExpression)binary.Left;   // u.Age
var right = (ConstantExpression)binary.Right; // 18
```

**Performance note:**
Compiling expressions is expensive. Cache compiled delegates when possible.

**Related:**
- [[IQueryable]] - primary use case
- [[Specification-Pattern]] - query encapsulation
- [[Dynamic-Queries]] - runtime query building
