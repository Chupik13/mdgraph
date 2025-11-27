**Tags**: #csharp #fundamentals #functional
**Links**: [[Events]], [[Lambda-Expressions]], [[Action-Func]], [[Multicast-Delegates]]

---

### Delegates

Delegates are type-safe function pointers. They define a method signature that compatible methods can match.

**Defining delegates:**
```csharp
// Custom delegate
public delegate int Calculator(int x, int y);

// Using delegate
Calculator add = (x, y) => x + y;
Calculator multiply = (x, y) => x * y;

int result = add(5, 3);  // 8
```

**Built-in delegates:** See [[Action-Func]]
```csharp
Func<int, int, int> add = (x, y) => x + y;  // Returns value
Action<string> print = msg => Console.WriteLine(msg);  // No return
Predicate<int> isPositive = x => x > 0;  // Returns bool
```

**Multicast delegates:**
```csharp
Action<string> log = Console.WriteLine;
log += msg => File.AppendAllText("log.txt", msg);
log += msg => Debug.WriteLine(msg);

log("Hello");  // Calls all three
```

**Use cases:**
- Callbacks and event handlers
- [[Strategy-Pattern]] implementation
- LINQ operations
- Asynchronous programming

**Delegate vs Interface:**
- Delegate: single method, can be lambda
- Interface: multiple methods, more structure

**Related:**
- [[Events]] - delegate-based pub/sub
- [[Lambda-Expressions]] - anonymous delegates
- [[Action-Func]] - built-in delegates
