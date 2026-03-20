# Rybushk.in V0005

## Context
- `v0005` is an isolated copy of `v0004`.
- Purpose: prototype a public retro guestbook without changing the existing site version.

## Constraints
- Keep the original terminal aesthetic and command model.
- Require no registration for posting.
- Persist entries locally with lightweight infrastructure.

## Current State
- Frontend guestbook panel is wired into `index.html`.
- Guestbook texts are stored in `texts.js`.
- Styling lives in `styles-ascii.css`.
- Backend and SQLite persistence are handled by `server.js`.

## Next Actions
- Run visual QA in browser on desktop and mobile sizes.
- Decide whether to keep `node:sqlite` or swap to another SQLite driver before deployment.
