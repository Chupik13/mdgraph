**Tags**: #csharp #metadata #fundamentals
**Links**: [[Reflection]], [[Data-Annotations]], [[Custom-Attributes]]

---

### Attributes

Attributes add metadata to code elements. Used by frameworks, serialization, validation, and custom processing.

**Common built-in attributes:**
```csharp
[Obsolete("Use NewMethod instead", error: true)]
public void OldMethod() { }

[Serializable]
public class SerializableData { }

[DebuggerDisplay("{Name} ({Age})")]
public class Person
{
    public string Name { get; set; }
    public int Age { get; set; }
}

[Conditional("DEBUG")]
public static void DebugLog(string message) { }
```

**Data annotations:**
```csharp
public class CreateUserRequest
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; }

    [EmailAddress]
    public string Email { get; set; }

    [Range(18, 120)]
    public int Age { get; set; }
}
```

**Custom attribute:**
```csharp
[AttributeUsage(AttributeTargets.Method, AllowMultiple = false)]
public class AuditAttribute : Attribute
{
    public string Action { get; }

    public AuditAttribute(string action)
    {
        Action = action;
    }
}

// Usage
[Audit("CreateOrder")]
public async Task CreateOrderAsync(Order order) { }

// Reading attribute
var method = typeof(OrderService).GetMethod("CreateOrderAsync");
var audit = method?.GetCustomAttribute<AuditAttribute>();
Console.WriteLine(audit?.Action); // "CreateOrder"
```

**Attribute targets:**
```csharp
[assembly: AssemblyVersion("1.0.0.0")]
[module: SuppressMessage("...", "...")]

[return: NotNull]
public string GetName() => "";
```

**Related:**
- [[Reflection]] - reading attributes
- [[Data-Annotations]] - validation attributes
- [[Source-Generators]] - compile-time attribute processing

