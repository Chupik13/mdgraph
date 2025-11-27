**Tags**: #reactive #async #advanced
**Links**: [[Observer-Pattern]], [[Async-Streams]], [[Events]]

---

### Reactive Extensions (Rx.NET)

Rx.NET provides composable operators for asynchronous and event-based programs using observable sequences.

**Installation:**
```bash
dotnet add package System.Reactive
```

**Basic observable:**
```csharp
// Create observable from events
var clicks = Observable.FromEventPattern<MouseEventArgs>(
    button, nameof(button.Click));

// Transform and filter
clicks
    .Where(e => e.EventArgs.Button == MouseButtons.Left)
    .Throttle(TimeSpan.FromMilliseconds(200))
    .Subscribe(e => Console.WriteLine("Click!"));
```

**Combining streams:**
```csharp
var temperatureStream = GetTemperatureObservable();
var humidityStream = GetHumidityObservable();

// Combine latest values
var comfortIndex = temperatureStream
    .CombineLatest(humidityStream, (temp, humidity) =>
        CalculateComfortIndex(temp, humidity))
    .DistinctUntilChanged();

comfortIndex.Subscribe(index => UpdateDisplay(index));
```

**Error handling:**
```csharp
var stream = Observable.Create<int>(observer =>
{
    observer.OnNext(1);
    observer.OnNext(2);
    observer.OnError(new Exception("Failed"));
    return Disposable.Empty;
});

stream
    .Retry(3)                      // Retry on error
    .Catch<int, Exception>(ex =>   // Handle error
        Observable.Return(-1))
    .Subscribe(Console.WriteLine);
```

**Common operators:**
```csharp
observable
    .Where(x => x > 0)           // Filter
    .Select(x => x * 2)          // Transform
    .Distinct()                  // Remove duplicates
    .Take(10)                    // Limit count
    .Timeout(TimeSpan.FromSeconds(5))  // Timeout
    .Buffer(TimeSpan.FromSeconds(1))   // Batch by time
    .Sample(TimeSpan.FromSeconds(1))   // Latest in window
    .Subscribe(handler);
```

**Related:**
- [[Observer-Pattern]] - foundation pattern
- [[Async-Streams]] - native async iteration
- [[Events]] - event handling

