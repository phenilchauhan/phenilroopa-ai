/* ============================================================
   PhenilRoopa.ai — script.js
   Full chat logic: API calls, history, UI, offline fallback
   ============================================================ */

'use strict';

// ── Config ─────────────────────────────────────────────────
const BACKEND       = 'https://phenilroopa-backend.onrender.com';
const CHAT_ENDPOINT = BACKEND + '/chat';

// ── State ───────────────────────────────────────────────────
let history      = [];   // [{role:'user'|'assistant', content:'...'}]
let sessionId    = null;
let isTyping     = false;
let chatSessions = JSON.parse(localStorage.getItem('pr_sessions') || '[]');

// ── Suggestion chips ────────────────────────────────────────
const SUGGESTIONS = [
  'Who created you?',
  'What can you help me with?',
  'Write a poem about the ocean',
  'Explain quantum computing simply',
  'Tell me a fun fact',
  'Help me brainstorm ideas'
];

// ── Offline fallbacks ────────────────────────────────────────
const FALLBACKS = [
  { match: /\b(hello|hi|hey|howdy)\b/i,
    reply: "Hello! I'm PhenilRoopa.ai — happy to help. What's on your mind?" },
  { match: /who.*(creat|made|built|develop)/i,
    reply: "I was created by Phenil Chauhan as an intelligent AI assistant called PhenilRoopa.ai." },
  { match: /who are you|what are you|introduce yourself/i,
    reply: "I'm PhenilRoopa.ai, an AI assistant designed to help you with questions, writing, brainstorming, and much more!" },
  { match: /thank/i,
    reply: "You're very welcome! Let me know if there's anything else I can help you with." },
  { match: /bye|goodbye|see you/i,
    reply: "Goodbye! Feel free to come back anytime. Have a great day!" },
  { match: /joke/i,
    reply: "Why did the programmer quit his job? Because he didn't get arrays! 😄" },
  { match: /weather/i,
    reply: "I can't check live weather right now, but I'd suggest checking weather.com or your local app!" },
  { match: /name/i,
    reply: "My name is PhenilRoopa.ai — your personal AI assistant built by Phenil Chauhan." },
];

function getFallback(text) {
  for (const f of FALLBACKS) {
    if (f.match.test(text)) return f.reply;
  }
  return "I'm having trouble reaching the server right now. Please try again in a moment — I'm always here to help!";
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildSuggestions();
  renderSidebar();
  focusInput();
});

function focusInput() {
  const inp = document.getElementById('user-input');
  if (inp) inp.focus();
}

// ── Build welcome suggestion pills ───────────────────────────
function buildSuggestions() {
  const container = document.getElementById('pills');
  if (!container) return;
  container.innerHTML = '';
  SUGGESTIONS.forEach(text => {
    const btn = document.createElement('button');
    btn.className = 'suggestion-pill';
    btn.textContent = text;
    btn.addEventListener('click', () => {
      document.getElementById('user-input').value = text;
      sendMessage();
    });
    container.appendChild(btn);
  });
}

// ── Sidebar: new chat ─────────────────────────────────────────
function newChat() {
  sessionId = generateId();
  history   = [];
  const body = document.getElementById('chat-body');
  body.innerHTML = `
    <div id="welcome">
      <div class="hero-logo">P</div>
      <h2>Welcome to PhenilRoopa.ai</h2>
      <p>Your intelligent AI assistant. Ask me anything — I'm here to help you think, write, and create.</p>
      <div class="suggestion-pills" id="pills"></div>
    </div>`;
  buildSuggestions();
  renderSidebar();
  closeSidebar();
  focusInput();
}

// ── Sidebar: load a past session ─────────────────────────────
function loadSession(id) {
  const session = chatSessions.find(s => s.id === id);
  if (!session) return;

  sessionId = id;
  history   = session.history || [];

  const body = document.getElementById('chat-body');
  body.innerHTML = '';
  history.forEach(m => appendBubble(m.role, m.content, false));
  body.scrollTop = body.scrollHeight;

  renderSidebar();
  closeSidebar();
}

// ── Sidebar: render history list ─────────────────────────────
function renderSidebar() {
  const list = document.getElementById('history-list');
  if (!list) return;
  list.innerHTML = '';

  if (!chatSessions.length) {
    list.innerHTML = '<div style="color:rgba(196,181,253,.35);font-size:12px;padding:8px 12px;">No chats yet</div>';
    return;
  }

  [...chatSessions].reverse().forEach(s => {
    const item = document.createElement('div');
    item.className = 'history-item' + (s.id === sessionId ? ' active' : '');
    item.title = s.preview;
    item.innerHTML = `<span class="hi-icon">💬</span>${escapeHtml(s.preview)}`;
    item.addEventListener('click', () => loadSession(s.id));
    list.appendChild(item);
  });
}

