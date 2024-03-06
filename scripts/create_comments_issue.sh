#!/bin/bash

# Check if an argument is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <path_to_markdown_file>"
    exit 1
fi

# Markdown file path
MARKDOWN_FILE="$1"

# Ensure the file exists
if [ ! -f "$MARKDOWN_FILE" ]; then
    echo "File does not exist: $MARKDOWN_FILE"
    exit 1
fi

# Extract title from YAML header
ISSUE_TITLE=$(awk '/---/{flag++} flag==1 && /title:/ {print $2; exit}' "$MARKDOWN_FILE" | tr -d '"')

# Validate extracted title
if [ -z "$ISSUE_TITLE" ]; then
    echo "Could not extract title from the Markdown file"
    exit 1
fi

# Hardcoded repository in the format "owner/repo"
REPO="captbaritone/jordaneldredge.com"

# Create issue and capture the URL directly from the output
ISSUE_URL=$(gh issue create --title "Comments: $ISSUE_TITLE" --repo $REPO --body "Comments left here will appear on the $ISSUE_TITLE post at https://jordaneldredge.com" | grep -o 'https://github.com/[^ ]*')

# Extract Issue ID from URL
ISSUE_ID=$(echo "$ISSUE_URL" | grep -o '[^/]*$')

echo "Issue ID: $ISSUE_ID"

# Update or append github_comments_issue_id
if grep -q "github_comments_issue_id:" "$MARKDOWN_FILE"; then
    ex "$MARKDOWN_FILE" <<EOF
g/github_comments_issue_id:/s/github_comments_issue_id:.*/github_comments_issue_id: $ISSUE_ID/
wq
EOF
else
    ex "$MARKDOWN_FILE" <<EOF
1,/---/s/---/---\rgithub_comments_issue_id: $ISSUE_ID/
wq
EOF
fi

echo "Markdown file updated with Issue ID: $ISSUE_ID"