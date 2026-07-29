FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY src/OscApi/OscApi.csproj src/OscApi/
RUN dotnet restore src/OscApi/OscApi.csproj

COPY src/ src/
RUN dotnet publish src/OscApi/OscApi.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# curl is required by the HEALTHCHECK below and is NOT present in the aspnet
# runtime image. Without it the container reports "unhealthy" forever even
# though the API is serving fine, which stalls any `depends_on: service_healthy`.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app/uploads

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

ENTRYPOINT ["dotnet", "OscApi.dll"]
