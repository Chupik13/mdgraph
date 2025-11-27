**Tags**: #ef #database #devops
**Links**: [[Entity-Framework]], [[DbContext]], [[Code-First]], [[Database-Versioning]]

---

### Migrations

Migrations manage database schema changes over time. They track changes to your model and generate SQL to update the database.

**CLI commands:**
```bash
# Add migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update

# Generate SQL script
dotnet ef migrations script

# Remove last migration (not applied)
dotnet ef migrations remove

# List migrations
dotnet ef migrations list
```

**Migration file:**
```csharp
public partial class AddUserEmail : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "Email",
            table: "Users",
            type: "nvarchar(255)",
            maxLength: 255,
            nullable: false,
            defaultValue: "");

        migrationBuilder.CreateIndex(
            name: "IX_Users_Email",
            table: "Users",
            column: "Email",
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(name: "IX_Users_Email", table: "Users");
        migrationBuilder.DropColumn(name: "Email", table: "Users");
    }
}
```

**Best practices:**
- Review generated migrations before applying
- Test migrations on copy of production data
- Use idempotent scripts for CI/CD
- Keep migrations small and focused
- Never edit applied migrations

**Production deployment:**
```csharp
// Apply at startup (simple scenarios)
using var scope = app.Services.CreateScope();
var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
await db.Database.MigrateAsync();
```

**Related:**
- [[Code-First]] - model-driven approach
- [[Database-Versioning]] - schema management
- [[EF-Production-Migrations]] - deployment strategies
