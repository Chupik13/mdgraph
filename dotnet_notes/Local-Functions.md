**Tags**: #csharp #modern #syntax
**Links**: [[Lambda-Expressions]], [[Closures]], [[Recursion]]

---

### Local Functions

Local functions are methods defined inside other methods. Useful for helper logic that's only relevant locally.

**Basic syntax:**
```csharp
public int Calculate(int[] numbers)
{
    return SumPositive(numbers);

    // Local function
    int SumPositive(int[] nums)
    {
        int sum = 0;
        foreach (var n in nums)
            if (n > 0) sum += n;
        return sum;
    }
}
```

**Static local functions:**
```csharp
public void Process(string input)
{
    var result = Transform(input);

    // Static - cannot capture variables
    static string Transform(string s) => s.ToUpper().Trim();
}
```

**Recursion:**
```csharp
public int Factorial(int n)
{
    return Fact(n);

    int Fact(int x) => x <= 1 ? 1 : x * Fact(x - 1);
}
```

**Iterator local functions:**
```csharp
public IEnumerable<int> GetEvenNumbers(int[] numbers)
{
    // Validation happens immediately
    if (numbers == null) throw new ArgumentNullException(nameof(numbers));

    return GetEvens();

    // Iteration is deferred
    IEnumerable<int> GetEvens()
    {
        foreach (var n in numbers)
            if (n % 2 == 0)
                yield return n;
    }
}
```

**Local vs Lambda:**
| Local Function | Lambda |
|----------------|--------|
| Named | Anonymous |
| Can be recursive | Recursive is verbose |
| Can be generic | Cannot be generic |
| Can use `ref`/`out` | Limited support |
| Static option | Cannot be static |

**When to use:**
- Helper logic used only once
- Recursion within method
- Separating validation from iteration
- Avoiding closure allocations (static)

**Related:**
- [[Lambda-Expressions]] - anonymous functions
- [[Closures]] - variable capture
- [[yield-return]] - iterators
