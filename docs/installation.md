# Raycast Proxy Installation Guide

This guide covers all the ways to install the Raycast Proxy server.

## What is Raycast Proxy?

The Raycast Proxy is a WebSocket proxy server that enables browser extensions (especially Firefox) to communicate with Raycast by forwarding WebSocket connections with the correct origin header. This is necessary because Raycast validates the `Origin` header and rejects connections from `moz-extension://` origins.

## Installation Methods

### Method 1: Quick Install Script (Recommended for Most Users)

The easiest way to install on any platform (macOS, Linux, Windows):

```bash
curl -fsSL https://raw.githubusercontent.com/Yukaii/raycast-context-bridge/main/scripts/install.sh | bash
```

This script will:
- Automatically detect your OS and architecture
- Download the appropriate binary from the latest release
- Install it to `/usr/local/bin` (or `~/bin` if no sudo access)
- Make it executable

After installation:
```bash
raycast-proxy
```

### Method 2: Homebrew (macOS/Linux)

**Note:** This repository doesn't follow Homebrew's naming convention, so you need to use the full formula URL.

```bash
brew install https://raw.githubusercontent.com/Yukaii/raycast-context-bridge/main/Formula/raycast-proxy.rb
```

#### Running as a Service

Start the service:
```bash
brew services start raycast-proxy
```

Check service status:
```bash
brew services list | grep raycast-proxy
```

View logs:
```bash
# Apple Silicon
tail -f /opt/homebrew/var/log/raycast-proxy.log

# Intel Mac
tail -f /usr/local/var/log/raycast-proxy.log
```

Stop the service:
```bash
brew services stop raycast-proxy
```

#### Updating

```bash
brew upgrade raycast-proxy
```

#### Uninstalling

```bash
brew uninstall raycast-proxy
```

### Method 3: Manual Download

1. Visit the [Releases page](https://github.com/Yukaii/raycast-context-bridge/releases)
2. Download the appropriate binary for your platform:
   - **macOS Intel**: `raycast-proxy-darwin-amd64`
   - **macOS Apple Silicon**: `raycast-proxy-darwin-arm64`
   - **Linux x64**: `raycast-proxy-linux-amd64`
   - **Linux ARM64**: `raycast-proxy-linux-arm64`
   - **Windows x64**: `raycast-proxy-windows-amd64.exe`
   - **Windows ARM64**: `raycast-proxy-windows-arm64.exe`

3. Make it executable (Unix-like systems):
   ```bash
   chmod +x raycast-proxy-*
   ```

4. Optionally move it to a directory in your PATH:
   ```bash
   sudo mv raycast-proxy-* /usr/local/bin/raycast-proxy
   ```

5. Run it:
   ```bash
   ./raycast-proxy  # or just 'raycast-proxy' if in PATH
   ```

### Method 4: Build from Source

Requirements:
- Go 1.22 or later
- Git

```bash
# Clone the repository
git clone https://github.com/Yukaii/raycast-context-bridge.git
cd raycast-companion-analysis/proxy

# Build
go build -o raycast-proxy ./cmd/raycast-proxy

# Run
./raycast-proxy
```

For optimized builds (smaller binary size):
```bash
go build -ldflags="-s -w" -trimpath -o raycast-proxy ./cmd/raycast-proxy
```

## Configuration

The proxy can be configured using environment variables or command-line flags:

| Environment Variable | Flag | Default | Description |
|---------------------|------|---------|-------------|
| `RAYCAST_PROXY_HOST` | `--listen-host` | `127.0.0.1` | Host to listen on |
| `RAYCAST_PROXY_PORT` | `--listen-port` | `8787` | Port to listen on |
| `RAYCAST_PROXY_TARGET_HOST` | `--target-host` | `127.0.0.1` | Raycast host to connect to |
| `RAYCAST_PROXY_FORWARD_ORIGIN` | `--forward-origin` | `chrome-extension://raycast-proxy` | Origin header to forward |

### Examples

Run on a different port:
```bash
raycast-proxy --listen-port 9999
```

Using environment variables:
```bash
RAYCAST_PROXY_PORT=9999 raycast-proxy
```

Custom origin and target:
```bash
raycast-proxy --forward-origin "moz-extension://custom-id" --target-host "192.168.1.100"
```

## Running as a System Service

### macOS (using launchd)

If you didn't install via Homebrew, you can manually set up a launchd service:

1. Create a plist file at `~/Library/LaunchAgents/com.raycast.proxy.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.raycast.proxy</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/raycast-proxy</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/raycast-proxy.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/raycast-proxy.log</string>
</dict>
</plist>
```

2. Load the service:
```bash
launchctl load ~/Library/LaunchAgents/com.raycast.proxy.plist
```

3. Unload the service:
```bash
launchctl unload ~/Library/LaunchAgents/com.raycast.proxy.plist
```

### Linux (using systemd)

1. Create a service file at `/etc/systemd/system/raycast-proxy.service`:

```ini
[Unit]
Description=Raycast WebSocket Proxy
After=network.target

[Service]
Type=simple
User=your-username
ExecStart=/usr/local/bin/raycast-proxy
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

2. Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable raycast-proxy
sudo systemctl start raycast-proxy
```

3. Check status:
```bash
sudo systemctl status raycast-proxy
```

4. View logs:
```bash
sudo journalctl -u raycast-proxy -f
```

### Windows (using NSSM)

1. Download [NSSM](https://nssm.cc/download)
2. Install the service:
```cmd
nssm install RaycastProxy "C:\path\to\raycast-proxy.exe"
nssm start RaycastProxy
```

Or use Windows Task Scheduler to run at startup.

## Verifying Installation

Check if the proxy is running:
```bash
curl http://127.0.0.1:8787/7261
```

You should see a WebSocket upgrade error (this is normal - it means the server is responding).

## Troubleshooting

### Port already in use
If port 8787 is already in use, specify a different port:
```bash
raycast-proxy --listen-port 8788
```

### Permission denied
On Unix-like systems, if you get a "permission denied" error, make sure the binary is executable:
```bash
chmod +x raycast-proxy
```

### Binary not found
Make sure the directory containing the binary is in your PATH, or use the full path to run it.

### Homebrew installation fails
If the Homebrew installation fails, try:
1. Update Homebrew: `brew update`
2. Clear cache: `rm -rf "$(brew --cache)"`
3. Try again

## Uninstallation

### Quick install / Manual download
```bash
# Remove the binary
sudo rm /usr/local/bin/raycast-proxy
# or
rm ~/bin/raycast-proxy
```

### Homebrew
```bash
brew uninstall raycast-proxy
```

### From source
Just delete the cloned repository and the binary.

## Getting Help

- For issues with the proxy: [Open an issue](https://github.com/Yukaii/raycast-context-bridge/issues)
- For Firefox extension setup: See [docs/firefox.md](firefox.md)
- For general usage: Check the main [README](../README.md)
