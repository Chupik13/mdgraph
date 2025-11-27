**Tags**: #csharp #delegates #fundamentals
**Links**: [[Delegates]], [[Lambda-Expressions]], [[LINQ]], [[Predicate]]

---

### Action and Func Delegates

`Action` and `Func` are built-in generic delegates that cover most delegate scenarios without custom definitions.

**Action - no return value:**
```csharp
Action                     // () => void
Action<T>                  // (T) => void
Action<T1, T2>             // (T1, T2) => void
// Up to 16 parameters

Action<string> print = msg => Console.WriteLine(msg);
Action<int, int> add = (a, b) => Console.WriteLine(a + b);
```

**Func - with return value:**
```csharp
Func<TResult>              // () => TResult
Func<T, TResult>           // (T) => TResult
Func<T1, T2, TResult>      // (T1, T2) => TResult
// Up to 16 parameters + return

Func<int, int, int> add = (a, b) => a + b;
Func<string, bool> isEmpty = s => string.IsNullOrEmpty(s);
Func<DateTime> now = () => DateTime.UtcNow;
```

**Predicate - bool return:**
```csharp
Predicate<T> // (T) => bool - equivalent to Func<T, bool>

Predicate<int> isPositive = n => n > 0;
List<int> positives = numbers.FindAll(isPositive);
```

**Common LINQ usage:**
```csharp
// Where uses Func<T, bool>
items.Where(x => x.IsActive);

// Select uses Func<T, TResult>
items.Select(x => x.Name);

// ForEach uses Action<T>
items.ToList().ForEach(x => Console.WriteLine(x));
```

**As method parameters:**
```csharp
public void ProcessItems<T>(IEnumerable<T> items, Action<T> process)
{
    foreach (var item in items)
        process(item);
}

public TResult Transform<T, TResult>(T input, Func<T, TResult> transformer)
{
    return transformer(input);
}
```

**Comparison:**
| Type | Returns | Example |
|------|---------|---------|
| Action<T> | void | `x => Console.WriteLine(x)` |
| Func<T, R> | R | `x => x.ToString()` |
| Predicate<T> | bool | `x => x > 0` |

**Related:**
- [[Delegates]] - delegate fundamentals
- [[Lambda-Expressions]] - anonymous functions
- [[LINQ]] - uses Func extensively
