**Tags**: #aspnet #security #authentication
**Links**: [[Authentication]], [[Authorization]], [[Claims]], [[Token-Refresh]]

---

### JWT Authentication

JSON Web Tokens (JWT) provide stateless authentication. The token contains encoded claims and is signed by the server.

**Setup:**
```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
            ClockSkew = TimeSpan.Zero
        };
    });
```

**Generating tokens:**
```csharp
public string GenerateToken(User user)
{
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Role, user.Role)
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
    var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: _config["Jwt:Issuer"],
        audience: _config["Jwt:Audience"],
        claims: claims,
        expires: DateTime.UtcNow.AddHours(1),
        signingCredentials: credentials);

    return new JwtSecurityTokenHandler().WriteToken(token);
}
```

**Login endpoint:**
```csharp
[HttpPost("login")]
public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
{
    var user = await _userService.ValidateCredentialsAsync(request);
    if (user is null) return Unauthorized();

    var token = _tokenService.GenerateToken(user);
    return Ok(new LoginResponse(token, DateTime.UtcNow.AddHours(1)));
}
```

**Best practices:**
- Use HTTPS only
- Short expiration (15min-1hr)
- Implement [[Token-Refresh]] for long sessions
- Store secrets securely

**Related:**
- [[Authentication]] - auth overview
- [[Claims]] - user information
- [[Token-Refresh]] - refresh tokens
