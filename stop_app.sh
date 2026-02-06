#!/bin/bash

# Get the directory where that script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Navigate to the project directory
cd "$SCRIPT_DIR"

echo "Stopping ZenUX Application..."
echo "--------------------------------"

# Stop containers
docker compose down

if [ $? -eq 0 ]; then
    echo ""
    echo "Application stopped successfully."
else
    echo ""
    echo "Error stopping the application."
fi

# Keep window open so they can see the output
read -p "Press Enter to close..."
