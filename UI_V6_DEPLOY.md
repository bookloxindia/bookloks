# BookLoks UI v6 — exact deployment

## Why v5 looked unchanged
The previous package contained the new CSS, but the JavaScript Home renderer still used the older Home markup. v6 wires the Home/Chapter/Mission renderers to the new UI.

## Upload
1. Keep your existing `data/` folder.
2. Upload/replace `app/`.
3. Upload/replace `assets/logo/` only if GitHub asks; otherwise leave existing logo assets.
4. Commit changes.
5. Close the installed PWA completely and reopen it. The service worker cache is v6.

## New navigation
Home • Learn • Map • My Home • Profile

Home now includes quick links to My Collection and Store.

## Orientation
Map and My Home request landscape orientation on supported installed-PWA/mobile browsers. Quiz/normal learning screens remain portrait. If the browser does not allow orientation locking, the UI still switches to its landscape layout.
