**Tags**: #performance #deployment #advanced
**Links**: [[Source-Generators]], [[Trimming]], [[Native-AOT]]

---

### AOT Compilation

Ahead-of-Time (AOT) compilation produces native code at build time, eliminating JIT compilation at runtime. Enables faster startup and smaller footprint.

**Enable Native AOT:**
```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <PublishAot>true</PublishAot>
  </PropertyGroup>
</Project>
```

**Publish native binary:**
```bash
dotnet publish -c Release -r win-x64
```

**AOT-compatible code:**
```csharp
// GOOD - AOT-friendly
[JsonSerializable(typeof(Person))]
public partial class AppJsonContext : JsonSerializerContext { }

var json = JsonSerializer.Serialize(person, AppJsonContext.Default.Person);

// BAD - requires reflection (not AOT-compatible)
var json = JsonSerializer.Serialize(person);

// GOOD - source-generated regex
[GeneratedRegex(@"\d+")]
private static partial Regex NumberRegex();

// BAD - runtime-compiled regex
var regex = new Regex(@"\d+"); // Reflection-based
```

**Trimming warnings:**
```csharp
// Suppress warning when you know reflection is safe
[DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.All)]
public Type MyType { get; set; }

// Preserve types for reflection
[DynamicDependency(DynamicallyAccessedMemberTypes.All, typeof(MyType))]
public void UseReflection() { }
```

**Benefits:**
- Fast startup (no JIT)
- Smaller deployment size
- Better security (no IL to decompile)
- Lower memory usage

**Limitations:**
- No dynamic code generation
- Limited reflection
- Platform-specific binaries

**Related:**
- [[Source-Generators]] - compile-time code gen
- [[Trimming]] - removing unused code
- [[Native-AOT]] - native compilation

