# Raycast Companion – Restored Sources

This repository contains a reverse–engineered version of the Raycast Companion browser extension. The original CRX bundle was unpacked and its Parcel modules were extracted into readable TypeScript sources that now live under `src/`.

## Restoration workflow

1. **Module extraction** – The original bundles (`content.903826e2.js`, `static/background/index.js`, `userScripts.b7259c65.js`) were parsed with `extract_modules.js` to recover individual Parcel modules. The recovered JS lives in `original_sources/`, alongside `background_modules.json` that maps hashed IDs to friendly file names.
2. **Source reconstruction** – Each recovered module was ported to TypeScript under `src/`, keeping the same APIs (content script, background service worker, user script, messaging helpers, etc.). Runtime-only dependencies (`@plasmohq/*`, `defuddle`, `he`) were reintroduced via `package.json`.
3. **Raycast bridge** – The private `@raycast/app` WebSocket bridge (module `eeKRu`) and its RPC error helpers were extracted and reimplemented in `src/lib/raycast.ts` / `src/lib/raycast-errors.ts` so the background script can talk to the desktop Raycast app just like the original extension.
4. **Build tooling** – `scripts/build.mjs` runs esbuild on the TypeScript sources to reproduce `content.js`, `background.js`, `user-script.js`, and copies the appropriate manifest (`manifest.json` for Chromium, `manifest.firefox.json` for Gecko), the restored Options page bundle, plus icons into per-browser directories under `dist/`. The original extraction script is stored as `scripts/extract_modules.js` for future investigations.

## Project structure

- `src/` – TypeScript sources for the content script, background worker, user script, and shared libraries.
- `assets/` – Extracted icons.
- `dist/` – Build output (`npm run build`), containing `chrome/` and `firefox/` bundles.
- `original_sources/` – Raw modules extracted from the original Parcel bundles (kept for reference).
- `scripts/` – Build script plus the original `extract_modules.js`.

## Building

```bash
npm install
npm run build
```

Load `dist/chrome` as an unpacked extension in Chromium-based browsers, or `dist/firefox` in Firefox (where the manifest switches to a persistent background script). The build currently emits a warning about `eval` inside the user script because the extension allows Raycast to execute snippets sent from the desktop app—this matches the original behavior and should only be changed if you plan to restrict that feature.
