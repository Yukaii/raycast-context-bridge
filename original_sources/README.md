# Original Sources

This folder contains the raw artifacts extracted from the original Raycast Companion CRX bundle. They are preserved for reference only so we can diff the restored TypeScript sources against the original Parcel modules.

- `restored_modules/`, `restored_background_modules/` – Decompiled modules that were used to rebuild `src/`.
- `background_modules.json`, `raycast_modules*.json` – Lookup tables that translate Parcel’s numeric IDs back to the friendly filenames we use in this repo.

If you need to repeat the extraction workflow, use the maintained script at `scripts/extract_modules.js`. The duplicate helper that previously lived in this directory was removed so there is a single authoritative copy under `scripts/`.
