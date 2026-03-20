# CHANGELOG

## v5.2 - 2026-03-20
- bumped the visible site version to `v.5.2`
- added terminal command `changelog` to read this file from inside the site
- logged the build history directly in the repo so future changes can be tracked
- kept the guestbook flow, but updated the panel heading to match the newer build number

## v5.1 - 2026-03-20
- added glitch-style opening animation for the guestbook panel
- redesigned the close button into a more square, filled, pixel-ish block control
- improved the visual feel of the guestbook entrance so it lands like a proper screen reveal

## v5.0 - 2026-03-20
- created `rybushk.in - v0005` as a separate copy of `v0004`, leaving the previous version untouched
- built a real guestbook with `Node.js + Express + SQLite`
- added public comments without registration, optional name, optional contact, and paginated feed
- seeded demo guestbook entries so the page is never empty
- added `guestbook` command to open the dedicated panel inside the terminal UI
- wrote runbook and validation notes for the new version

## Session Notes
- asked for a separate new site version instead of changing `v0004`
- added the guestbook backend and frontend flow
- opened the local build in the browser and checked the guestbook
- refined the guestbook visuals, including glitch animation and square close button
- added preloader and post-boot promo text for the guestbook
- fixed a bug where the preloader only showed the warning block and hid the new promo copy
- expanded the preloader into a typed old-school message with cursor, ASCII plaque, and invitation to leave reviews
