# Rybushk.in V0005 Decisions

## 2026-03-20
- Context: `v0004` already existed and should remain untouched.
- Chosen option: create a separate `v0005` copy and implement guestbook only there.
- Rationale: safer iteration, clear rollback path, and no risk to the live baseline.

## 2026-03-20
- Context: the original site is static and had no backend.
- Chosen option: add a single Node.js server that serves both static files and guestbook API endpoints.
- Rationale: same-origin fetches stay simple and local setup remains lightweight.

## 2026-03-20
- Context: guestbook needed persistence with minimal complexity.
- Chosen option: use SQLite with seeded entries and basic IP-based rate limiting.
- Rationale: enough for a first public prototype without introducing accounts or external services.

## Next Actions
- Revisit moderation needs before public deployment.
- Revisit database driver choice if experimental startup warnings become a problem.
