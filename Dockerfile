# Use the official .NET 9 SDK image as the build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files first to leverage Docker layer caching
COPY ["ETutoring.sln", "./"]
COPY ["ETutoring.Core/ETutoring.Core.csproj", "ETutoring.Core/"]
COPY ["ETutoring.DataAccess/ETutoring.DataAccess.csproj", "ETutoring.DataAccess/"]
COPY ["ETutoring.Business/ETutoring.Business.csproj", "ETutoring.Business/"]
COPY ["ETutoring.API/ETutoring.API.csproj", "ETutoring.API/"]
# Add other projects if they exist and are needed for the build (e.g., ETutoring.Infrastructure, ETutoring.API.Tests if needed for build steps)
# COPY ["ETutoring.Infrastructure/ETutoring.Infrastructure.csproj", "ETutoring.Infrastructure/"]
# COPY ["ETutoring.API.Tests/ETutoring.API.Tests.csproj", "ETutoring.API.Tests/"]

# Restore dependencies for the solution
RUN dotnet restore "ETutoring.sln"

# Copy the rest of the source code
COPY . .

# Publish the application
WORKDIR "/src/ETutoring.API"
RUN dotnet publish "ETutoring.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the official ASP.NET 9 runtime image for the final stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Copy the published output from the build stage
COPY --from=build /app/publish .

# Expose the port the app runs on (ASP.NET Core defaults to 8080 in containers)
EXPOSE 8080

# Set the entry point for the container
ENTRYPOINT ["dotnet", "ETutoring.API.dll"]
