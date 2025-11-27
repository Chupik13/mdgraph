**Tags**: #csharp #fundamentals #data-structures
**Links**: [[IEnumerable]], [[LINQ]], [[Concurrent-Collections]], [[Immutable-Collections]]

---

### Collections

.NET provides various collection types optimized for different scenarios.

**Common collections:**
```csharp
// List - dynamic array
var list = new List<int> { 1, 2, 3 };
list.Add(4);
list.RemoveAt(0);

// Dictionary - key-value pairs
var dict = new Dictionary<string, int>
{
    ["one"] = 1,
    ["two"] = 2
};
var value = dict.GetValueOrDefault("three", 0);

// HashSet - unique elements
var set = new HashSet<int> { 1, 2, 3 };
set.Add(2);  // No effect - already exists
bool contains = set.Contains(2);

// Queue - FIFO
var queue = new Queue<string>();
queue.Enqueue("first");
var item = queue.Dequeue();

// Stack - LIFO
var stack = new Stack<string>();
stack.Push("item");
var top = stack.Pop();
```

**Choosing collection:**
| Need | Collection |
|------|------------|
| Index access | `List<T>`, `T[]` |
| Key lookup | `Dictionary<K,V>` |
| Uniqueness | `HashSet<T>` |
| Sorted | `SortedList<K,V>`, `SortedSet<T>` |
| FIFO | `Queue<T>` |
| LIFO | `Stack<T>` |
| Linked | `LinkedList<T>` |

**Collection expressions (C# 12):**
```csharp
int[] array = [1, 2, 3];
List<int> list = [1, 2, 3];
Span<int> span = [1, 2, 3];

// Spread operator
int[] combined = [..array, 4, 5, ..list];
```

**Interfaces:**
```csharp
IEnumerable<T>  // Iteration only
ICollection<T>  // Add, Remove, Count
IList<T>        // Index access
IReadOnlyList<T>  // Read-only index access
IDictionary<K,V>  // Key-value operations
```

**Related:**
- [[LINQ]] - querying collections
- [[Concurrent-Collections]] - thread-safe
- [[Immutable-Collections]] - immutable variants
