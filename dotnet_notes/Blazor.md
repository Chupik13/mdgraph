**Tags**: #aspnet #frontend #webassembly
**Links**: [[ASP-NET-Core]], [[Razor-Components]], [[SignalR]]

---

### Blazor

Blazor is a framework for building interactive web UIs using C# instead of JavaScript. Two hosting models available.

**Blazor Server:**
```csharp
// Program.cs
builder.Services.AddServerSideBlazor();
app.MapBlazorHub();
app.MapFallbackToPage("/_Host");

// Real-time connection via SignalR
// UI events sent to server, DOM diffs sent back
```

**Blazor WebAssembly:**
```csharp
// Client runs entirely in browser
// C# compiled to WebAssembly
var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
```

**Component example:**
```razor
@page "/counter"
@inject ICounterService CounterService

<h1>Counter: @currentCount</h1>
<button @onclick="IncrementCount">Click me</button>

@code {
    private int currentCount = 0;

    private async Task IncrementCount()
    {
        currentCount++;
        await CounterService.LogClickAsync(currentCount);
    }
}
```

**Component lifecycle:**
```csharp
protected override async Task OnInitializedAsync()
{
    // Called when component initializes
    data = await DataService.GetDataAsync();
}

protected override void OnParametersSet()
{
    // Called when parameters change
}

protected override async Task OnAfterRenderAsync(bool firstRender)
{
    if (firstRender)
    {
        // JS interop safe here
        await JSRuntime.InvokeVoidAsync("initChart");
    }
}
```

**Related:**
- [[Razor-Components]] - component syntax
- [[SignalR]] - powers Blazor Server
- [[JavaScript-Interop]] - calling JS from Blazor

