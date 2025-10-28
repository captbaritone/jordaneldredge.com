#!/bin/bash

# Exit if any command fails
set -e

echo "=== Debug Info ==="
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo "pnpm version: $(pnpm --version)"
echo "Current directory: $(pwd)"
echo "Git status before grats:"
git status --porcelain

# Run Grats
echo "=== Running grats ==="
npm run grats

echo "=== Git status after grats ==="
git status --porcelain

# Check that it didn't change anything
if [ -n "$(git status --porcelain)" ]; then
    echo "Schema file is out of date. Please run 'npm run grats' and commit the changes."
    echo "=== Changes detected ==="
    git status
    echo "=== Diff ==="
    git diff
    exit 1
fi

echo "=== Success: No changes detected ==="