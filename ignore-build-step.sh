#!/bin/sh

# Change detection for docs/ directory
echo "Checking for changes in docs/ directory..."

# Fetch the latest changes from the remote repository
git fetch origin

# Get the latest commit hash on the main branch
LATEST_MAIN_COMMIT=$(git rev-parse origin/main)

# Check for changes in the docs/ directory since the latest commit on the main branch
if ! git diff --quiet $LATEST_MAIN_COMMIT HEAD ./docs; then
  echo "Changes detected in docs/, skipping build."
  exit 0
fi

echo "No changes in docs/, proceeding with build."
exit 1
