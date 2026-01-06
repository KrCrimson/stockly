# Build Script for Stock Management System

echo "Building Stock Management System..."

# Restore packages
dotnet restore src/Presentation/API/

# Build the application
dotnet build src/Presentation/API/ --configuration Release --no-restore

# Run tests
dotnet test tests/ --configuration Release --no-build --verbosity normal

echo "Build completed successfully!"