# Guestbook Feature

## Scope
- Create `rybushk.in - v0005` as an isolated copy of `v0004`.
- Add a retro guestbook with no registration.
- Support optional name and contact, required message, paginated public feed, and seeded example entries.

## Assumptions
- `v0004` remains unchanged and is the rollback reference.
- Frontend and backend run from the same Node.js server for simplest local deployment.
- SQLite persistence is sufficient for the first release.

## Decisions
- Use a new `guestbook` terminal command that opens a dedicated panel inside the monitor UI.
- Store entries in SQLite via `node:sqlite` to avoid introducing extra native database dependencies.
- Seed a handful of example messages on first run so the page is never empty.

## Next Actions
- Wire the frontend panel and API integration.
- Add pagination and submission states.
- Document startup and validation steps.
