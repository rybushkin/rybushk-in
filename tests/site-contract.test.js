const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('active content contains no Russia-origin markers', () => {
  const files = [
    'texts.js',
    'content-md/boot.md',
    'content-md/commands/help.md',
    'content-md/commands/menu.md',
  ];
  const forbidden = /RUS\s*[→>-]\s*UK|\bRUSSIA\b|\bRUSSIAN\b|росси(я|и|ей|ю|ей|ях|ями)?/iu;

  for (const file of files) {
    assert.doesNotMatch(read(file), forbidden, file);
  }
});

test('site exposes the v5.5 DOOM command contract', () => {
  const index = read('index.html');
  const texts = read('texts.js');
  const help = read('content-md/commands/help.md');
  const menu = read('content-md/commands/menu.md');
  const changelog = read('CHANGELOG.md');

  assert.match(index, /id="header-version">v\.5\.5<\/span>/);
  assert.match(index, /SITE_BUILD_VERSION\s*=\s*['"]v5\.5['"]/);
  assert.match(index, /doom\//);
  assert.doesNotMatch(index, /dos\.zone\/player|js-dos\.com\/6\.22|game-doom\.js|id="doom-container"/);
  assert.match(texts, /Available:.*doom/);
  assert.match(texts, /• doom/);
  assert.match(help, /doom/);
  assert.match(menu, /doom/);
  assert.match(changelog, /## v5\.5\b/);
});

test('standalone DOOM page uses a local bundle and explicit missing-bundle state', () => {
  const page = read('doom/index.html');
  const script = read('doom/doom.js');
  const styles = read('doom/doom.css');

  assert.match(page, /v8\.js-dos\.com\/latest\/js-dos\.css/);
  assert.match(page, /v8\.js-dos\.com\/latest\/js-dos\.js/);
  assert.match(page, /doom\.js/);
  assert.match(script, /\.\/doom\.jsdos/);
  assert.match(script, /Dos\(/);
  assert.match(script, /mouseCapture\s*:\s*false/);
  assert.match(script, /bundle.*missing|missing.*bundle|bundle.*not.*found/i);
  assert.match(script, /\.\.\//);
  assert.match(styles, /@media/);
  assert.match(styles, /sidebar/);
  assert.match(styles, /bg-black\/70/);
  assert.match(page, /doom-mobile-gate/);
  assert.match(script, /pointer:\s*coarse|max-width:\s*700px/);
  assert.match(styles, /doom-mobile-gate/);
});

test('terminal DOOM opens an inline responsive player', () => {
  const index = read('index.html');
  const script = read('doom/doom-inline.js');
  const styles = read('styles-ascii.css');

  assert.match(index, /id="doom-inline-panel"/);
  assert.match(index, /doom-inline\.js/);
  assert.match(index, /doomInlinePlayer\.open\(\)/);
  assert.doesNotMatch(index, /window\.location\.href\s*=\s*['"]doom\//);
  assert.doesNotMatch(index, /doom-inline-header|doom-inline-fullscreen|doom-inline-close/);
  assert.match(script, /doom\/doom\.jsdos/);
  assert.match(script, /v8\.js-dos\.com\/latest\/js-dos\.js/);
  assert.match(script, /Dos\(/);
  assert.match(script, /mouseCapture\s*:\s*false/);
  assert.match(script, /classList\.add\(['"]doom-mode['"]\)/);
  assert.match(script, /classList\.remove\(['"]doom-mode['"]\)/);
  assert.match(styles, /doom-inline-panel/);
  assert.match(styles, /sidebar/);
  assert.match(styles, /bg-black\/70/);
  assert.match(index, /doom-mobile-gate/);
  assert.match(script, /pointer:\s*coarse|max-width:\s*700px/);
  assert.match(styles, /aspect-ratio:\s*4\s*\/\s*3/);
  assert.match(styles, /\.monitor\.doom-mode[\s\S]*\.monitor-header[\s\S]*display:\s*none/);
  assert.match(styles, /\.monitor\.doom-mode[\s\S]*\.monitor-footer[\s\S]*display:\s*none/);
  assert.match(styles, /\.monitor\.doom-mode[\s\S]*\.doom-inline-panel/);
  assert.match(styles, /\.monitor\.doom-mode[\s\S]*\.doom-inline-player/);
});

test('DOOM setup documentation defines the js-dos bundle contract', () => {
  const readme = read('doom/README.md');

  assert.match(readme, /Game Studio v8/i);
  assert.match(readme, /\.jsdos\/dosbox\.conf/);
  assert.match(readme, /DOOM\.EXE/);
  assert.match(readme, /doom1\.wad/);
  assert.match(readme, /autoexec|command/i);
});
