# Firefox notes

## Current limitation

The Raycast desktop app only accepts WebSocket handshakes from `chrome-extension://…` origins. Firefox uses `moz-extension://…` and extensions cannot override the `Origin` header, so the desktop app closes the handshake before the background script can register. You will see repeated `browserDidFocus` followed by `Firefox can’t establish a connection to the server at ws://localhost:7265 (code 1006)` because the background worker retries on focus.

Raycast has confirmed this header mismatch on Reddit:

> “Firefox uses different headers for its WebSocket connections for some unclear reasons (while all the other browsers use the same ones) - and the native APIs we use don’t handle those headers and reject the connection. So it's not just a matter of publishing.” — [u/pernielsentikaer (Raycast)](https://www.reddit.com/r/raycastapp/comments/1egrpu9/comment/lfxpbx7/)

You can reproduce the restriction without the desktop app:

```bash
npm run test:origin
```

The test mimics Raycast’s JSON-RPC bridge and asserts that a `chrome-extension://…` origin completes the `ping` request while `moz-extension://…` is rejected before JSON-RPC proceeds.

## Proxy workaround

To experiment with Firefox today, route traffic through the included Go WebSocket proxy. It accepts `moz-extension://…` from the browser, then reconnects to Raycast with a `chrome-extension://…` origin so the desktop app accepts the handshake.

```bash
# in one terminal
npm run proxy

# in Firefox, load dist/firefox after building
npm run build
```

The background worker automatically targets `ws://127.0.0.1:8787/<port>`. Adjust via environment variables (`RAYCAST_PROXY_HOST`, `RAYCAST_PROXY_PORT`, `RAYCAST_PROXY_TARGET_HOST`, `RAYCAST_PROXY_FORWARD_ORIGIN`) or CLI flags (see `proxy/cmd/raycast-proxy/main.go`). When Raycast eventually whitelists Firefox origins, shut down the proxy and connect directly.

### Building a standalone proxy binary

Build with Go if you prefer a single executable:

```bash
npm run proxy:build
```

Outputs `dist/raycast-proxy`, which you can copy into your `$PATH`.

### Install via Go

You can also install the proxy directly using `go install`:

```bash
go install github.com/Yukaii/raycast-context-bridge/proxy/cmd/raycast-proxy@latest
```

This installs the binary to your `$GOPATH/bin` (usually `~/go/bin`).

### macOS launchctl service

1. Copy the proxy binary to `/usr/local/bin/raycast-companion-proxy`.
2. Copy `launchd/raycast-companion-proxy.plist` to `~/Library/LaunchAgents/com.raycastcompanion.proxy.plist` (or `/Library/LaunchAgents`).
3. Load the agent: `launchctl load ~/Library/LaunchAgents/com.raycastcompanion.proxy.plist`.
4. Manage with `launchctl start/stop/unload com.raycastcompanion.proxy`.

Environment variables in the plist (`RAYCAST_PROXY_PORT`, `RAYCAST_PROXY_HOST`, etc.) control proxy behavior without rebuilding.

### Windows service

1. Build on Windows (`npm run proxy:build`) to get `dist/raycast-proxy.exe`.
2. Copy it and `windows/raycast-proxy-service.ps1` to a fixed path, e.g., `C:\Program Files\RaycastCompanion\`.
3. From an elevated PowerShell prompt:

   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
   .\windows\install-proxy-service.ps1 `
     -BinaryPath "C:\Program Files\RaycastCompanion\raycast-proxy.exe" `
     -ServiceScript "C:\Program Files\RaycastCompanion\raycast-proxy-service.ps1"
   ```

4. Start the service with `Start-Service RaycastCompanionProxy`. The script honors `RAYCAST_PROXY_*` environment variables for configuration.
