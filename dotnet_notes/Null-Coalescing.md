**Tags**: #csharp #fundamentals #null-safety
**Links**: [[Nullable-Reference-Types]], [[Null-Safety]], [[Pattern-Matching]]

---

### Null Coalescing Operators

Null coalescing operators provide concise null handling. Essential for clean, defensive code.

**?? - null coalescing:**
```csharp
// Return left if not null, otherwise right
string name = inputName ?? "Default";

// Chaining
string result = first ?? second ?? third ?? "fallback";
```

**??= - null coalescing assignment:**
```csharp
// Assign only if null
_cache ??= LoadFromDatabase();

// Equivalent to
if (_cache is null)
    _cache = LoadFromDatabase();
```

**?. - null conditional:**
```csharp
// Access member only if not null
int? length = text?.Length;
string? upper = text?.ToUpper();

// Chaining
var city = user?.Address?.City;

// With method calls
user?.SendNotification();

// With indexer
var first = collection?[0];
```

**Combined patterns:**
```csharp
// Get value or default
int count = list?.Count ?? 0;

// Safe navigation with fallback
string city = user?.Address?.City ?? "Unknown";

// Lazy initialization
public Settings Settings => _settings ??= LoadSettings();
```

**With collections:**
```csharp
// Empty collection fallback
var items = GetItems() ?? Array.Empty<Item>();

// Safe enumeration
foreach (var item in items ?? Enumerable.Empty<Item>())
{
    // ...
}
```

**! - null forgiving:**
```csharp
// Tell compiler "trust me, it's not null"
string definitelyNotNull = maybeNull!;

// Use sparingly - defeats null safety
```

**Related:**
- [[Nullable-Reference-Types]] - null annotations
- [[Pattern-Matching]] - null patterns
- [[Defensive-Programming]] - error prevention
