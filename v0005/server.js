const express = require('express');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DB_PATH = path.join(DATA_DIR, 'guestbook.sqlite');

const RATE_LIMIT_WINDOW_MS = 30 * 1000;
const recentSubmissions = new Map();

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

ensureDataDir();

const db = new DatabaseSync(DB_PATH);

function cleanInput(value, maxLength) {
  if (typeof value !== 'string') return '';

  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
    .slice(0, maxLength);
}

function hashIp(rawIp) {
  return crypto
    .createHash('sha256')
    .update(rawIp || 'unknown')
    .digest('hex');
}

function serializeEntry(row) {
  return {
    id: row.id,
    name: row.author_name,
    contact: row.contact || '',
    message: row.message,
    createdAt: row.created_at,
  };
}

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS guestbook_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_name TEXT NOT NULL,
      contact TEXT DEFAULT '',
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'published',
      ip_hash TEXT NOT NULL
    );
  `);

  const countRow = db.prepare('SELECT COUNT(*) AS count FROM guestbook_entries').get();
  if (countRow.count > 0) return;

  const seedEntries = [
    {
      name: 'Anonymous fish',
      contact: '',
      message: 'Found this terminal by accident. Stayed for the CRT glow and mild existential comfort.',
    },
    {
      name: 'Masha',
      contact: '@mashawrites',
      message: 'Very 90s, very alive. Feels like the internet before it became a shopping mall.',
    },
    {
      name: 'Old modem wizard',
      contact: 'wizard@dialup.zone',
      message: 'Typed "help", got charm. Typed "guestbook", got nostalgia. 10/10 packet loss experience.',
    },
    {
      name: 'Tim',
      contact: '',
      message: 'Papa, this is cool. Keep the fish. Add more secrets.',
    },
    {
      name: 'Late-night visitor',
      contact: '',
      message: 'The best portfolio mood is when it feels like a machine is happy you are here.',
    },
    {
      name: 'Retro UI appreciator',
      contact: 'https://example.com/radical-interfaces',
      message: 'Guestbook confirmed: text-first interfaces still hit harder than glossy templates.',
    },
  ];

  const insertSeed = db.prepare(`
    INSERT INTO guestbook_entries (author_name, contact, message, status, ip_hash)
    VALUES (?, ?, ?, 'published', ?)
  `);

  for (const entry of seedEntries) {
    insertSeed.run(entry.name, entry.contact, entry.message, 'seed');
  }
}

initDatabase();

app.use(express.json({ limit: '16kb' }));

app.use((req, res, next) => {
  const blockedPrefixes = ['/node_modules', '/data', '/server', '/knowledge'];
  const blockedExact = ['/package.json', '/package-lock.json', '/server.js'];

  if (blockedExact.includes(req.path) || blockedPrefixes.some((prefix) => req.path.startsWith(prefix))) {
    res.status(404).send('Not found');
    return;
  }

  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'guestbook-api' });
});

app.get('/api/guestbook', (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(20, Math.max(1, Number.parseInt(req.query.limit, 10) || 5));
  const offset = (page - 1) * limit;

  const totalRow = db
    .prepare("SELECT COUNT(*) AS count FROM guestbook_entries WHERE status = 'published'")
    .get();

  const rows = db
    .prepare(`
      SELECT id, author_name, contact, message, created_at
      FROM guestbook_entries
      WHERE status = 'published'
      ORDER BY datetime(created_at) DESC, id DESC
      LIMIT ? OFFSET ?
    `)
    .all(limit, offset);

  res.json({
    items: rows.map(serializeEntry),
    pagination: {
      page,
      limit,
      totalItems: totalRow.count,
      totalPages: Math.max(1, Math.ceil(totalRow.count / limit)),
      hasPrev: page > 1,
      hasNext: offset + rows.length < totalRow.count,
    },
  });
});

app.post('/api/guestbook', (req, res) => {
  const rawIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const ipHash = hashIp(rawIp);
  const now = Date.now();
  const lastSubmission = recentSubmissions.get(ipHash);

  if (lastSubmission && now - lastSubmission < RATE_LIMIT_WINDOW_MS) {
    res.status(429).json({
      error: 'Too many messages from this terminal. Wait 30 seconds and try again.',
    });
    return;
  }

  const name = cleanInput(req.body?.name, 60) || 'Anonymous fish';
  const contact = cleanInput(req.body?.contact, 120);
  const message = cleanInput(req.body?.message, 600);

  if (message.length < 3) {
    res.status(400).json({
      error: 'Message must be at least 3 characters long.',
    });
    return;
  }

  const createdAt = new Date().toISOString();
  const insertResult = db
    .prepare(`
      INSERT INTO guestbook_entries (author_name, contact, message, created_at, status, ip_hash)
      VALUES (?, ?, ?, ?, 'published', ?)
    `)
    .run(name, contact, message, createdAt, ipHash);

  recentSubmissions.set(ipHash, now);

  res.status(201).json({
    item: {
      id: Number(insertResult.lastInsertRowid),
      name,
      contact,
      message,
      createdAt,
    },
  });
});

app.use(express.static(ROOT_DIR));

app.listen(PORT, () => {
  console.log(`rybushk.in v0005 guestbook server running at http://localhost:${PORT}`);
});
