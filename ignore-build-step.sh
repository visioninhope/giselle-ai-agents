#!/bin/sh

# Change detection for docs/ directory
echo "Checking for changes in docs/ directory..."

# Check for changes in the docs/ directory since the latest commit on the main branch
if ! git diff --quiet HEAD~1 HEAD ./docs; then
  echo "Changes detected in docs/, skipping build."
  exit 0
fi

echo "No changes in docs/, proceeding with build."
exit 1
