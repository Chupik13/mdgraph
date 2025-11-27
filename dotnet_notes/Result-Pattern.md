**Tags**: #patterns #error-handling #functional
**Links**: [[Exception-Handling]], [[Railway-Oriented-Programming]], [[Validation]]

---

### Result Pattern

Result pattern represents operation outcomes without exceptions. Makes success/failure explicit in the type system.

**Basic Result:**
```csharp
public class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public string Error { get; }

    protected Result(bool isSuccess, string error)
    {
        IsSuccess = isSuccess;
        Error = error;
    }

    public static Result Success() => new(true, string.Empty);
    public static Result Failure(string error) => new(false, error);
    public static Result<T> Success<T>(T value) => new(value, true, string.Empty);
    public static Result<T> Failure<T>(string error) => new(default!, false, error);
}

public class Result<T> : Result
{
    public T Value { get; }

    protected internal Result(T value, bool isSuccess, string error)
        : base(isSuccess, error)
    {
        Value = value;
    }
}
```

**Usage in service:**
```csharp
public async Task<Result<User>> CreateUserAsync(CreateUserDto dto)
{
    if (await _repo.EmailExistsAsync(dto.Email))
        return Result.Failure<User>("Email already exists");

    if (!IsValidPassword(dto.Password))
        return Result.Failure<User>("Password doesn't meet requirements");

    var user = new User(dto.Email, HashPassword(dto.Password));
    await _repo.AddAsync(user);

    return Result.Success(user);
}
```

**Usage in controller:**
```csharp
[HttpPost]
public async Task<ActionResult<UserDto>> Create(CreateUserDto dto)
{
    var result = await _userService.CreateUserAsync(dto);

    if (result.IsFailure)
        return BadRequest(result.Error);

    return Ok(new UserDto(result.Value));
}
```

**With multiple errors:**
```csharp
public class Result<T>
{
    public List<string> Errors { get; } = new();
    public bool IsSuccess => !Errors.Any();
}
```

**Railway-oriented:**
```csharp
public async Task<Result<Order>> ProcessOrderAsync(OrderRequest request)
{
    return await ValidateRequest(request)
        .Bind(r => CreateOrder(r))
        .Bind(o => ProcessPayment(o))
        .Bind(o => SendConfirmation(o));
}
```

**Related:**
- [[Exception-Handling]] - when to use which
- [[Validation]] - input validation
- [[FluentResults]] - Result library
