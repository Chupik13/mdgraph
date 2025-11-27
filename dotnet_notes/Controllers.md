**Tags**: #aspnet #api #web
**Links**: [[ASP-NET-Core]], [[Routing]], [[Model-Binding]], [[Action-Results]], [[Minimal-APIs]]

---

### Controllers

Controllers handle HTTP requests in ASP.NET Core Web API. They group related endpoints and provide conventions.

**Basic controller:**
```csharp
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetAll()
    {
        return Ok(await _userService.GetAllAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user is null) return NotFound();
        return Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<User>> Create([FromBody] CreateUserDto dto)
    {
        var user = await _userService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
    }
}
```

**[ApiController] attribute:**
- Automatic model validation (returns 400)
- Automatic [FromBody] inference
- Problem details for errors

**Common attributes:**
- `[HttpGet]`, `[HttpPost]`, `[HttpPut]`, `[HttpDelete]`
- `[Route]` - custom routing
- `[FromBody]`, `[FromQuery]`, `[FromRoute]`
- `[Authorize]`, `[AllowAnonymous]`

**Related:**
- [[Model-Binding]] - request data binding
- [[Action-Results]] - response types
- [[Minimal-APIs]] - lightweight alternative
- [[Routing]] - URL patterns
