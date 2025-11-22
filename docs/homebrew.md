# Installing Raycast Proxy via Homebrew

This repository is not named `homebrew-*`, so tap it with a custom remote, then install the formula explicitly.

## Installation

```bash
brew tap Yukaii/raycast-context-bridge https://github.com/Yukaii/raycast-context-bridge
brew install Yukaii/raycast-context-bridge/raycast-proxy
```

## Using the Formula

After installation, you can:

```bash
# Run the proxy
raycast-proxy

# Run as a service
brew services start raycast-proxy

# View service logs
tail -f /opt/homebrew/var/log/raycast-proxy.log  # Apple Silicon
tail -f /usr/local/var/log/raycast-proxy.log     # Intel Mac

# Stop the service
brew services stop raycast-proxy

# Update to latest version
brew upgrade raycast-proxy

# Uninstall
brew uninstall raycast-proxy
```

## Updating the Formula

When you release a new version:

1. Update the `version` in `Formula/raycast-proxy.rb`
2. The SHA256 checksums will be calculated automatically by Homebrew on first install
3. Users can update with `brew upgrade raycast-proxy`

For manual SHA256 calculation:
```bash
shasum -a 256 raycast-proxy-darwin-arm64
shasum -a 256 raycast-proxy-darwin-amd64
```
