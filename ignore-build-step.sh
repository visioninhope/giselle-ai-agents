#!/bin/sh

# Change detection for docs/ directory
if ! git diff --quiet HEAD^ HEAD ./docs; then
  echo "Changes detected in docs/, skipping build."
  exit 0
fi
