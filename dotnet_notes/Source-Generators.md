**Tags**: #csharp #advanced #metaprogramming
**Links**: [[Reflection]], [[JSON-Serialization]], [[Performance-Best-Practices]]

---

### Source Generators

Source generators produce C# code at compile time. Eliminate reflection overhead and enable compile-time validation.

**Use cases in .NET:**
- System.Text.Json source generation
- Regex source generation
- Logging source generation
- Dependency injection

**JSON source generator:**
```csharp
[JsonSerializable(typeof(Person))]
[JsonSerializable(typeof(List<Person>))]
public partial class AppJsonContext : JsonSerializerContext { }

// Usage - no reflection!
var json = JsonSerializer.Serialize(person, AppJsonContext.Default.Person);
var obj = JsonSerializer.Deserialize<Person>(json, AppJsonContext.Default.Person);
```

**Regex source generator:**
```csharp
public partial class Validators
{
    [GeneratedRegex(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")]
    public static partial Regex EmailRegex();
}

// Usage - compiled at build time
bool isValid = Validators.EmailRegex().IsMatch(email);
```

**Logging source generator:**
```csharp
public static partial class Log
{
    [LoggerMessage(Level = LogLevel.Information, Message = "Processing order {OrderId}")]
    public static partial void ProcessingOrder(ILogger logger, int orderId);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to process order {OrderId}")]
    public static partial void FailedToProcess(ILogger logger, int orderId, Exception ex);
}

// Usage - high-performance, structured
Log.ProcessingOrder(_logger, order.Id);
```

**Benefits:**
- Zero reflection at runtime
- AOT compatible
- Compile-time errors
- Better performance
- Reduced application size

**Creating source generators:**
```csharp
[Generator]
public class MyGenerator : ISourceGenerator
{
    public void Initialize(GeneratorInitializationContext context) { }

    public void Execute(GeneratorExecutionContext context)
    {
        var source = @"
            public static class Generated
            {
                public static string Hello() => ""World"";
            }";
        context.AddSource("Generated.g.cs", source);
    }
}
```

**Related:**
- [[Reflection]] - runtime alternative
- [[JSON-Serialization]] - JSON generator
- [[AOT-Compilation]] - native compilation
