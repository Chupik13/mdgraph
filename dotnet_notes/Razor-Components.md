**Tags**: #blazor #components #ui
**Links**: [[Blazor]], [[Component-Parameters]], [[Event-Callbacks]]

---

### Razor Components

Razor components are the building blocks of Blazor applications. Combine C# and HTML in .razor files.

**Basic component:**
```razor
@* Counter.razor *@
<div class="counter">
    <span>@Count</span>
    <button @onclick="Increment">+</button>
</div>

@code {
    [Parameter]
    public int Count { get; set; }

    [Parameter]
    public EventCallback<int> CountChanged { get; set; }

    private async Task Increment()
    {
        Count++;
        await CountChanged.InvokeAsync(Count);
    }
}
```

**Using the component:**
```razor
<Counter @bind-Count="currentCount" />

@code {
    private int currentCount = 0;
}
```

**Cascading parameters:**
```razor
@* Parent *@
<CascadingValue Value="@theme">
    <ChildComponent />
</CascadingValue>

@* Child *@
@code {
    [CascadingParameter]
    public Theme Theme { get; set; }
}
```

**Render fragments:**
```razor
<Card>
    <Header>My Title</Header>
    <Body>Content goes here</Body>
</Card>

@* Card.razor *@
<div class="card">
    <div class="header">@Header</div>
    <div class="body">@Body</div>
</div>

@code {
    [Parameter]
    public RenderFragment Header { get; set; }

    [Parameter]
    public RenderFragment Body { get; set; }
}
```

**Related:**
- [[Blazor]] - framework overview
- [[Event-Callbacks]] - child-to-parent communication
- [[Component-Lifecycle]] - initialization and updates

