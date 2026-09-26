# Exact GitHub update steps

1. Extract this ZIP.
2. Open the extracted folder.
3. Open the `app` folder.
4. On GitHub open repository `bookloks`.
5. Open the existing `app` folder.
6. Use `Add file → Upload files`.
7. Upload the contents of this `app` folder so that the GitHub paths remain:
   - `app/index.html`
   - `app/style.css`
   - `app/app.js`
   - `app/manifest.json`
   - `app/sw.js`
   - `app/assets/img/...`
   - `app/assets/audio/...`
8. Commit changes.
9. Wait about 1–2 minutes.
10. Open:
   https://bookloxindia.github.io/bookloks/app/
11. On an existing PWA, close it fully and reopen it once so the new service-worker version can install.

Do not upload or change `data/` in Phase 1.
