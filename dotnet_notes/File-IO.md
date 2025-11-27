**Tags**: #csharp #io #fundamentals
**Links**: [[async-await]], [[Streaming-APIs]], [[Span-T]]

---

### File I/O

.NET provides multiple ways to read and write files, from simple one-liners to high-performance streaming.

**Simple operations:**
```csharp
// Read all text
string content = File.ReadAllText("file.txt");
string[] lines = File.ReadAllLines("file.txt");
byte[] bytes = File.ReadAllBytes("file.bin");

// Write all text
File.WriteAllText("file.txt", "Hello World");
File.WriteAllLines("file.txt", new[] { "line1", "line2" });
File.WriteAllBytes("file.bin", bytes);

// Append
File.AppendAllText("log.txt", "New entry\n");
```

**Async operations:**
```csharp
string content = await File.ReadAllTextAsync("file.txt");
await File.WriteAllTextAsync("file.txt", content);

// With cancellation
var cts = new CancellationTokenSource();
await File.ReadAllTextAsync("file.txt", cts.Token);
```

**Streaming (for large files):**
```csharp
// Reading
await using var reader = new StreamReader("large.txt");
while (await reader.ReadLineAsync() is string line)
{
    ProcessLine(line);
}

// Writing
await using var writer = new StreamWriter("output.txt");
await writer.WriteLineAsync("Hello");

// Binary
await using var stream = File.OpenRead("data.bin");
var buffer = new byte[4096];
int bytesRead;
while ((bytesRead = await stream.ReadAsync(buffer)) > 0)
{
    ProcessChunk(buffer.AsSpan(0, bytesRead));
}
```

**File info:**
```csharp
var file = new FileInfo("file.txt");
bool exists = file.Exists;
long size = file.Length;
DateTime modified = file.LastWriteTime;
```

**Directory operations:**
```csharp
Directory.CreateDirectory("path/to/folder");
string[] files = Directory.GetFiles("folder", "*.txt");
IEnumerable<string> allFiles = Directory.EnumerateFiles("folder", "*", SearchOption.AllDirectories);
```

**Path manipulation:**
```csharp
string combined = Path.Combine("folder", "subfolder", "file.txt");
string fileName = Path.GetFileName(path);
string extension = Path.GetExtension(path);
string directory = Path.GetDirectoryName(path);
```

**Related:**
- [[Streaming-APIs]] - efficient I/O
- [[Span-T]] - buffer operations
- [[async-await]] - async file I/O
