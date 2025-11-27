**Tags**: #csharp #types #fundamentals
**Links**: [[Nullable-Reference-Types]], [[Null-Coalescing]], [[Value-Types]]

---

### Nullable Value Types

`T?` syntax allows value types (int, bool, DateTime) to have null values, representing absence of value.

**Syntax:**
```csharp
int? nullableInt = null;
bool? nullableBool = true;
DateTime? nullableDate = DateTime.Now;

// Underlying type
Nullable<int> sameAsIntQuestion = null;
```

**Properties:**
```csharp
int? value = 42;

bool hasValue = value.HasValue;  // true
int actual = value.Value;        // 42 (throws if null!)
int safe = value.GetValueOrDefault();  // 42 or default(int)
int withDefault = value.GetValueOrDefault(100);  // 42 or 100
```

**Null coalescing:**
```csharp
int? nullable = null;
int result = nullable ?? 0;  // 0

// Assignment
int? cache = null;
cache ??= ComputeValue();  // Assign if null
```

**Pattern matching:**
```csharp
if (value is int n)
{
    Console.WriteLine($"Has value: {n}");
}

if (value is null)
{
    Console.WriteLine("No value");
}
```

**Database mapping:**
```csharp
public class User
{
    public int Id { get; set; }
    public DateTime? DeletedAt { get; set; }  // NULL in database
    public int? ManagerId { get; set; }       // Optional FK
}
```

**Comparison:**
```csharp
int? a = null;
int? b = 5;

bool equal = a == b;      // false
bool nullCheck = a == null;  // true

// Lifted operators
int? sum = a + b;  // null (any operand null → null)
```

**Related:**
- [[Nullable-Reference-Types]] - reference type nullability
- [[Null-Coalescing]] - null handling operators
- [[Entity-Framework]] - database nulls
