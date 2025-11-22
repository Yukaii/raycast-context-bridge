#!/bin/bash
# Raycast Proxy Installation Script
# Usage: curl -fsSL https://raw.githubusercontent.com/Yukaii/raycast-context-bridge/main/scripts/install.sh | bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

echo -e "${GREEN}Raycast Proxy Installer${NC}"
echo "Detecting system..."
echo "OS: $OS"
echo "Architecture: $ARCH"

# Map architecture names
case $ARCH in
    x86_64|amd64)
        ARCH="amd64"
        ;;
    aarch64|arm64)
        ARCH="arm64"
        ;;
    *)
        echo -e "${RED}Unsupported architecture: $ARCH${NC}"
        exit 1
        ;;
esac

# Map OS names
case $OS in
    linux)
        BINARY_NAME="raycast-proxy-linux-${ARCH}"
        ;;
    darwin)
        BINARY_NAME="raycast-proxy-darwin-${ARCH}"
        ;;
    msys*|mingw*|cygwin*|windows*)
        OS="windows"
        BINARY_NAME="raycast-proxy-windows-${ARCH}.exe"
        ;;
    *)
        echo -e "${RED}Unsupported operating system: $OS${NC}"
        exit 1
        ;;
esac

# Get latest release tag
echo "Fetching latest release..."
LATEST_RELEASE=$(curl -fsSL https://api.github.com/repos/Yukaii/raycast-context-bridge/releases/latest | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')

if [ -z "$LATEST_RELEASE" ]; then
    echo -e "${YELLOW}No release found, using latest pre-release...${NC}"
    LATEST_RELEASE=$(curl -fsSL https://api.github.com/repos/Yukaii/raycast-context-bridge/releases | grep '"tag_name"' | head -1 | sed -E 's/.*"([^"]+)".*/\1/')
fi

if [ -z "$LATEST_RELEASE" ]; then
    echo -e "${RED}Failed to fetch latest release${NC}"
    exit 1
fi

echo "Latest release: $LATEST_RELEASE"

# Download URL
DOWNLOAD_URL="https://github.com/Yukaii/raycast-context-bridge/releases/download/${LATEST_RELEASE}/${BINARY_NAME}"

echo "Downloading from: $DOWNLOAD_URL"

# Determine install directory
if [ "$OS" = "windows" ]; then
    INSTALL_DIR="$HOME/bin"
    BINARY_PATH="$INSTALL_DIR/raycast-proxy.exe"
else
    # Try to install to /usr/local/bin if we have permissions, otherwise use ~/bin
    if [ -w /usr/local/bin ]; then
        INSTALL_DIR="/usr/local/bin"
    else
        INSTALL_DIR="$HOME/bin"
    fi
    BINARY_PATH="$INSTALL_DIR/raycast-proxy"
fi

# Create install directory if it doesn't exist
mkdir -p "$INSTALL_DIR"

# Download binary
echo "Downloading raycast-proxy..."
if ! curl -fsSL -o "$BINARY_PATH" "$DOWNLOAD_URL"; then
    echo -e "${RED}Failed to download binary${NC}"
    exit 1
fi

# Make executable (Unix-like systems)
if [ "$OS" != "windows" ]; then
    chmod +x "$BINARY_PATH"
fi

echo -e "${GREEN}Successfully installed raycast-proxy to $BINARY_PATH${NC}"

# Check if install directory is in PATH
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo -e "${YELLOW}Warning: $INSTALL_DIR is not in your PATH${NC}"
    echo "Add it to your PATH by adding this line to your shell config (~/.bashrc, ~/.zshrc, etc.):"
    echo "  export PATH=\"\$PATH:$INSTALL_DIR\""
fi

echo ""
echo "Usage:"
echo "  raycast-proxy                    # Start the proxy server"
echo "  raycast-proxy --help             # Show help"
echo ""
echo "Configuration:"
echo "  RAYCAST_PROXY_PORT=9999 raycast-proxy"
echo "  raycast-proxy --listen-port 9999"
echo ""
echo "For more information, visit:"
echo "  https://github.com/Yukaii/raycast-context-bridge"
