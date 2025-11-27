**Tags**: #testing #mocking #quality
**Links**: [[Unit-Testing]], [[xUnit]], [[Test-Doubles]], [[Dependency-Injection]]

---

### Moq

Moq is the most popular mocking library for .NET. It creates mock objects for interfaces and virtual members.

**Basic mock:**
```csharp
[Fact]
public async Task GetUser_ExistingId_ReturnsUser()
{
    // Arrange
    var mockRepo = new Mock<IUserRepository>();
    mockRepo.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(new User { Id = 1, Name = "Alice" });

    var service = new UserService(mockRepo.Object);

    // Act
    var user = await service.GetUserAsync(1);

    // Assert
    Assert.Equal("Alice", user.Name);
}
```

**Setup patterns:**
```csharp
// Return value
mock.Setup(x => x.GetValue()).Returns(42);
mock.Setup(x => x.GetValueAsync()).ReturnsAsync(42);

// Match any argument
mock.Setup(x => x.Find(It.IsAny<int>())).Returns(new User());

// Match specific argument
mock.Setup(x => x.Find(It.Is<int>(id => id > 0))).Returns(new User());

// Throw exception
mock.Setup(x => x.Delete(999)).Throws<NotFoundException>();

// Callback
mock.Setup(x => x.Save(It.IsAny<User>()))
    .Callback<User>(u => savedUsers.Add(u));
```

**Verification:**
```csharp
// Verify method was called
mockRepo.Verify(r => r.SaveAsync(It.IsAny<User>()), Times.Once);
mockRepo.Verify(r => r.Delete(It.IsAny<int>()), Times.Never);

// Verify with specific argument
mockRepo.Verify(r => r.SaveAsync(It.Is<User>(u => u.Name == "Bob")));
```

**Properties:**
```csharp
mock.SetupProperty(x => x.Name, "Default");
mock.SetupAllProperties();  // All properties trackable
```

**Strict vs Loose:**
```csharp
var strict = new Mock<IService>(MockBehavior.Strict);  // Throws if unexpected call
var loose = new Mock<IService>(MockBehavior.Loose);    // Returns default
```

**Related:**
- [[Unit-Testing]] - testing principles
- [[Test-Doubles]] - mock vs stub vs fake
- [[NSubstitute]] - alternative library
