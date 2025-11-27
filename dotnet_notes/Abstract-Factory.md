**Tags**: #patterns #creational #design
**Links**: [[Factory-Pattern]], [[Dependency-Injection]], [[Strategy-Pattern]]

---

### Abstract Factory

Abstract Factory creates families of related objects without specifying concrete classes. Use when objects must be used together.

**Define abstract factory:**
```csharp
public interface IUIFactory
{
    IButton CreateButton();
    ITextBox CreateTextBox();
    ICheckBox CreateCheckBox();
}

public interface IButton { void Render(); }
public interface ITextBox { void Render(); }
public interface ICheckBox { void Render(); }
```

**Concrete factories:**
```csharp
public class WindowsUIFactory : IUIFactory
{
    public IButton CreateButton() => new WindowsButton();
    public ITextBox CreateTextBox() => new WindowsTextBox();
    public ICheckBox CreateCheckBox() => new WindowsCheckBox();
}

public class MacUIFactory : IUIFactory
{
    public IButton CreateButton() => new MacButton();
    public ITextBox CreateTextBox() => new MacTextBox();
    public ICheckBox CreateCheckBox() => new MacCheckBox();
}
```

**Client code:**
```csharp
public class FormRenderer
{
    private readonly IUIFactory _factory;

    public FormRenderer(IUIFactory factory)
    {
        _factory = factory;
    }

    public void RenderLoginForm()
    {
        // All components are from the same family
        var usernameBox = _factory.CreateTextBox();
        var passwordBox = _factory.CreateTextBox();
        var loginButton = _factory.CreateButton();
        var rememberMe = _factory.CreateCheckBox();

        usernameBox.Render();
        passwordBox.Render();
        loginButton.Render();
        rememberMe.Render();
    }
}
```

**Registration with DI:**
```csharp
builder.Services.AddSingleton<IUIFactory>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    return config["Platform"] switch
    {
        "Windows" => new WindowsUIFactory(),
        "Mac" => new MacUIFactory(),
        _ => throw new NotSupportedException()
    };
});
```

**Related:**
- [[Factory-Pattern]] - single object creation
- [[Dependency-Injection]] - factory injection
- [[Strategy-Pattern]] - related pattern

