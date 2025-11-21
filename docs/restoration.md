# Restoration notes

## Project structure

- `src/` – TypeScript sources for the content script, background worker, user script, and shared libraries.
- `assets/` – Extracted icons.
- `scripts/` – Build script (`build.mjs`) plus the extraction helper used during restoration (`extract_modules.js`).
- `dist/` – Build output, containing `chrome/` and `firefox/` bundles (`npm run build`).
- `original_sources/` – Reference artifacts extracted from the original bundles (kept for diffing).

## Restoration workflow

1. **Module extraction** – The original bundles (`content.903826e2.js`, `static/background/index.js`, `userScripts.b7259c65.js`) were parsed with `scripts/extract_modules.js` to recover individual Parcel modules. The recovered JS and lookup tables (`background_modules.json`, `raycast_modules*.json`) live under `original_sources/`.
2. **Source reconstruction** – Each recovered module was ported to TypeScript under `src/` with LLM-assisted rewrites, keeping the same APIs (content script, background service worker, user script, messaging helpers, etc.). Runtime-only dependencies (`@plasmohq/*`, `defuddle`, `he`) were reintroduced via `package.json`.
3. **Raycast bridge** – The private `@raycast/app` WebSocket bridge (module `eeKRu`) and its RPC error helpers were extracted and reimplemented in `src/lib/raycast.ts` so the background script can talk to the desktop Raycast app just like the original extension.
4. **Build tooling** – `scripts/build.mjs` runs esbuild on the TypeScript sources to produce `content.js`, `background.js`, `user-script.js`, the Options page bundle, and copies the appropriate manifest into per-browser directories under `dist/`.
