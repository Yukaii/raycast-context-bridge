# Raycast Context Bridge (Educational)

https://github.com/user-attachments/assets/1c153b5f-356a-415f-a18c-0155e16e152c

Reconstruction of the Raycast Companion browser extension for learning purposes. TypeScript sources mirror the original Parcel bundles while keeping the runtime behavior intact.

## Quick start

- `npm install`
- `npm run build`
- Chrome: load `dist/chrome` as an unpacked extension.
- Firefox: load `dist/firefox`. To produce a ZIP, run `npm run firefox:zip` (outputs `dist/firefox-artifacts/raycast-companion-firefox.zip`).

## Firefox install tips

- In `about:config`, set `xpinstall.signatures.required` to `false` to allow unsigned add-ons.
- In `about:addons`, use the gear menu → “Install Add-on From File…” (or drag the ZIP/`dist/firefox` onto the page) and select the ZIP.

## Firefox support

Raycast currently rejects `moz-extension://` origins, so the Firefox build needs the proxy workaround shown in the screencast. Follow the proxy setup steps in [docs/firefox.md](docs/firefox.md).

## Raycast Proxy Installation

The raycast-proxy is a WebSocket proxy server that enables the Firefox extension to communicate with Raycast by forwarding connections with the correct origin header.

**📖 For detailed installation instructions, see [docs/installation.md](docs/installation.md)**

### Quick Install (Recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/Yukaii/raycast-context-bridge/main/scripts/install.sh | bash
```

### Homebrew (macOS/Linux)

Since this repository doesn't follow Homebrew's naming convention, use the full formula URL:

```bash
brew install https://raw.githubusercontent.com/Yukaii/raycast-context-bridge/main/Formula/raycast-proxy.rb
```

### More Options

- **Download pre-built binaries**: See the [releases page](https://github.com/Yukaii/raycast-context-bridge/releases)
- **Build from source**: See [docs/installation.md](docs/installation.md#method-4-build-from-source)

## Docs

- **Raycast Proxy Installation**: [docs/installation.md](docs/installation.md)
- **Homebrew Installation Guide**: [docs/homebrew.md](docs/homebrew.md)
- Project structure and reconstruction notes: [docs/restoration.md](docs/restoration.md)
- Firefox behavior, origin limitation, and proxy workaround: [docs/firefox.md](docs/firefox.md)

## License / Usage

See `LICENSE` for terms; Raycast Technologies Ltd. retains all rights to the original product and assets.
