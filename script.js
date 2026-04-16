// =========================================
// PhenilRoopa.ai — Chat Engine
// Calls secure Render.com backend
// =========================================

const BACKEND_URL = "https://phenilroopa-backend.onrender.com/chat";

let totalTokens = 0;
let isLoading = false;

// ---- On page load ----
window.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("userInput");
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 120) + "px";
  });
});

// ---- Send Message ----
async function sendMessage() {
  const input = document.getElementById("userInput");
  const text = input.value.trim();
  if (!text || isLoading) return;

  addMessage("user", escapeHtml(text));
  input.value = "";
  input.style.height = "auto";

  const typingId = showTyping();
  setLoading(true);

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    removeTyping(typingId);

    if (!response.ok) {
      const errData = await response.json();
      addMessage("ai", `⚠️ Error: ${escapeHtml(errData?.error || "Unknown error")}`);
      return;
    }

    const data = await response.json();
    const reply = data?.reply || "No response from AI.";
    const tokens = data?.tokens || 0;
    totalTokens += tokens;
    document.getElementById("tokenCount").textContent = `Tokens used: ${totalTokens}`;

    addMessage("ai", formatMarkdown(reply));

  } catch (err) {
    removeTyping(typingId);
    addMessage("ai", "⚠️ Could not reach the server. The backend may be waking up — please wait 30 seconds and try again.");
  } finally {
    setLoading(false);
  }
}

// ---- Quick Prompt ----
function quickPrompt(text) {
  document.getElementById("userInput").value = text;
  document.getElementById("chat").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => sendMessage(), 400);
}

// ---- UI Helpers ----
function addMessage(role, content) {
  const msgs = document.getElementById("messages");
  const div = document.createElement("div");
  div.className = `msg ${role === "ai" ? "ai-msg" : "user-msg"}`;

  const avatar = document.createElement("div");
  avatar.className = "msg-avatar";
  avatar.textContent = role === "ai" ? "AI" : "ME";

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";
  bubble.innerHTML = content;

  div.appendChild(avatar);
  div.appendChild(bubble);
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

function showTyping() {
  const id = "typing-" + Date.now();
  const msgs = document.getElementById("messages");
  const div = document.createElement("div");
  div.className = "msg ai-msg";
  div.id = id;

  const avatar = document.createElement("div");
  avatar.className = "msg-avatar";
  avatar.textContent = "AI";

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";
  bubble.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;

  div.appendChild(avatar);
  div.appendChild(bubble);
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return id;
}

function removeTyping(id) {
  document.getElementById(id)?.remove();
}

function setLoading(state) {
  isLoading = state;
  const btn = document.getElementById("sendBtn");
  btn.disabled = state;
  btn.style.opacity = state ? "0.5" : "1";
}

function formatMarkdown(text) {
  return text
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code>${escapeHtml(code.trim())}</code></pre>`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h4 style="margin:.5rem 0 .3rem;color:#a89fff;font-size:14px;">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 style="margin:.6rem 0 .3rem;color:#c0bdff;font-size:15px;">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 style="margin:.8rem 0 .4rem;color:#d0ceff;font-size:16px;">$1</h2>')
    .replace(/^\- (.+)$/gm, '• $1')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
