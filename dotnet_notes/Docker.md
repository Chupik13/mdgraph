**Tags**: #devops #containers #deployment
**Links**: [[Dockerfile]], [[Docker-Compose]], [[Kubernetes]], [[Container-Registry]]

---

### Docker for .NET

Docker packages applications with their dependencies into containers. Essential for modern .NET deployment.

**Basic Dockerfile:**
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["MyApp.csproj", "."]
RUN dotnet restore
COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MyApp.dll"]
```

**Multi-stage benefits:**
- Smaller final image (runtime only)
- Build tools not in production
- Cached layers speed up builds

**Docker Compose:** See [[Docker-Compose]]
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - ConnectionStrings__Default=Server=db;Database=myapp
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

**Commands:**
```bash
docker build -t myapp .
docker run -p 8080:8080 myapp
docker-compose up -d
docker-compose logs -f api
```

**Best practices:**
- Use specific version tags
- Run as non-root user
- Use .dockerignore
- Health checks

**Related:**
- [[Dockerfile]] - image definition
- [[Docker-Compose]] - multi-container
- [[Kubernetes]] - orchestration
- [[Container-Health-Checks]] - monitoring