// ── Send message ──────────────────────────────────────────────
async function sendMessage() {
  if (isTyping) return;

  const inputEl = document.getElementById('user-input');
  const text    = inputEl.value.trim();
  if (!text) return;

  // hide welcome, clear input
  hideWelcome();
  inputEl.value = '';
  autoResize(inputEl);

  // ensure we have a session
  if (!sessionId) sessionId = generateId();

  // add to history & render
  history.push({ role: 'user', content: text });
  appendBubble('user', text);
  showTypingIndicator();
  setSendDisabled(true);
  isTyping = true;

  try {
    const res = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message:   text,
        history:   history.slice(0, -1),   // exclude the message we just added
        sessionId: sessionId
      })
    });

    if (!res.ok) throw new Error('HTTP ' + res.status);

    const data  = await res.json();
    const reply = extractReply(data);

    if (!reply) throw new Error('Empty reply');

    history.push({ role: 'assistant', content: reply });
    removeTypingIndicator();
    appendBubble('assistant', reply);

  } catch (err) {
    console.warn('PhenilRoopa backend error:', err.message);
    const fallback = getFallback(text);
    history.push({ role: 'assistant', content: fallback });
    removeTypingIndicator();
    appendBubble('assistant', fallback);
    showError('Could not reach server — showing offline response.');
  } finally {
    isTyping = false;
    setSendDisabled(false);
    saveSession(text);
    focusInput();
  }
}

// Try every common key name backends might use
function extractReply(data) {
  if (!data) return null;
  if (typeof data === 'string') return data;

  const keys = ['reply', 'response', 'message', 'answer', 'text', 'content', 'output', 'result'];
  for (const k of keys) {
    if (data[k] && typeof data[k] === 'string') return data[k];
  }
  // OpenAI-style
  if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
  // Fallback: first string value found
  for (const k of Object.keys(data)) {
    if (typeof data[k] === 'string' && data[k].length > 2) return data[k];
  }
  return null;
}

// ── Persist sessions ─────────────────────────────────────────
function saveSession(previewText) {
  const idx     = chatSessions.findIndex(s => s.id === sessionId);
  const session = {
    id:       sessionId,
    preview:  previewText.slice(0, 55),
    history:  [...history],
    updatedAt: Date.now()
  };

  if (idx >= 0) {
    chatSessions[idx] = session;
  } else {
    chatSessions.push(session);
  }

  // keep only last 30 sessions
  if (chatSessions.length > 30) {
    chatSessions = chatSessions.slice(-30);
  }

  localStorage.setItem('pr_sessions', JSON.stringify(chatSessions));
  renderSidebar();
}

// ── DOM helpers ───────────────────────────────────────────────
function hideWelcome() {
  const w = document.getElementById('welcome');
  if (w) w.remove();
}

function appendBubble(role, content, scroll = true) {
  const body    = document.getElementById('chat-body');
  const isUser  = (role === 'user');

  const row = document.createElement('div');
  row.className = 'msg-row ' + (isUser ? 'user' : 'bot');

  const avatar = document.createElement('div');
  avatar.className = 'avatar ' + (isUser ? 'user' : 'bot');
  avatar.textContent = isUser ? 'U' : 'P';

  const col = document.createElement('div');
  col.style.display = 'flex';
  col.style.flexDirection = 'column';

  const bubble = document.createElement('div');
  bubble.className = 'bubble ' + (isUser ? 'user' : 'bot');
  bubble.innerHTML = formatContent(content);

  const time = document.createElement('div');
  time.className = 'msg-time';
  time.textContent = nowTime();

  col.appendChild(bubble);
  col.appendChild(time);

  if (isUser) {
    row.appendChild(col);
    row.appendChild(avatar);
  } else {
    row.appendChild(avatar);
    row.appendChild(col);
  }

  body.appendChild(row);
  if (scroll) body.scrollTop = body.scrollHeight;
}

function showTypingIndicator() {
  const body = document.getElementById('chat-body');
  const row  = document.createElement('div');
  row.id        = 'typing-row';
  row.className = 'msg-row bot';

  const avatar = document.createElement('div');
  avatar.className = 'avatar bot';
  avatar.textContent = 'P';

  const bubble = document.createElement('div');
  bubble.className = 'bubble bot typing-bubble';
  bubble.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';

  row.appendChild(avatar);
  row.appendChild(bubble);
  body.appendChild(row);
  body.scrollTop = body.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typing-row');
  if (el) el.remove();
}

function setSendDisabled(disabled) {
  const btn = document.getElementById('send-btn');
  if (btn) btn.disabled = disabled;
}

// ── Text formatting ───────────────────────────────────────────
function formatContent(raw) {
  // escape HTML first, then apply markdown-lite
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── Input textarea ────────────────────────────────────────────
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function handleKey(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

// ── Error toast ───────────────────────────────────────────────
function showError(msg) {
  const toast   = document.getElementById('error-toast');
  const msgSpan = document.getElementById('error-msg');
  if (!toast || !msgSpan) return;
  msgSpan.textContent = msg;
  toast.style.display = 'flex';
  setTimeout(() => { toast.style.display = 'none'; }, 4500);
}

// ── Sidebar toggle (mobile) ───────────────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('show');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}

// ── Utilities ─────────────────────────────────────────────────
function generateId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
