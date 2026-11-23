# QA Studio AI PRO — transparent cutout assets

The gallery is implemented in `qa-cutouts.js`. It supports transparent PNG files for 100 animals, 101 human cutouts (a few contain two people), and an optional set of 8 large original cutouts.

## Publishing the assets to all visitors

Extract `QA_Studio_201_objektu_PNG.zip` into this directory so this folder contains:

- `assets/cutouts/manifest.json`
- `assets/cutouts/zvirata/001-lev.png` and all 99 other animal PNGs
- `assets/cutouts/lide/001-osoba-001.png` and all 100 other people PNGs

The app will automatically load the manifest from `./assets/cutouts/manifest.json` and fetch files lazily when users browse the gallery. This is a free reuse of pre-rendered images and **does not invoke external AI APIs**.

If the ZIP is **not** published on this website, users can import the same downloaded ZIP **once per browser/device** in the `🐾 Zvířata a lidé PNG` tab. The importer understands the provided ZIP_STORED format and stores individual blobs in IndexedDB.

The 8 larger files in `QA_Studio_8_HQ_objektu_PNG.zip` are optional and can also be extracted alongside the two categories; merge the accompanying manifest entries carefully to avoid overwriting the 201-entry manifest with a partial 8-entry manifest.

## Important

- The small thumbnails extracted from the 1536×1024 sheets are not equivalent to native HD portraits. Avoid claiming HD output for these assets.
- A few human cutouts contain couples, where a clean separation is not possible from the source sheet.
- Do not call the production website ready until credit accounting, AI cost guardrails, billing webhooks, and live payment flows are tested.
