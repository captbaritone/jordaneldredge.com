#!/bin/bash
set -e

INSTALL_DIR="$HOME/bin"
BINARY_NAME="je"

# Detect platform
OS="$(uname -s)"
ARCH="$(uname -m)"

if [ "$OS" != "Darwin" ]; then
  echo "Error: Only macOS is currently supported."
  exit 1
fi

if [ "$ARCH" = "arm64" ]; then
  URL="https://capt.dev/file/SZDJoQnNI2jOMSZxx85Jf/je-darwin-arm64"
elif [ "$ARCH" = "x86_64" ]; then
  URL="https://capt.dev/file/ZVixFENQ7JlaruEzq2KdV/je-darwin-x64"
else
  echo "Error: Unsupported architecture: $ARCH"
  exit 1
fi

echo "Downloading je for macOS ($ARCH)..."
mkdir -p "$INSTALL_DIR"
curl -fsSL "$URL" -o "$INSTALL_DIR/$BINARY_NAME"
chmod +x "$INSTALL_DIR/$BINARY_NAME"

# Check if ~/bin is in PATH
if ! echo "$PATH" | grep -q "$HOME/bin"; then
  SHELL_NAME="$(basename "$SHELL")"
  if [ "$SHELL_NAME" = "zsh" ]; then
    RC_FILE="$HOME/.zshrc"
  else
    RC_FILE="$HOME/.bashrc"
  fi
  echo 'export PATH="$HOME/bin:$PATH"' >> "$RC_FILE"
  echo "Added ~/bin to PATH in $RC_FILE"
  echo "Run 'source $RC_FILE' or open a new terminal to use je."
fi

echo "Installed je to $INSTALL_DIR/$BINARY_NAME"
echo ""
echo "Get started:"
echo "  je login"
echo "  je paste list"
echo "  je --help"
