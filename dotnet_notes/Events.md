**Tags**: #csharp #fundamentals #patterns
**Links**: [[Delegates]], [[EventHandler]], [[Observer-Pattern]], [[Weak-Events]]

---

### Events

Events provide a way for a class to notify subscribers when something happens. Built on [[Delegates]] with additional encapsulation.

**Standard pattern:**
```csharp
public class Button
{
    public event EventHandler<ClickEventArgs>? Clicked;

    protected virtual void OnClicked(ClickEventArgs e)
    {
        Clicked?.Invoke(this, e);
    }

    public void Click()
    {
        OnClicked(new ClickEventArgs { X = 10, Y = 20 });
    }
}

public class ClickEventArgs : EventArgs
{
    public int X { get; set; }
    public int Y { get; set; }
}
```

**Subscribing:**
```csharp
var button = new Button();
button.Clicked += (sender, e) => Console.WriteLine($"Clicked at {e.X}, {e.Y}");
button.Clicked += OnButtonClicked;  // Method reference
```

**Event vs Delegate:**
- Events can only be invoked from declaring class
- Events use `+=` and `-=` only (no direct assignment)
- Events are a pattern for [[Observer-Pattern]]

**Memory leaks:**
Event handlers hold strong references. Unsubscribe when done:
```csharp
button.Clicked -= OnButtonClicked;
```
See [[Weak-Events]] for automatic cleanup.

**Related:**
- [[Delegates]] - underlying mechanism
- [[Observer-Pattern]] - design pattern
- [[INotifyPropertyChanged]] - data binding events
- [[Weak-Events]] - avoiding memory leaks
