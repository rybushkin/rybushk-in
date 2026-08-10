# Local DOOM setup

The public player lives at `https://rybushk.in/doom/` and expects one local
bundle at:

```text
doom/doom.jsdos
```

The page uses the official js-dos v8 runtime from the CDN, but the game bundle
is served by this site. The runtime must be loaded over HTTP(S); `file://`
opening is not supported by js-dos.

The checked-in bundle is the DOOM shareware v1.9 episode-one build. It contains
`DOOM.EXE` and `doom1.wad`; the WAD SHA-1 is
`5b2e249b9c5133ec987b3ea77596381dc0d6bc1d`. No registered `DOOM.WAD` or DOOM
II data is included.

## Create the bundle

1. Start with a legally obtained DOOM shareware archive, such as `doom19s.zip`.
2. Extract `DOOM.EXE` and `doom1.wad`.
3. Open [Game Studio v8](https://dos.zone/studio-v8/).
4. Create a DOS game bundle and upload `DOOM.EXE` and `doom1.wad`.
5. Set the auto-start command to `DOOM.EXE`.
6. Download the generated `.jsdos` file as `doom.jsdos`.
7. Put it in this directory and publish the active `_git` tree.

Starting with js-dos 7+, a bundle must contain `.jsdos/dosbox.conf`. Game
Studio writes that configuration for you; the bundle should also contain the
DOOM executable and WAD at the paths used by the auto-start command.

## Local verification

Run a local HTTP server from the active `_git` directory:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/doom/` for the standalone player. The terminal
command `doom` opens the compact player inside the terminal screen.

Do not add commercial DOOM II or full-game WAD files to this repository.
