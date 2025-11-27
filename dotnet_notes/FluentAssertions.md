**Tags**: #testing #quality #assertions
**Links**: [[Unit-Testing]], [[xUnit]], [[Moq]], [[Readable-Tests]]

---

### FluentAssertions

FluentAssertions provides a fluent API for writing readable and expressive test assertions.

**Basic assertions:**
```csharp
// Instead of
Assert.Equal("Alice", user.Name);

// Write
user.Name.Should().Be("Alice");
user.Age.Should().BeGreaterThan(18);
user.Email.Should().NotBeNullOrEmpty();
```

**Object comparison:**
```csharp
// Full object comparison
actual.Should().BeEquivalentTo(expected);

// With options
actual.Should().BeEquivalentTo(expected, options =>
    options.Excluding(x => x.Id)
           .Excluding(x => x.CreatedAt));
```

**Collections:**
```csharp
users.Should().HaveCount(3);
users.Should().Contain(u => u.Name == "Alice");
users.Should().BeInAscendingOrder(u => u.Age);
users.Should().NotContainNulls();
users.Should().OnlyContain(u => u.IsActive);

// Equivalent regardless of order
actual.Should().BeEquivalentTo(expected);
```

**Exceptions:**
```csharp
// Assert throws
Action act = () => service.Process(null);
act.Should().Throw<ArgumentNullException>()
   .WithMessage("*cannot be null*");

// Async
Func<Task> act = () => service.ProcessAsync(null);
await act.Should().ThrowAsync<InvalidOperationException>();
```

**Strings:**
```csharp
result.Should().StartWith("Hello");
result.Should().Contain("world");
result.Should().MatchRegex(@"\d{4}-\d{2}-\d{2}");
```

**Nullable and types:**
```csharp
result.Should().NotBeNull();
result.Should().BeOfType<OrderDto>();
result.Should().BeAssignableTo<IEntity>();
```

**Custom messages:**
```csharp
user.IsActive.Should().BeTrue("user {0} should be active after registration", user.Name);
```

**Related:**
- [[Unit-Testing]] - testing principles
- [[xUnit]] - test framework
- [[Readable-Tests]] - test readability
