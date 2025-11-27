**Tags**: #csharp #fundamentals #performance
**Links**: [[String-Manipulation]], [[Logging]], [[Performance-Best-Practices]]

---

### String Interpolation

String interpolation embeds expressions in strings using `$""` syntax. More readable than concatenation or String.Format.

**Basic usage:**
```csharp
var name = "Alice";
var age = 30;

// Interpolation
var message = $"Hello, {name}! You are {age} years old.";

// Equivalent to
var message = string.Format("Hello, {0}! You are {1} years old.", name, age);
```

**Formatting:**
```csharp
decimal price = 19.99m;
DateTime date = DateTime.Now;

$"Price: {price:C}"           // Price: $19.99
$"Price: {price:F2}"          // Price: 19.99
$"Date: {date:yyyy-MM-dd}"    // Date: 2024-01-15
$"Time: {date:HH:mm:ss}"      // Time: 14:30:00
$"Percent: {0.156:P1}"        // Percent: 15.6%
$"Padded: {42,10}"            // Padded:         42
$"Left: {42,-10}|"            // Left: 42        |
```

**Raw strings (C# 11):**
```csharp
var json = $$"""
{
    "name": "{{name}}",
    "age": {{age}}
}
""";
```

**Performance (C# 10+):**
```csharp
// Interpolated string handler - no allocation if logging disabled
logger.LogInformation($"Processing {count} items");

// Custom handler
public void Log([InterpolatedStringHandlerArgument("")]
    LogInterpolatedStringHandler handler) { ... }
```

**With verbatim strings:**
```csharp
var path = $@"C:\Users\{username}\Documents";
// or
var path = @$"C:\Users\{username}\Documents";
```

**Common patterns:**
```csharp
// ToString override
public override string ToString() => $"{FirstName} {LastName}";

// Building SQL (use parameters!)
var query = $"SELECT * FROM Users WHERE Id = @id";  // Safe
// var query = $"SELECT * FROM Users WHERE Id = {id}";  // SQL injection!
```

**Related:**
- [[Logging]] - structured logging (don't use interpolation!)
- [[String-Manipulation]] - string operations
- [[Span-T]] - efficient string building
