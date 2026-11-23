// Minimal client for the review page. Loads requirements, renders an Approve
// toggle + comment box per item, and autosaves answers to the server.

const state = { items: [] };
let saveTimer = null;

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// Tiny inline markdown: **bold**, *italic*, `code`.
function renderInline(s) {
  let h = escapeHtml(s);
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  return h;
}

function setStatus(text, kind) {
  const el = document.getElementById('status');
  el.textContent = text;
  el.className = 'status' + (kind ? ' ' + kind : '');
}

function updateProgress() {
  const done = state.items.filter((i) => i.approved).length;
  document.getElementById('progress').textContent =
    `${done} of ${state.items.length} approved`;
}

function scheduleSave() {
  setStatus('Saving…', 'saving');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 500);
}

async function save() {
  try {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: state.items }),
    });
    const data = await res.json();
    if (data.ok) setStatus('Saved ' + new Date(data.savedAt).toLocaleTimeString());
    else setStatus('Could not save: ' + data.error, 'error');
  } catch (e) {
    setStatus('Could not save (offline?)', 'error');
  }
}

function render() {
  const root = document.getElementById('items');
  root.innerHTML = '';
  for (const item of state.items) {
    const card = document.createElement('section');
    card.className = 'item' + (item.approved ? ' approved' : '');

    const tag = document.createElement('span');
    tag.className = 'section-tag';
    tag.textContent = item.section;
    card.appendChild(tag);

    const p = document.createElement('p');
    p.className = 'req-text';
    p.innerHTML = renderInline(item.text);
    card.appendChild(p);

    const row = document.createElement('div');
    row.className = 'row';
    const btn = document.createElement('button');
    btn.className = 'approve';
    btn.setAttribute('aria-pressed', String(item.approved));
    const label = () => (item.approved ? '✓ Approved' : 'Approve');
    btn.innerHTML = label();
    btn.addEventListener('click', () => {
      item.approved = !item.approved;
      btn.setAttribute('aria-pressed', String(item.approved));
      btn.innerHTML = label();
      card.classList.toggle('approved', item.approved);
      updateProgress();
      scheduleSave();
    });
    row.appendChild(btn);
    card.appendChild(row);

    const ta = document.createElement('textarea');
    ta.placeholder = 'Comment (optional) — what should change?';
    ta.value = item.comment || '';
    ta.addEventListener('input', () => {
      item.comment = ta.value;
      scheduleSave();
    });
    card.appendChild(ta);

    root.appendChild(card);
  }
}

async function load() {
  const res = await fetch('/api/items');
  const data = await res.json();
  state.items = data.items;
  document.getElementById('doc-title').textContent = 'Review: ' + data.document;
  document.getElementById('doc-path').textContent =
    'Answers save to ' + data.output;
  render();
  updateProgress();
  setStatus('Your answers save automatically.');
}

load();
