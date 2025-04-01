#!/bin/bash

# Check if url is provided
if [ -z "$1" ]; then
  echo "Usage: $0 url"
  exit 1
fi

# Set variables from URL
URL=$1
WORKSPACE_ID=$(echo "$URL" | grep -oE 'workspaces/wrks-[a-zA-Z0-9]+' | sed 's/workspaces\///')

# If no workspace ID found in URL, throw error
if [ -z "$WORKSPACE_ID" ]; then
  echo "Error: Could not extract workspace ID from URL."
  echo "URL must contain a workspace ID in format 'workspaces/wrks-XXXX'"
  exit 1
fi

# Construct URL if needed (already provided in this case)
DOWNLOAD_URL=$URL

# Create directory if it doesn't exist
mkdir -p ".storage/workspaces/${WORKSPACE_ID}"

# Download the JSON file
curl -o ".storage/workspaces/${WORKSPACE_ID}/workspace.json" "$DOWNLOAD_URL"

echo "Downloaded workspace ${WORKSPACE_ID} successfully"
echo "Open workspace at http://localhost:3000/workspaces/${WORKSPACE_ID}"
