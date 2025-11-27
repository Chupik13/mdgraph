**Tags**: #csharp #interfaces #modern
**Links**: [[Interface-Design]], [[Extension-Methods]], [[Generics]]

---

### Default Interface Methods (C# 8+)

Default interface methods allow adding methods with implementations to interfaces without breaking existing implementations.

**Basic usage:**
```csharp
public interface ILogger
{
    void Log(string message);

    // Default implementation
    void LogError(string message) => Log($"ERROR: {message}");
    void LogWarning(string message) => Log($"WARNING: {message}");
    void LogInfo(string message) => Log($"INFO: {message}");
}

// Implementation only needs Log()
public class ConsoleLogger : ILogger
{
    public void Log(string message) => Console.WriteLine(message);
    // Gets LogError, LogWarning, LogInfo for free
}
```

**Overriding defaults:**
```csharp
public class FileLogger : ILogger
{
    public void Log(string message) => File.AppendAllText("log.txt", message);

    // Custom implementation
    public void LogError(string message)
    {
        Log($"[{DateTime.Now:HH:mm:ss}] ERROR: {message}");
        // Also notify monitoring
    }
}
```

**Static members:**
```csharp
public interface IParser<T>
{
    static abstract T Parse(string input);
    static virtual bool TryParse(string input, out T? result)
    {
        try
        {
            result = T.Parse(input);
            return true;
        }
        catch
        {
            result = default;
            return false;
        }
    }
}
```

**Use cases:**
- Evolving interfaces without breaking changes
- Providing common utility methods
- Traits/mixins pattern
- Library versioning

**Limitations:**
- Cannot access instance state (no fields)
- Class doesn't inherit defaults (interface must be used)
- Diamond problem considerations

**Accessing via interface:**
```csharp
ILogger logger = new ConsoleLogger();
logger.LogError("Something failed");  // Uses default

ConsoleLogger console = new ConsoleLogger();
// console.LogError();  // Not available - must cast to ILogger
((ILogger)console).LogError("...");
```

**Related:**
- [[Extension-Methods]] - alternative approach
- [[Interface-Design]] - interface patterns
- [[Static-Abstract-Members]] - C# 11 feature
