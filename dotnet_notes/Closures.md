**Tags**: #csharp #functional #advanced
**Links**: [[Lambda-Expressions]], [[Delegates]], [[Memory-Leaks]], [[Captured-Variables]]

---

### Closures

A closure is a function that captures variables from its enclosing scope. The captured variables live as long as the closure.

**Variable capture:**
```csharp
int multiplier = 10;
Func<int, int> multiply = x => x * multiplier;  // Captures 'multiplier'

Console.WriteLine(multiply(5));  // 50

multiplier = 20;
Console.WriteLine(multiply(5));  // 100 - uses current value!
```

**Loop capture pitfall:**
```csharp
// WRONG - all actions capture same variable
var actions = new List<Action>();
for (int i = 0; i < 5; i++)
{
    actions.Add(() => Console.WriteLine(i));
}
actions.ForEach(a => a());  // Prints: 5 5 5 5 5

// CORRECT - capture copy
for (int i = 0; i < 5; i++)
{
    int copy = i;
    actions.Add(() => Console.WriteLine(copy));
}
// Prints: 0 1 2 3 4
```

**How it works:**
Compiler generates a class to hold captured variables:
```csharp
// Your code
int x = 10;
Func<int> getX = () => x;

// Compiler generates (simplified)
class DisplayClass
{
    public int x;
    public int GetX() => x;
}
```

**Memory implications:**
- Captured variables extend lifetime
- Can cause memory leaks if closure lives long
- Be careful with `this` capture in event handlers

**Avoiding leaks:**
```csharp
// BAD - captures 'this', keeps object alive
button.Click += (s, e) => this.HandleClick();

// BETTER - weak reference or explicit unsubscribe
var handler = new WeakEventHandler<Button>(this.HandleClick);
```

**Related:**
- [[Lambda-Expressions]] - closure syntax
- [[Memory-Leaks]] - avoiding leaks
- [[Events]] - event handler capture
