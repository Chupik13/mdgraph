**Tags**: #aspnet #middleware #fundamentals
**Links**: [[Middleware]], [[ASP-NET-Core]], [[Request-Pipeline]]

---

### Middleware Order

Middleware order determines how requests flow through the pipeline. Order matters for security, performance, and functionality.

**Recommended order:**
```csharp
var app = builder.Build();

// 1. Exception handling (outermost - catches all)
app.UseExceptionHandler("/error");

// 2. HTTPS redirection
app.UseHttpsRedirection();

// 3. Static files (short-circuits for static content)
app.UseStaticFiles();

// 4. Routing (matches endpoints)
app.UseRouting();

// 5. CORS (before auth, after routing)
app.UseCors();

// 6. Authentication (who are you?)
app.UseAuthentication();

// 7. Authorization (what can you do?)
app.UseAuthorization();

// 8. Custom middleware
app.UseRequestLogging();

// 9. Endpoint execution
app.MapControllers();
```

**Why order matters:**
```csharp
// WRONG - auth before routing
app.UseAuthentication();
app.UseRouting();      // Routing needs to run first!
app.UseAuthorization();

// WRONG - exception handler too late
app.UseAuthentication();
app.UseExceptionHandler(); // Won't catch auth errors!

// WRONG - CORS after auth
app.UseAuthentication();
app.UseCors();  // Preflight requests will fail!
```

**Request/response flow:**
```
Request  → Exception → HTTPS → Static → Routing → CORS → Auth → AuthZ → Endpoint
Response ← Exception ← HTTPS ← Static ← Routing ← CORS ← Auth ← AuthZ ← Endpoint
```

**Conditional middleware:**
```csharp
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
}
else
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}
```

**Related:**
- [[Middleware]] - middleware basics
- [[ASP-NET-Core]] - web framework
- [[Authentication]] - auth middleware

