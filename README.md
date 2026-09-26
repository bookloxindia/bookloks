# BookLoks — Phase 1 Web Starter

This repository is the Phase 1 migration of the BookLoks v3.8 MVP to a web-first, chapter-wise JSON architecture.

## What is included
- `app/` — web app shell, UI, styles, and runtime loader
- `data/manifest.json` — chapter/track metadata and file map
- `data/<track>/chNN.json` — one JSON file per active chapter
- `data/<track>/futureNN.json` — five reserved future chapter slots per track
- `data/CHAPTER_TEMPLATE.json` — schema/content template for future enrichment
- `assets/logo/` — BookLoks logo + icon

## Current migration
- 126 active chapter records
- 1,890 current MVP questions
- Current MVP question pool remains 15 per active chapter
- Mathematics workbook is merged into the Mathematics track as practice source
- Chapter JSON is loaded when the selected mission starts; the browser does not need all question banks in the initial app payload

## Phase 1 operating model
Edit a chapter JSON file in GitHub, commit the change, and the web app reads the updated JSON on the next load.

## Important
The current MVP curriculum/content layer is a testing dataset. Before public academic publishing, Phase 2 should validate and expand chapter explanations, mission contexts, Quick Check content, and question banks.

## Suggested deployment
Use GitHub Pages first for simple testing. Cloudflare Pages can be connected to the same GitHub repository later.
