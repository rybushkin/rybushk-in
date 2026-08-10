# Inline terminal DOOM

## Status

Approved design for implementation.

## Goal

Make the `doom` terminal command open a small, playable DOOM window inside the
existing terminal instead of navigating away from the terminal. Keep the
standalone `/doom/` page as the full-page mode.

## Chosen approach

Use a native inline panel in the existing terminal DOM and initialize js-dos v8
directly in its player element. The panel uses the already checked-in local
`doom/doom.jsdos` bundle and the same official CDN runtime as `/doom/`.

An iframe was rejected because it would duplicate the page chrome, complicate
focus and close behavior, and create a nested navigation context. A separate
embedded page component was rejected as unnecessary for this static site.

## Interaction

- Typing `doom` prints the command and opens an inline panel in the terminal.
- The panel is approximately 560×350 on desktop and never exceeds the
  available terminal width.
- The panel header contains a compact label, `fullscreen`, and `close`.
- `fullscreen` uses the js-dos fullscreen API when available and falls back to
  the browser fullscreen API.
- `close` destroys or releases the inline player, hides the panel, and returns
  focus to the terminal input without leaving the page.
- Reopening `doom` reuses the panel safely or creates a fresh player without
  creating duplicate runtimes.

## Mobile behavior

The inline panel works in portrait mode and does not require forced device
rotation. The player scales to the available width and keeps the game canvas
pixelated. js-dos touch controls remain available. On narrow screens the
fullscreen action is still available; rotating to landscape is an optional
comfort improvement, not a prerequisite for loading or playing.

## Components and data flow

1. `commands.doom` appends the terminal command and calls the inline player
   opener instead of changing `window.location`.
2. A small panel is created or revealed below the command output.
3. A shared loader adds the js-dos v8 CSS/runtime only once and waits for the
   local bundle preflight to succeed.
4. `Dos(player, { url: 'doom/doom.jsdos', ... })` starts the game.
5. Runtime and bundle errors are rendered inside the panel with a readable
   recovery message; the terminal remains usable.
6. Closing the panel releases the player reference, removes the panel state,
   and restores terminal focus.

The standalone `/doom/` implementation remains unchanged except for sharing
small, clearly scoped helper behavior if that avoids duplication.

## Visual treatment

The panel follows the existing green CRT terminal language: thin green border,
dark background, compact monospace title bar, and a responsive game viewport.
The game area uses the native js-dos controls and pixelated rendering rather
than a second custom control layer.

## Failure handling

- Missing `doom/doom.jsdos`: show an inline setup message and a link to
  `doom/README.md`.
- CDN/runtime failure: show a runtime-unavailable message and keep the
  terminal input active.
- Repeated open/close: avoid duplicate script tags and dispose the prior
  player before starting another instance.

## Verification

- Contract tests assert that `doom` no longer redirects from `index.html` and
  that the inline panel hooks, local bundle, controls, and responsive styles
  exist.
- Existing site tests, syntax checks, and `git diff --check` remain green.
- Browser verification covers desktop rendering, visible in-game canvas,
  close-and-return behavior, fullscreen control, and a 390px mobile viewport
  without horizontal overflow or mandatory rotation.
