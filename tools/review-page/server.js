#!/usr/bin/env node
// A tiny, dependency-free review server.
//
// It turns a Markdown document into a list of reviewable "requirements"
// (each gets an Approve toggle and a comment box) and saves the reviewer's
// answers to a JSON file. It is meant to be reused for any document, not
// just the Nextia Clinic plan.
//
// Usage:
//   node server.js [--doc <path.md>] [--out <path.json>] [--port <n>]
//
// Defaults:
//   --doc   docs/plan.md
//   --out   docs/plan-review.json
//   --port  8787
//
// Safety:
//   - Binds to 0.0.0.0 so phones on the same Wi-Fi can reach it, but every
//     request is rejected unless it comes from a private/home network address
//     (RFC1918) or localhost. It is never served to the public internet.

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// ---- arguments -------------------------------------------------------------
function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const DOC_PATH = path.resolve(REPO_ROOT, arg('doc', 'docs/plan.md'));
const OUT_PATH = path.resolve(REPO_ROOT, arg('out', 'docs/plan-review.json'));
const PORT = parseInt(arg('port', '7421'), 10);
const HERE = __dirname;

// ---- markdown -> requirements ----------------------------------------------
// Rule: split on "## " headings. Within a section, if it has list items
// (- or 1.), those items are the requirements. Otherwise each paragraph block
// is a requirement. The H1 title and any intro text above the first heading
// are ignored.
function shortId(section, text) {
  return crypto.createHash('sha1').update(section + '|' + text).digest('hex').slice(0, 10);
}

function parseRequirements(md) {
  const lines = md.split(/\r?\n/);
  const sections = [];
  let current = null;
  for (const line of lines) {
    const h = line.match(/^##\s+(.*)$/);
    if (h) {
      current = { title: h[1].trim(), lines: [] };
      sections.push(current);
      continue;
    }
    if (current) current.lines.push(line);
  }

  const items = [];
  for (const sec of sections) {
    const listItems = [];
    const paragraphs = [];
    let buf = [];
    const flush = () => {
      if (buf.length) {
        const text = buf.join(' ').trim();
        if (text) paragraphs.push(text);
        buf = [];
      }
    };
    for (const raw of sec.lines) {
      const line = raw.trimEnd();
      const li = line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/);
      if (li) {
        flush();
        const text = li[1].trim();
        if (text) listItems.push(text);
      } else if (line.trim() === '') {
        flush();
      } else {
        buf.push(line.trim());
      }
    }
    flush();

    const chosen = listItems.length ? listItems : paragraphs;
    for (const text of chosen) {
      items.push({ id: shortId(sec.title, text), section: sec.title, text });
    }
  }
  return items;
}

function loadSaved() {
  try {
    return JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));
  } catch {
    return null;
  }
}

// Merge freshly parsed requirements with any previously saved answers.
function buildItems() {
  const md = fs.readFileSync(DOC_PATH, 'utf8');
  const parsed = parseRequirements(md);
  const saved = loadSaved();
  const prev = new Map((saved?.items || []).map((it) => [it.id, it]));
  return parsed.map((it) => {
    const p = prev.get(it.id);
    return { ...it, approved: p?.approved ?? false, comment: p?.comment ?? '' };
  });
}

// ---- home-network guard ----------------------------------------------------
function remoteIp(req) {
  let ip = req.socket.remoteAddress || '';
  if (ip.startsWith('::ffff:')) ip = ip.slice(7); // IPv4-mapped IPv6
  return ip;
}
function isHomeNetwork(ip) {
  if (ip === '127.0.0.1' || ip === '::1') return true;
  const m = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return false;
  const [a, b] = [parseInt(m[1], 10), parseInt(m[2], 10)];
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 169 && b === 254) return true; // link-local
  return false;
}

// ---- static files ----------------------------------------------------------
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
function serveStatic(res, file) {
  const full = path.join(HERE, file);
  if (!full.startsWith(HERE) || !fs.existsSync(full)) {
    res.writeHead(404).end('Not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(full)] || 'text/plain' });
  fs.createReadStream(full).pipe(res);
}

function sendJson(res, code, obj) {
  const body = JSON.stringify(obj, null, 2);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}

// ---- server ----------------------------------------------------------------
const server = http.createServer((req, res) => {
  const ip = remoteIp(req);
  if (!isHomeNetwork(ip)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('This review page is only reachable on the home network.');
    return;
  }

  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    return serveStatic(res, 'index.html');
  }
  if (req.method === 'GET' && (url.pathname === '/app.js' || url.pathname === '/style.css')) {
    return serveStatic(res, url.pathname.slice(1));
  }
  if (req.method === 'GET' && url.pathname === '/api/items') {
    return sendJson(res, 200, {
      document: path.relative(REPO_ROOT, DOC_PATH),
      output: path.relative(REPO_ROOT, OUT_PATH),
      items: buildItems(),
    });
  }
  if (req.method === 'POST' && url.pathname === '/api/save') {
    let body = '';
    req.on('data', (c) => {
      body += c;
      if (body.length > 1e6) req.destroy(); // basic flood guard
    });
    req.on('end', () => {
      try {
        const incoming = JSON.parse(body);
        const base = buildItems();
        const byId = new Map(base.map((it) => [it.id, it]));
        for (const it of incoming.items || []) {
          const target = byId.get(it.id);
          if (target) {
            target.approved = !!it.approved;
            target.comment = String(it.comment || '');
          }
        }
        const payload = {
          document: path.relative(REPO_ROOT, DOC_PATH),
          savedAt: new Date().toISOString(),
          items: [...byId.values()],
        };
        fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + '\n');
        sendJson(res, 200, { ok: true, savedAt: payload.savedAt });
      } catch (e) {
        sendJson(res, 400, { ok: false, error: String(e.message || e) });
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

// Find the LAN address to show the user.
function lanAddress() {
  for (const iface of Object.values(os.networkInterfaces())) {
    for (const net of iface || []) {
      if (net.family === 'IPv4' && !net.internal && isHomeNetwork(net.address)) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

server.listen(PORT, '0.0.0.0', () => {
  fs.writeFileSync(path.join(HERE, '.server.pid'), String(process.pid) + '\n');
  const addr = lanAddress();
  console.log('Review server running.');
  console.log('  Document : ' + path.relative(REPO_ROOT, DOC_PATH));
  console.log('  Saves to : ' + path.relative(REPO_ROOT, OUT_PATH));
  console.log('  Open on your phone (same Wi-Fi): http://' + addr + ':' + PORT);
  console.log('  Local URL: http://127.0.0.1:' + PORT);
});
