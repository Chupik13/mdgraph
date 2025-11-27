**Tags**: #performance #testing #tools
**Links**: [[Memory-Optimization]], [[Profiling]], [[Performance-Best-Practices]]

---

### BenchmarkDotNet

BenchmarkDotNet is the standard library for benchmarking .NET code. It handles warmup, multiple iterations, and statistical analysis.

**Basic benchmark:**
```csharp
[MemoryDiagnoser]
public class StringBenchmarks
{
    private readonly string[] _items = Enumerable.Range(0, 1000)
        .Select(i => i.ToString()).ToArray();

    [Benchmark(Baseline = true)]
    public string StringConcat()
    {
        string result = "";
        foreach (var item in _items)
            result += item;
        return result;
    }

    [Benchmark]
    public string StringBuilder()
    {
        var sb = new StringBuilder();
        foreach (var item in _items)
            sb.Append(item);
        return sb.ToString();
    }

    [Benchmark]
    public string StringJoin()
    {
        return string.Join("", _items);
    }
}

// Run
BenchmarkRunner.Run<StringBenchmarks>();
```

**Results:**
```
|        Method |       Mean |    Gen0 |  Allocated |
|-------------- |-----------:|--------:|-----------:|
|  StringConcat | 2,847.3 us | 500.000 | 1975.52 KB |
| StringBuilder |    14.2 us |   2.136 |    8.77 KB |
|    StringJoin |    11.8 us |   1.984 |    8.13 KB |
```

**Parameterized benchmarks:**
```csharp
[Params(100, 1000, 10000)]
public int N { get; set; }

[Benchmark]
public int Sum() => Enumerable.Range(0, N).Sum();
```

**Diagnosers:**
```csharp
[MemoryDiagnoser]        // Track allocations
[ThreadingDiagnoser]     // Thread contention
[ExceptionDiagnoser]     // Exception stats
```

**Best practices:**
- Run in Release mode
- Use MemoryDiagnoser for allocation tracking
- Baseline comparison for relative performance
- Multiple iterations for statistical significance

**Related:**
- [[Profiling]] - runtime analysis
- [[Memory-Optimization]] - allocation reduction
- [[Span-T]] - high-performance APIs
