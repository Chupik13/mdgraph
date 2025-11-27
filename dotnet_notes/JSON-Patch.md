**Tags**: #api #http #patterns
**Links**: [[REST-API]], [[HTTP-Methods]], [[JSON-Serialization]]

---

### JSON Patch

JSON Patch (RFC 6902) describes changes to a JSON document. Useful for partial updates in REST APIs.

**Installation:**
```bash
dotnet add package Microsoft.AspNetCore.JsonPatch
```

**Controller action:**
```csharp
[HttpPatch("{id}")]
public async Task<IActionResult> Patch(int id, [FromBody] JsonPatchDocument<UpdateProductDto> patchDoc)
{
    var product = await _repository.GetByIdAsync(id);
    if (product == null)
        return NotFound();

    var dto = _mapper.Map<UpdateProductDto>(product);

    patchDoc.ApplyTo(dto, ModelState);

    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    _mapper.Map(dto, product);
    await _repository.SaveAsync();

    return Ok(product);
}
```

**Patch document format:**
```json
[
  { "op": "replace", "path": "/name", "value": "New Name" },
  { "op": "add", "path": "/tags/-", "value": "featured" },
  { "op": "remove", "path": "/description" },
  { "op": "copy", "from": "/name", "path": "/displayName" },
  { "op": "move", "from": "/oldField", "path": "/newField" },
  { "op": "test", "path": "/version", "value": 1 }
]
```

**Operations:**
| Operation | Description |
|-----------|-------------|
| add | Add value at path |
| remove | Remove value at path |
| replace | Replace value at path |
| copy | Copy value from one path to another |
| move | Move value from one path to another |
| test | Test value equals expected |

**Client usage:**
```csharp
var patch = new JsonPatchDocument<Product>();
patch.Replace(p => p.Name, "New Name");
patch.Remove(p => p.Description);
patch.Add(p => p.Tags, "featured");

var response = await _httpClient.PatchAsJsonAsync($"/products/{id}", patch);
```

**Related:**
- [[REST-API]] - API design
- [[HTTP-Methods]] - PATCH method
- [[JSON-Serialization]] - JSON handling

