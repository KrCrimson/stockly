#!/bin/bash
# Database Migration Script

echo "Running database migrations..."

# Check if .NET CLI is installed
if ! command -v dotnet &> /dev/null; then
    echo "Error: .NET CLI is not installed"
    exit 1
fi

# Navigate to the project directory
cd "$(dirname "$0")/../src/Presentation/API"

# Run migrations
dotnet ef database update --project ../../Infrastructure --startup-project .

echo "Database migrations completed successfully!"