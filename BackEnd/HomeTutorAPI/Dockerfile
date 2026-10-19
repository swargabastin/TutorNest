# ── Build stage (.NET 10 SDK) ──────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY HomeTutorAPI.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish --no-restore

# ── Runtime stage (.NET 10 ASP.NET) ───────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
RUN mkdir -p wwwroot/uploads

# Default to port 5000; can be overridden by cloud environment PORT
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_HTTP_PORTS=5000

COPY --from=build /app/publish .
EXPOSE 5000
ENTRYPOINT ["dotnet", "HomeTutorAPI.dll"]
