**Tags**: #csharp #generics #advanced
**Links**: [[Generics]], [[Generic-Constraints]], [[Interface-Design]]

---

### Covariance and Contravariance

Variance determines how generic types relate to their type parameters' inheritance. Essential for flexible generic interfaces.

**Covariance (out) - output positions:**
```csharp
// IEnumerable<out T> is covariant
IEnumerable<string> strings = new List<string>();
IEnumerable<object> objects = strings;  // OK - string derives from object

// Covariance allows assigning more derived to less derived
interface IProducer<out T>
{
    T Produce();  // T only in output positions
}
```

**Contravariance (in) - input positions:**
```csharp
// Action<in T> is contravariant
Action<object> objectAction = obj => Console.WriteLine(obj);
Action<string> stringAction = objectAction;  // OK - reversed!

// Contravariance allows assigning less derived to more derived
interface IConsumer<in T>
{
    void Consume(T item);  // T only in input positions
}
```

**Practical example:**
```csharp
interface IComparer<in T>
{
    int Compare(T x, T y);
}

// Can use object comparer where string comparer expected
IComparer<object> objectComparer = ...;
IComparer<string> stringComparer = objectComparer;
```

**Common covariant interfaces:**
- `IEnumerable<out T>`
- `IReadOnlyList<out T>`
- `IReadOnlyCollection<out T>`
- `Func<out TResult>`

**Common contravariant interfaces:**
- `Action<in T>`
- `IComparer<in T>`
- `IEqualityComparer<in T>`
- `Predicate<in T>`

**Creating variant interfaces:**
```csharp
public interface IRepository<out T> where T : class
{
    T GetById(int id);        // Covariant - T in return
    IEnumerable<T> GetAll();  // Covariant - T in return
}

public interface IHandler<in TRequest>
{
    void Handle(TRequest request);  // Contravariant - T in parameter
}
```

**Related:**
- [[Generics]] - generic fundamentals
- [[Interface-Design]] - designing interfaces
- [[LINQ]] - uses covariance
