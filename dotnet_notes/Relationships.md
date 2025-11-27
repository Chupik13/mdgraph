**Tags**: #ef #database #modeling
**Links**: [[Entity-Framework]], [[Navigation-Properties]], [[Foreign-Keys]], [[DbContext]]

---

### Entity Relationships

EF Core supports one-to-one, one-to-many, and many-to-many relationships through navigation properties and foreign keys.

**One-to-Many:**
```csharp
public class Blog
{
    public int Id { get; set; }
    public string Name { get; set; }
    public List<Post> Posts { get; set; } = new();  // Collection navigation
}

public class Post
{
    public int Id { get; set; }
    public string Title { get; set; }
    public int BlogId { get; set; }       // Foreign key
    public Blog Blog { get; set; }         // Reference navigation
}
```

**One-to-One:**
```csharp
public class User
{
    public int Id { get; set; }
    public Profile? Profile { get; set; }
}

public class Profile
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; }
}
```

**Many-to-Many (EF Core 5+):**
```csharp
public class Post
{
    public List<Tag> Tags { get; set; } = new();
}

public class Tag
{
    public List<Post> Posts { get; set; } = new();
}

// EF creates join table automatically
```

**Fluent configuration:**
```csharp
modelBuilder.Entity<Post>()
    .HasOne(p => p.Blog)
    .WithMany(b => b.Posts)
    .HasForeignKey(p => p.BlogId)
    .OnDelete(DeleteBehavior.Cascade);
```

**Loading strategies:**
- Eager: `Include()` - load with main query
- Explicit: `Entry().Collection().Load()` - load on demand
- Lazy: Virtual properties + proxy - auto-load (avoid!)

**Related:**
- [[Navigation-Properties]] - accessing related data
- [[Cascade-Delete]] - deletion behavior
- [[EF-Query-Optimization]] - efficient loading
