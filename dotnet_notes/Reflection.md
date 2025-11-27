**Tags**: #csharp #advanced #metaprogramming
**Links**: [[Source-Generators]], [[Attributes]], [[Performance-Best-Practices]]

---

### Reflection

Reflection allows inspecting and manipulating types, methods, and properties at runtime. Powerful but has performance cost.

**Get type information:**
```csharp
Type type = typeof(Person);
// or
Type type = person.GetType();

// Properties
foreach (var prop in type.GetProperties())
{
    Console.WriteLine($"{prop.Name}: {prop.PropertyType}");
}

// Methods
foreach (var method in type.GetMethods(BindingFlags.Public | BindingFlags.Instance))
{
    Console.WriteLine(method.Name);
}
```

**Create instance:**
```csharp
// With Activator
var instance = Activator.CreateInstance(type);
var instanceWithArgs = Activator.CreateInstance(type, "arg1", 42);

// Generic
var list = Activator.CreateInstance(typeof(List<>).MakeGenericType(typeof(string)));
```

**Invoke methods:**
```csharp
var method = type.GetMethod("ProcessOrder");
var result = method?.Invoke(instance, new object[] { orderId });

// Faster with delegate caching
var processOrder = (Func<int, bool>)Delegate.CreateDelegate(
    typeof(Func<int, bool>),
    instance,
    method!);
```

**Read/write properties:**
```csharp
var property = type.GetProperty("Name");
var value = property?.GetValue(instance);
property?.SetValue(instance, "New Name");
```

**Performance considerations:**
```csharp
// SLOW - reflection on every call
foreach (var item in items)
{
    var prop = item.GetType().GetProperty("Id");
    var id = prop.GetValue(item);
}

// FASTER - cache PropertyInfo
var prop = typeof(Item).GetProperty("Id");
foreach (var item in items)
{
    var id = prop.GetValue(item);
}

// FASTEST - compiled expression or source generator
```

**Related:**
- [[Source-Generators]] - compile-time alternative
- [[Attributes]] - metadata for reflection
- [[Expression-Trees]] - compiled reflection

