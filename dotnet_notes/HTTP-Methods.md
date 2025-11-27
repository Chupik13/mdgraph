**Tags**: #api #http #fundamentals
**Links**: [[REST-API]], [[Controllers]], [[Minimal-APIs]]

---

### HTTP Methods

HTTP methods define the action to perform on a resource. Each has specific semantics.

**GET - Retrieve:**
```csharp
[HttpGet("{id}")]
public async Task<IActionResult> Get(int id)
{
    var item = await _repository.GetByIdAsync(id);
    return item is null ? NotFound() : Ok(item);
}
// Safe, idempotent, cacheable
```

**POST - Create:**
```csharp
[HttpPost]
public async Task<IActionResult> Create(CreateItemDto dto)
{
    var item = await _service.CreateAsync(dto);
    return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
}
// Not safe, not idempotent
```

**PUT - Replace:**
```csharp
[HttpPut("{id}")]
public async Task<IActionResult> Update(int id, UpdateItemDto dto)
{
    await _service.ReplaceAsync(id, dto);
    return NoContent();
}
// Not safe, idempotent
```

**PATCH - Partial update:**
```csharp
[HttpPatch("{id}")]
public async Task<IActionResult> Patch(int id, JsonPatchDocument<Item> patch)
{
    var item = await _repository.GetByIdAsync(id);
    patch.ApplyTo(item);
    await _repository.SaveAsync();
    return Ok(item);
}
// Not safe, not idempotent
```

**DELETE - Remove:**
```csharp
[HttpDelete("{id}")]
public async Task<IActionResult> Delete(int id)
{
    await _service.DeleteAsync(id);
    return NoContent();
}
// Not safe, idempotent
```

| Method | Safe | Idempotent | Request Body |
|--------|------|------------|--------------|
| GET    | Yes  | Yes        | No           |
| POST   | No   | No         | Yes          |
| PUT    | No   | Yes        | Yes          |
| PATCH  | No   | No         | Yes          |
| DELETE | No   | Yes        | No           |

**Related:**
- [[REST-API]] - RESTful design
- [[Controllers]] - action methods
- [[Idempotency]] - idempotent operations

