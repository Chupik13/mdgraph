**Tags**: #security #configuration #devops
**Links**: [[Configuration]], [[Azure-Key-Vault]], [[Environment-Variables]]

---

### Secret Management

Secrets (API keys, connection strings, passwords) require secure storage separate from code.

**User Secrets (Development):**
```bash
# Initialize
dotnet user-secrets init

# Set secrets
dotnet user-secrets set "Database:Password" "super-secret"
dotnet user-secrets set "ApiKeys:Stripe" "sk_test_..."

# List secrets
dotnet user-secrets list
```

```csharp
// Automatically loaded in Development
builder.Configuration.AddUserSecrets<Program>();
```

**Environment Variables (Production):**
```csharp
// Loaded by default
// ConnectionStrings__Default → ConnectionStrings:Default
```

**Azure Key Vault:**
```csharp
builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{vaultName}.vault.azure.net/"),
    new DefaultAzureCredential());

// Access as normal configuration
var secret = builder.Configuration["MySecret"];
```

**AWS Secrets Manager:**
```csharp
builder.Configuration.AddSecretsManager(configurator: options =>
{
    options.SecretFilter = entry => entry.Name.StartsWith("myapp/");
    options.KeyGenerator = (entry, key) => key.Replace("myapp/", "");
});
```

**Best practices:**
- Never commit secrets to git
- Use `.gitignore` for secrets files
- Different secrets per environment
- Rotate secrets regularly
- Use managed identities when possible

**Configuration priority:**
1. Command-line arguments
2. Environment variables
3. User secrets (dev only)
4. appsettings.{Environment}.json
5. appsettings.json

**Related:**
- [[Configuration]] - settings management
- [[Azure-Key-Vault]] - cloud secrets
- [[Environment-Variables]] - env vars
