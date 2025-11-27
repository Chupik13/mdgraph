**Tags**: #csharp #serialization #api
**Links**: [[System-Text-Json]], [[DTOs]], [[ASP-NET-Core]]

---

### JSON Serialization

System.Text.Json is the built-in, high-performance JSON library. Default in ASP.NET Core.

**Basic usage:**
```csharp
// Serialize
var person = new Person { Name = "Alice", Age = 30 };
string json = JsonSerializer.Serialize(person);

// Deserialize
Person? person = JsonSerializer.Deserialize<Person>(json);

// Pretty print
var options = new JsonSerializerOptions { WriteIndented = true };
string pretty = JsonSerializer.Serialize(person, options);
```

**Configuration:**
```csharp
var options = new JsonSerializerOptions
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    PropertyNameCaseInsensitive = true,
    WriteIndented = true,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
};
```

**Attributes:**
```csharp
public class User
{
    [JsonPropertyName("user_name")]
    public string Name { get; set; }

    [JsonIgnore]
    public string Password { get; set; }

    [JsonConverter(typeof(DateOnlyConverter))]
    public DateOnly BirthDate { get; set; }

    [JsonInclude]
    private int _internalId;
}
```

**Custom converter:**
```csharp
public class DateOnlyConverter : JsonConverter<DateOnly>
{
    public override DateOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        return DateOnly.Parse(reader.GetString()!);
    }

    public override void Write(Utf8JsonWriter writer, DateOnly value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString("yyyy-MM-dd"));
    }
}
```

**ASP.NET Core configuration:**
```csharp
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});
```

**Source generation (AOT):**
```csharp
[JsonSerializable(typeof(Person))]
[JsonSerializable(typeof(List<Person>))]
public partial class AppJsonContext : JsonSerializerContext { }

var json = JsonSerializer.Serialize(person, AppJsonContext.Default.Person);
```

**Related:**
- [[DTOs]] - serialization targets
- [[ASP-NET-Core]] - web serialization
- [[Performance-Best-Practices]] - optimization
