# Raycast Context Bridge (Educational)

This repository collects a faithful reconstruction of the Raycast Companion browser extension for learning purposes. The original CRX bundle was unpacked and its Parcel modules translated into readable TypeScript, so the codebase looks like a normal extension project while still matching the behavior of the shipped build.

## Project structure

- `src/` – TypeScript sources for the content script, background worker, user script, and shared libraries.
- `assets/` – Extracted icons.
- `scripts/` – Build script (`build.mjs`) plus the extraction helper used during restoration (`extract_modules.js`).
- `dist/` – Build output, containing `chrome/` and `firefox/` bundles (`npm run build`).
- `original_sources/` – Reference artifacts extracted from the original bundles. These are read-only and kept for diffing.

## Restoration workflow

1. **Module extraction** – The original bundles (`content.903826e2.js`, `static/background/index.js`, `userScripts.b7259c65.js`) were parsed with `scripts/extract_modules.js` to recover individual Parcel modules. The recovered JS and lookup tables (`background_modules.json`, `raycast_modules*.json`) live under `original_sources/`.
2. **Source reconstruction** – Each recovered module was ported to TypeScript under `src/`, keeping the same APIs (content script, background service worker, user script, messaging helpers, etc.). Runtime-only dependencies (`@plasmohq/*`, `defuddle`, `he`) were reintroduced via `package.json`.
3. **Raycast bridge** – The private `@raycast/app` WebSocket bridge (module `eeKRu`) and its RPC error helpers were extracted and reimplemented in `src/lib/raycast.ts` so the background script can talk to the desktop Raycast app just like the original extension.
4. **Build tooling** – `scripts/build.mjs` runs esbuild on the TypeScript sources to produce `content.js`, `background.js`, `user-script.js`, the Options page bundle, and copies the appropriate manifest into per-browser directories under `dist/`.

## Building

```bash
npm install
npm run build
```

Load `dist/chrome` as an unpacked extension in Chromium-based browsers, or `dist/firefox` in Firefox (where the manifest switches to a persistent background script). Esbuild will warn about `eval` in the user script because the extension allows Raycast to execute snippets sent from the desktop app—this matches the original behavior, so leave it unless you plan to restrict that feature.

### Firefox support

The Firefox build exists to keep feature parity but the Raycast desktop app only accepts WebSocket handshakes from `chrome-extension://…` origins. Firefox always uses `moz-extension://…` and browsers do not allow extensions to override the `Origin` header, so the desktop app closes the handshake before our background script can register. The console will log repeated events such as `browserDidFocus` followed by `Firefox can’t establish a connection to the server at ws://localhost:7265 (code 1006)` because the background worker retries on every focus change, but the rejection happens in Raycast’s binary. Once the desktop app supports Firefox origins, the `dist/firefox` bundle will work without further changes.

You can reproduce this restriction locally without the desktop app by running the Node-based test suite:

```bash
npm run test:origin
```

The `tsx`-powered test mimics Raycast’s JSON-RPC bridge and asserts that a `chrome-extension://…` origin completes the `ping` request while the same handshake coming from `moz-extension://…` is terminated before JSON-RPC can proceed.

#### Firefox proxy workaround

To experiment with a working Firefox connection today, run the included WebSocket proxy. It accepts `moz-extension://…` origins from the browser, then reconnects to Raycast with a `chrome-extension://…` origin so the desktop app accepts the handshake.

```bash
# in one terminal
npm run proxy

# in Firefox, load dist/firefox after building
npm run build
```

The background worker automatically routes Firefox connections through `ws://127.0.0.1:8787/<port>`, so no extra configuration is needed as long as the proxy keeps running. Advanced usage can customize the proxy host, listen port, or forwarded origin via environment variables (`RAYCAST_PROXY_PORT`, `RAYCAST_PROXY_HOST`, `RAYCAST_PROXY_FORWARD_ORIGIN`, etc.) or CLI flags (see `scripts/raycast-proxy.ts` for the list). When the Raycast desktop app eventually whitelists Firefox origins, the proxy can be shut down and the Firefox build will connect directly again.

## License / Usage

These sources are shared for educational and archival purposes to illustrate how the original Raycast Companion extension worked. Raycast Technologies Ltd. retains all rights to the product and its assets. Please read the accompanying `LICENSE` notice before redistributing or attempting to ship derivative builds.
