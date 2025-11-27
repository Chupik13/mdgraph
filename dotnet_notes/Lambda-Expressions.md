**Tags**: #csharp #functional #linq
**Links**: [[Delegates]], [[LINQ]], [[Expression-Trees]], [[Closures]]

---

### Lambda Expressions

Lambda expressions are anonymous functions with concise syntax. They can be used anywhere a delegate or expression tree is expected.

**Syntax evolution:**
```csharp
// Full syntax
Func<int, int, int> add1 = (int x, int y) => { return x + y; };

// Type inference
Func<int, int, int> add2 = (x, y) => { return x + y; };

// Expression body
Func<int, int, int> add3 = (x, y) => x + y;

// Single parameter
Func<int, int> square = x => x * x;
```

**With LINQ:**
```csharp
var adults = people
    .Where(p => p.Age >= 18)
    .Select(p => new { p.Name, p.Email })
    .OrderBy(p => p.Name);
```

**Closures:** See [[Closures]]
Lambdas can capture variables from outer scope:
```csharp
int factor = 10;
Func<int, int> multiply = x => x * factor;
```

**Statement lambdas:**
```csharp
Func<int, int> compute = x =>
{
    var temp = x * 2;
    Console.WriteLine($"Computing: {temp}");
    return temp + 1;
};
```

**Lambda vs Expression:** See [[Expression-Trees]]
```csharp
Func<int, bool> func = x => x > 5;           // Compiled code
Expression<Func<int, bool>> expr = x => x > 5; // Data structure
```

**Related:**
- [[Closures]] - variable capture
- [[Expression-Trees]] - expression representation
- [[Local-Functions]] - alternative syntax
