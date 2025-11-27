**Tags**: #deployment #performance #advanced
**Links**: [[AOT-Compilation]], [[Source-Generators]], [[Self-Contained-Deployment]]

---

### Trimming

Trimming removes unused code from published applications, reducing deployment size significantly.

**Enable trimming:**
```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <PublishTrimmed>true</PublishTrimmed>
    <TrimMode>link</TrimMode>  <!-- or 'copyused' for less aggressive -->
  </PropertyGroup>
</Project>
```

**Trim warnings:**
```csharp
// Warning: Type.GetType may fail after trimming
var type = Type.GetType(typeName);  // IL2057

// Fix: Preserve the type
[DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.All)]
public Type MyType { get; set; }
```

**Preserve assemblies/types:**
```xml
<!-- In .csproj -->
<ItemGroup>
  <TrimmerRootAssembly Include="MyPlugin" />
</ItemGroup>
```

**Root descriptor file:**
```xml
<!-- ILLink.Descriptors.xml -->
<linker>
  <assembly fullname="MyAssembly">
    <type fullname="MyNamespace.MyType" preserve="all" />
  </assembly>
</linker>
```

**Trim-compatible patterns:**
```csharp
// BAD - reflection on unknown type
var instance = Activator.CreateInstance(Type.GetType(typeName));

// GOOD - known type at compile time
var instance = Activator.CreateInstance<KnownType>();

// BAD - dynamic JSON deserialization
var obj = JsonSerializer.Deserialize<T>(json);

// GOOD - source-generated
var obj = JsonSerializer.Deserialize(json, AppJsonContext.Default.MyType);
```

**Analyze trim compatibility:**
```bash
dotnet publish -c Release -p:PublishTrimmed=true --warnaserror
```

**Related:**
- [[AOT-Compilation]] - native compilation
- [[Source-Generators]] - trim-safe code gen
- [[Self-Contained-Deployment]] - deployment options

