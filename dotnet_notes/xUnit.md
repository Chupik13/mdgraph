**Tags**: #testing #fundamentals #quality
**Links**: [[Unit-Testing]], [[Integration-Testing]], [[Moq]], [[FluentAssertions]], [[Test-Fixtures]]

---

### xUnit

xUnit is a popular testing framework for .NET. It's the default choice for many projects including ASP.NET Core itself.

**Basic test:**
```csharp
public class CalculatorTests
{
    [Fact]
    public void Add_TwoNumbers_ReturnsSum()
    {
        // Arrange
        var calculator = new Calculator();

        // Act
        var result = calculator.Add(2, 3);

        // Assert
        Assert.Equal(5, result);
    }
}
```

**Theory (parameterized tests):**
```csharp
[Theory]
[InlineData(1, 2, 3)]
[InlineData(-1, 1, 0)]
[InlineData(0, 0, 0)]
public void Add_MultipleInputs_ReturnsExpected(int a, int b, int expected)
{
    var result = new Calculator().Add(a, b);
    Assert.Equal(expected, result);
}

// Complex data
[Theory]
[MemberData(nameof(GetTestData))]
public void Process_ComplexInput_Works(TestInput input)
{
    // ...
}

public static IEnumerable<object[]> GetTestData()
{
    yield return new object[] { new TestInput { ... } };
}
```

**Lifecycle:**
```csharp
public class MyTests : IDisposable
{
    public MyTests() { /* Runs before each test */ }
    public void Dispose() { /* Runs after each test */ }
}

// Shared fixture
public class DatabaseTests : IClassFixture<DatabaseFixture>
{
    private readonly DatabaseFixture _fixture;
    public DatabaseTests(DatabaseFixture fixture) => _fixture = fixture;
}
```

**Running tests:**
```bash
dotnet test
dotnet test --filter "Category=Unit"
dotnet test --logger "console;verbosity=detailed"
```

**Related:**
- [[Unit-Testing]] - testing principles
- [[Moq]] - mocking framework
- [[FluentAssertions]] - readable assertions
- [[Test-Fixtures]] - shared setup
