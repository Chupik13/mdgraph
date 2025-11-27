**Tags**: #patterns #behavioral #events
**Links**: [[Events]], [[Domain-Events]], [[Reactive-Extensions]]

---

### Observer Pattern

Observer pattern defines a one-to-many dependency where observers are notified when subject state changes.

**Using C# events:**
```csharp
public class StockTicker
{
    public event EventHandler<StockPriceChangedEventArgs>? PriceChanged;

    public void UpdatePrice(string symbol, decimal price)
    {
        // Update internal state
        _prices[symbol] = price;

        // Notify observers
        PriceChanged?.Invoke(this, new StockPriceChangedEventArgs(symbol, price));
    }
}

public class StockPriceChangedEventArgs : EventArgs
{
    public string Symbol { get; }
    public decimal Price { get; }

    public StockPriceChangedEventArgs(string symbol, decimal price)
    {
        Symbol = symbol;
        Price = price;
    }
}

// Subscribe
var ticker = new StockTicker();
ticker.PriceChanged += (sender, e) =>
    Console.WriteLine($"{e.Symbol}: {e.Price:C}");
```

**IObservable/IObserver:**
```csharp
public class TemperatureSensor : IObservable<Temperature>
{
    private readonly List<IObserver<Temperature>> _observers = new();

    public IDisposable Subscribe(IObserver<Temperature> observer)
    {
        _observers.Add(observer);
        return new Unsubscriber(_observers, observer);
    }

    public void ReportTemperature(Temperature temp)
    {
        foreach (var observer in _observers)
            observer.OnNext(temp);
    }
}

public class TemperatureDisplay : IObserver<Temperature>
{
    public void OnNext(Temperature value) => Console.WriteLine($"Temp: {value.Celsius}°C");
    public void OnError(Exception error) => Console.WriteLine($"Error: {error.Message}");
    public void OnCompleted() => Console.WriteLine("Monitoring complete");
}
```

**Related:**
- [[Events]] - C# event system
- [[Domain-Events]] - domain-driven events
- [[Reactive-Extensions]] - Rx.NET

