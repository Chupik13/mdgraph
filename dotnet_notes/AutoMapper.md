**Tags**: #tools #mapping #patterns
**Links**: [[DTOs]], [[Clean-Architecture]], [[Object-Mapping]]

---

### AutoMapper

AutoMapper is a convention-based object mapper that eliminates manual property mapping code.

**Setup:**
```csharp
builder.Services.AddAutoMapper(typeof(Program).Assembly);
```

**Profile configuration:**
```csharp
public class UserProfile : Profile
{
    public UserProfile()
    {
        CreateMap<User, UserDto>();
        CreateMap<CreateUserDto, User>()
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));

        CreateMap<Order, OrderDto>()
            .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer.Name))
            .ForMember(dest => dest.Total, opt => opt.MapFrom(src => src.Lines.Sum(l => l.Amount)));
    }
}
```

**Usage:**
```csharp
public class UserService
{
    private readonly IMapper _mapper;

    public UserDto GetUser(User user)
    {
        return _mapper.Map<UserDto>(user);
    }

    public List<UserDto> GetUsers(List<User> users)
    {
        return _mapper.Map<List<UserDto>>(users);
    }

    public User CreateUser(CreateUserDto dto)
    {
        return _mapper.Map<User>(dto);
    }
}
```

**With EF Core (projection):**
```csharp
var userDtos = await context.Users
    .ProjectTo<UserDto>(_mapper.ConfigurationProvider)
    .ToListAsync();
// Generates optimal SQL - only selects needed columns
```

**Custom resolvers:**
```csharp
CreateMap<Order, OrderDto>()
    .ForMember(dest => dest.Status,
        opt => opt.MapFrom<OrderStatusResolver>());

public class OrderStatusResolver : IValueResolver<Order, OrderDto, string>
{
    public string Resolve(Order source, OrderDto dest, string member, ResolutionContext ctx)
    {
        return source.Status.ToDisplayString();
    }
}
```

**Alternatives:**
- Mapster - faster, less config
- Manual mapping - explicit, no magic

**Related:**
- [[DTOs]] - data transfer objects
- [[Clean-Architecture]] - layer mapping
- [[EF-Query-Optimization]] - projection
