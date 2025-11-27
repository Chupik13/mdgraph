**Tags**: #devops #ci-cd #automation
**Links**: [[Docker]], [[Testing-Pipeline]], [[Deployment-Strategies]], [[Secrets-Management]]

---

### GitHub Actions for .NET

GitHub Actions automates CI/CD workflows. Build, test, and deploy .NET applications on every push.

**Basic workflow (.github/workflows/ci.yml):**
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: 8.0.x

    - name: Restore dependencies
      run: dotnet restore

    - name: Build
      run: dotnet build --no-restore

    - name: Test
      run: dotnet test --no-build --verbosity normal
```

**With Docker:**
```yaml
jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Login to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Build and push
      uses: docker/build-push-action@v5
      with:
        push: true
        tags: ghcr.io/${{ github.repository }}:latest
```

**Secrets:** See [[Secrets-Management]]
```yaml
env:
  CONNECTION_STRING: ${{ secrets.DB_CONNECTION_STRING }}
```

**Matrix testing:**
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    dotnet-version: ['7.0.x', '8.0.x']
```

**Caching:**
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.nuget/packages
    key: ${{ runner.os }}-nuget-${{ hashFiles('**/*.csproj') }}
```

**Related:**
- [[Testing-Pipeline]] - test automation
- [[Deployment-Strategies]] - deployment patterns
- [[Azure-DevOps]] - alternative CI/CD
