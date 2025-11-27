**Tags**: #solid #architecture #design
**Links**: [[SOLID]], [[Interface-Design]], [[Dependency-Inversion]]

---

### Interface Segregation Principle

Clients should not be forced to depend on interfaces they don't use. Prefer small, focused interfaces.

**Violation:**
```csharp
// FAT interface - forces all implementers to implement everything
public interface IWorker
{
    void Work();
    void Eat();
    void Sleep();
    void TakeBreak();
    void AttendMeeting();
}

// Robot can't eat or sleep!
public class Robot : IWorker
{
    public void Work() { /* OK */ }
    public void Eat() => throw new NotImplementedException();  // Bad!
    public void Sleep() => throw new NotImplementedException();  // Bad!
    // ...
}
```

**Solution - Segregated interfaces:**
```csharp
public interface IWorkable
{
    void Work();
}

public interface IFeedable
{
    void Eat();
}

public interface IRestable
{
    void Sleep();
    void TakeBreak();
}

// Human implements all
public class Human : IWorkable, IFeedable, IRestable
{
    public void Work() { }
    public void Eat() { }
    public void Sleep() { }
    public void TakeBreak() { }
}

// Robot only implements what it can do
public class Robot : IWorkable
{
    public void Work() { }
}
```

**Real-world example:**
```csharp
// Bad - fat repository
public interface IRepository<T>
{
    T GetById(int id);
    IEnumerable<T> GetAll();
    void Add(T entity);
    void Update(T entity);
    void Delete(T entity);
    void BulkInsert(IEnumerable<T> entities);
    IQueryable<T> Query();
}

// Good - segregated
public interface IReadRepository<T>
{
    T? GetById(int id);
    IEnumerable<T> GetAll();
}

public interface IWriteRepository<T>
{
    void Add(T entity);
    void Update(T entity);
    void Delete(T entity);
}
```

**Benefits:**
- Smaller, focused interfaces
- Easier to implement
- Better testability (mock only what you need)
- Clearer dependencies

**Related:**
- [[SOLID]] - other principles
- [[Interface-Design]] - design guidelines
- [[Dependency-Inversion]] - abstraction principle
