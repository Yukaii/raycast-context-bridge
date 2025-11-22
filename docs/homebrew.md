# Installing Raycast Proxy via Homebrew

Since this repository doesn't follow Homebrew's standard naming convention (repositories must be named `homebrew-*` to use tap shortcuts), users need to specify the full formula URL.

## Installation Command

```bash
brew install https://raw.githubusercontent.com/Yukaii/raycast-context-bridge/main/Formula/raycast-proxy.rb
```

## Why not use `brew tap`?

Homebrew expects tap repositories to follow the naming convention `homebrew-<tapname>`. For example:
- `brew tap username/tools` looks for `username/homebrew-tools`
- `brew install username/tools/formula` works after tapping

Since this repository is named `raycast-companion-analysis` (not `homebrew-something`), we cannot use the tap shortcut. Instead, users must provide the full URL to the formula.

## Alternative: Create a Separate Tap Repository

If you want users to have a simpler installation command, you could:

1. Create a new repository: `Yukaii/homebrew-raycast`
2. Move `Formula/raycast-proxy.rb` to that repository
3. Users can then install with:
   ```bash
   brew tap Yukaii/raycast
   brew install raycast-proxy
   ```

## Using the Formula

After installation, users can:

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
