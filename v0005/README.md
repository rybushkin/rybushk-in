# rybushk.in v0005

Separate guestbook-enabled version of the `rybushk.in` terminal site.

## What Changed
- Added a new `guestbook` terminal command.
- Added a retro guestbook panel with:
  - public comments without registration,
  - optional name,
  - optional contact,
  - paginated feed,
  - seeded example entries.
- Added a local Node.js server with SQLite persistence.

## Runbook
### Trigger
Run this version locally or deploy it as a Node.js app instead of opening `index.html` directly from disk.

### Inputs
- Node.js 22+
- npm

### Steps
1. Install dependencies:
   `npm install`
2. Start the app:
   `npm start`
3. Open:
   [http://localhost:3000](http://localhost:3000)
4. In the terminal UI, type:
   `guestbook`

### Output Artifacts
- SQLite database: `data/guestbook.sqlite`
- Feature notes: `knowledge/features/guestbook-feature.md`
- Validation note: `knowledge/features/guestbook-feature-validation.md`

### Rollback And Retry
- Rollback: stop using `v0005` and return to untouched `v0004`.
- Reset guestbook data: delete `data/guestbook.sqlite` and restart the server to recreate schema and seed entries.
- Retry failed submission: wait 30 seconds if rate-limited, then submit again.

## API
- `GET /api/health`
- `GET /api/guestbook?page=1&limit=4`
- `POST /api/guestbook`

Example payload:

```json
{
  "name": "Anonymous fish",
  "contact": "@telegram",
  "message": "Hello from the terminal."
}
```

## Notes
- The server uses Node's built-in `node:sqlite` module, which currently prints an experimental warning on startup.
- The frontend expects to be served by the Node app so the guestbook API is available on the same origin.

## Verification
- `npm start` launches the site and API on port `3000`.
- `GET /api/guestbook` returns seeded entries and pagination metadata.
- `POST /api/guestbook` persists a new entry.
- Rapid repeated posts from the same IP return `429`.
