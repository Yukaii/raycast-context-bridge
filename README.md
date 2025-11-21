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

## Docs

- Project structure and reconstruction notes: [docs/restoration.md](docs/restoration.md)
- Firefox behavior, origin limitation, and proxy workaround: [docs/firefox.md](docs/firefox.md)

## License / Usage

See `LICENSE` for terms; Raycast Technologies Ltd. retains all rights to the original product and assets.
