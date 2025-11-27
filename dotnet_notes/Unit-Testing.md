**Tags**: #testing #fundamentals #quality
**Links**: [[xUnit]], [[Moq]], [[TDD]], [[Test-Doubles]], [[AAA-Pattern]]

---

### Unit Testing

Unit tests verify individual units of code in isolation. They should be fast, isolated, and deterministic.

**Characteristics (F.I.R.S.T):**
- **Fast** - run in milliseconds
- **Isolated** - no dependencies between tests
- **Repeatable** - same result every run
- **Self-validating** - pass or fail
- **Timely** - written with production code

**AAA Pattern:** See [[AAA-Pattern]]
```csharp
[Fact]
public void CreateUser_ValidInput_ReturnsUser()
{
    // Arrange - setup
    var service = new UserService(mockRepo.Object);
    var dto = new CreateUserDto { Name = "Alice", Email = "alice@test.com" };

    // Act - execute
    var result = service.CreateUser(dto);

    // Assert - verify
    Assert.NotNull(result);
    Assert.Equal("Alice", result.Name);
}
```

**What to test:**
- Public API behavior
- Edge cases and boundaries
- Error conditions
- Business logic

**What NOT to test:**
- Private methods directly
- Third-party code
- Trivial code (getters/setters)
- Framework code

**Test doubles:** See [[Test-Doubles]]
- Mocks - verify interactions
- Stubs - provide canned responses
- Fakes - simplified implementations

**Naming convention:**
```csharp
MethodName_StateUnderTest_ExpectedBehavior
// or
Should_ExpectedBehavior_When_StateUnderTest
```

**Related:**
- [[xUnit]] - testing framework
- [[Moq]] - mocking library
- [[TDD]] - test-driven development
- [[Integration-Testing]] - broader tests
