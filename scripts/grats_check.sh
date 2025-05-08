#!/bin/bash

# Exit if any command fails
set -e

# Run Grats
npm run grats

# Check that it didn't change anything
if [ -n "$(git status --porcelain)" ]; then
    echo "Schema file is out of date. Please run 'npm run grats' and commit the changes."
    git diff
    exit 1
fi