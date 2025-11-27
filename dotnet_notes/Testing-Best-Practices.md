**Tags**: #testing #best-practices #quality
**Links**: [[Unit-Testing]], [[Integration-Testing]], [[TDD]]

---

### Testing Best Practices

Guidelines for writing effective, maintainable tests that provide confidence in your code.

**Arrange-Act-Assert pattern:**
```csharp
[Fact]
public void CalculateDiscount_VipCustomer_Returns20Percent()
{
    // Arrange
    var calculator = new DiscountCalculator();
    var customer = new Customer { IsVip = true };
    var orderTotal = 100m;

    // Act
    var discount = calculator.Calculate(customer, orderTotal);

    // Assert
    Assert.Equal(20m, discount);
}
```

**Test naming:**
```csharp
// Pattern: MethodName_StateUnderTest_ExpectedBehavior
[Fact]
public void Withdraw_InsufficientFunds_ThrowsException() { }

[Fact]
public void CreateOrder_EmptyCart_ReturnsValidationError() { }

[Fact]
public void GetUser_ValidId_ReturnsUser() { }
```

**One assertion per test (logical):**
```csharp
// GOOD - single logical assertion
[Fact]
public void CreateUser_ValidInput_ReturnsCreatedUser()
{
    var result = _service.CreateUser(new CreateUserDto("John", "john@example.com"));

    // Related assertions about the created user
    Assert.NotNull(result);
    Assert.Equal("John", result.Name);
    Assert.Equal("john@example.com", result.Email);
}
```

**Avoid test interdependence:**
```csharp
// BAD - depends on other test's state
private static User _createdUser;

[Fact]
public void Test1_CreateUser() { _createdUser = ...; }

[Fact]
public void Test2_GetUser() { Assert.NotNull(_createdUser); } // Fragile!

// GOOD - each test is independent
[Fact]
public void GetUser_AfterCreate_ReturnsUser()
{
    var user = _service.CreateUser(...);
    var retrieved = _service.GetUser(user.Id);
    Assert.Equal(user.Id, retrieved.Id);
}
```

**Related:**
- [[Unit-Testing]] - unit test patterns
- [[Integration-Testing]] - integration tests
- [[Moq]] - mocking framework

