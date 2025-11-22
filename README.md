# Raycast Context Bridge (Educational)

https://github.com/user-attachments/assets/1c153b5f-356a-415f-a18c-0155e16e152c

Reconstruction of the Raycast Companion browser extension for learning purposes. TypeScript sources mirror the original Parcel bundles while keeping the runtime behavior intact.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Extension Installation](#extension-installation)
- [Raycast Proxy Installation](#raycast-proxy-installation)
- [Documentation](#documentation)
- [License](#license--usage)

## Overview

This project provides:
- 🌐 **Browser Extension**: Reconstructed Raycast Companion extension for Chrome and Firefox
- 🔄 **WebSocket Proxy**: Server that enables Firefox to communicate with Raycast (required for Firefox due to origin restrictions)
- 📦 **Multiple Installation Options**: Install scripts, Homebrew formula, and pre-built binaries for all platforms

## Quick Start

### For Chrome Users

1. Clone and build:
   ```bash
   git clone https://github.com/Yukaii/raycast-context-bridge.git
   cd raycast-context-bridge
   npm install && npm run build
   ```

2. Load `dist/chrome` as an unpacked extension in Chrome

### For Firefox Users

1. Install the proxy server (required):
   ```bash
   curl -fsSL https://raw.githubusercontent.com/Yukaii/raycast-context-bridge/main/scripts/install.sh | bash
   ```

2. Build and load the extension:
   ```bash
   npm install && npm run build
   # Load dist/firefox in Firefox (or run npm run firefox:zip)
   ```

3. Start the proxy:
   ```bash
   raycast-proxy
   ```

## Extension Installation

### Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the extension:**
   ```bash
   npm run build
   ```

3. **Load the extension in your browser:**
   - **Chrome**: Load `dist/chrome` as an unpacked extension
   - **Firefox**: Load `dist/firefox` or create a ZIP with `npm run firefox:zip` (outputs to `dist/firefox-artifacts/raycast-companion-firefox.zip`)

### Firefox Installation Tips

1. In `about:config`, set `xpinstall.signatures.required` to `false` to allow unsigned add-ons
2. In `about:addons`, use the gear menu → "Install Add-on From File…" (or drag the ZIP onto the page)
3. **Important**: Firefox requires the proxy server (see below) due to origin restrictions

### Firefox Proxy Requirement

Raycast currently rejects `moz-extension://` origins, so the Firefox extension requires the proxy workaround. See the [Firefox guide](docs/firefox.md) for details.

## Raycast Proxy Installation

The raycast-proxy is a WebSocket proxy server that enables the Firefox extension to communicate with Raycast by forwarding connections with the correct origin header.

### Quick Install

Choose one of the following installation methods:

#### Option 1: Install Script (One-liner)

Works on macOS, Linux, and Windows. Automatically detects your platform and installs the latest release:

```bash
curl -fsSL https://raw.githubusercontent.com/Yukaii/raycast-context-bridge/main/scripts/install.sh | bash
```

#### Option 2: Homebrew (macOS/Linux)

```bash
# Tap the repository
brew tap Yukaii/raycast-context-bridge

# Install
brew install raycast-proxy

# Start the proxy
raycast-proxy

# Or run as a background service
brew services start raycast-proxy
```

#### Option 3: Download Pre-built Binaries

1. Download the binary for your platform from the [releases page](https://github.com/Yukaii/raycast-context-bridge/releases)
2. Make it executable: `chmod +x raycast-proxy-*`
3. Run it: `./raycast-proxy-*`

**Available platforms:**
- macOS (Intel & Apple Silicon)
- Linux (x64 & ARM64)
- Windows (x64 & ARM64)

#### Option 4: Build from Source

```bash
cd proxy
go build -o raycast-proxy ./cmd/raycast-proxy
./raycast-proxy
```

### Configuration

Configure the proxy using environment variables or command-line flags:

```bash
# Using flags
raycast-proxy --listen-port 9999

# Using environment variables
RAYCAST_PROXY_PORT=9999 raycast-proxy
```

| Environment Variable | Flag | Default | Description |
|---------------------|------|---------|-------------|
| `RAYCAST_PROXY_HOST` | `--listen-host` | `127.0.0.1` | Host to listen on |
| `RAYCAST_PROXY_PORT` | `--listen-port` | `8787` | Port to listen on |
| `RAYCAST_PROXY_TARGET_HOST` | `--target-host` | `127.0.0.1` | Raycast host to connect to |
| `RAYCAST_PROXY_FORWARD_ORIGIN` | `--forward-origin` | `chrome-extension://raycast-proxy` | Origin header forwarded to Raycast |

### Additional Resources

📖 **[Complete Installation Guide](docs/installation.md)** - Detailed instructions for all platforms, service setup, and troubleshooting

📦 **[Homebrew Guide](docs/homebrew.md)** - Homebrew-specific documentation and tips

## Documentation

- 📖 **[Proxy Installation Guide](docs/installation.md)** - Complete proxy installation instructions for all platforms
- 🍺 **[Homebrew Guide](docs/homebrew.md)** - Homebrew-specific documentation and tips
- 🦊 **[Firefox Setup](docs/firefox.md)** - Firefox behavior, origin limitation, and proxy workaround
- 🔧 **[Project Structure](docs/restoration.md)** - Reconstruction notes and project structure

## License / Usage

See `LICENSE` for terms; Raycast Technologies Ltd. retains all rights to the original product and assets.
