#!/bin/bash

# Get the directory where that script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Navigate to the project directory
cd "$SCRIPT_DIR"

echo "Starting ZenuX Application..."
echo "--------------------------------"

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker Desktop/Engine and try again."
    read -p "Press Enter to exit..."
    exit 1
fi

# Pull latest changes and build
echo "Building and starting containers..."
docker compose up -d --build --remove-orphans

if [ $? -eq 0 ]; then
    echo ""
    echo "Success! The application is up and running."
    echo "Go to the UI on: http://localhost:5174"
    echo ""
    echo "You can close this window now."
else
    echo ""
    echo "Failed to start the application."
    echo "Please reach out to the technical team with the error messages above."
fi

# Keep window open so they can see the output
read -p "Press Enter to close..."
