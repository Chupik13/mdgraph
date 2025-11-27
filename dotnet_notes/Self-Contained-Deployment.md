**Tags**: #deployment #dotnet #fundamentals
**Links**: [[Trimming]], [[AOT-Compilation]], [[Docker]]

---

### Self-Contained Deployment

Self-contained deployment includes the .NET runtime with your application. No .NET installation required on target machine.

**Publish self-contained:**
```bash
# Framework-dependent (requires .NET on target)
dotnet publish -c Release

# Self-contained for specific platform
dotnet publish -c Release -r win-x64 --self-contained

# Single file
dotnet publish -c Release -r win-x64 --self-contained -p:PublishSingleFile=true
```

**Project configuration:**
```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <RuntimeIdentifier>win-x64</RuntimeIdentifier>
    <SelfContained>true</SelfContained>
    <PublishSingleFile>true</PublishSingleFile>
    <PublishTrimmed>true</PublishTrimmed>
    <EnableCompressionInSingleFile>true</EnableCompressionInSingleFile>
  </PropertyGroup>
</Project>
```

**Common runtime identifiers:**
```
win-x64, win-x86, win-arm64
linux-x64, linux-arm64
osx-x64, osx-arm64
```

**Size comparison:**
| Configuration | Approximate Size |
|--------------|------------------|
| Framework-dependent | ~1 MB |
| Self-contained | ~80 MB |
| Self-contained + trimmed | ~20 MB |
| Native AOT | ~10 MB |

**ReadyToRun (R2R):**
```xml
<!-- Pre-compile for faster startup -->
<PublishReadyToRun>true</PublishReadyToRun>
```

**When to use:**
- No control over target environment
- Deploying to containers
- Distributing desktop applications
- Edge/IoT deployments

**Related:**
- [[Trimming]] - reduce size
- [[AOT-Compilation]] - native compilation
- [[Docker]] - containerized deployment

