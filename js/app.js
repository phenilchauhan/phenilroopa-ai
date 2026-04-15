// ============================================================
// PhenilRoopa.AI — App Logic
// ============================================================

// ---- CONFIG ----
// IMPORTANT: Replace this with your real Anthropic API key
// Get one free at: https://console.anthropic.com/
const API_KEY = "YOUR_ANTHROPIC_API_KEY_HERE";
const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-opus-4-5";

// ---- DOM REFERENCES ----
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// ---- CONVERSATION HISTORY ----
let conversationHistory = [];

// ---- SEND MESSAGE ----
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  // Add user message to UI
  addMessage("user", text);
  userInput.value = "";
  sendBtn.disabled = true;

  // Add to history
  conversationHistory.push({ role: "user", content: text });

  // Show typing indicator
  const typingId = showTyping();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: `You are PhenilRoopa.AI — a friendly, helpful, and intelligent AI assistant created by PhenilRoopa. 
You are helpful, honest, and knowledgeable. You can:
- Answer any questions clearly and accurately
- Write essays, poems, stories, emails, and any content
- Help with coding in any programming language
- Explain complex topics in simple terms
- Speak in English, Hindi, Gujarati, or any language the user uses

Keep responses concise but complete. Be warm and encouraging. If someone writes in Hindi or Gujarati, respond in that language.`,
        messages: conversationHistory
      })
    });

    removeTyping(typingId);

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "API Error");
    }

    const data = await response.json();
    const aiText = data.content[0]?.text || "Sorry, I couldn't generate a response.";

    // Add AI response to history and UI
    conversationHistory.push({ role: "assistant", content: aiText });
    addMessage("ai", aiText);

  } catch (error) {
    removeTyping(typingId);
    let errorMsg = "⚠️ Could not connect to AI. ";
    if (API_KEY === "YOUR_ANTHROPIC_API_KEY_HERE") {
      errorMsg += "Please add your Anthropic API key in js/app.js (replace YOUR_ANTHROPIC_API_KEY_HERE). Get a free key at https://console.anthropic.com/";
    } else {
      errorMsg += error.message;
    }
    addMessage("ai", errorMsg);
  }

  sendBtn.disabled = false;
  userInput.focus();
}

// ---- ADD MESSAGE TO UI ----
function addMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `chat-message ${role === "user" ? "user-message" : "ai-message"}`;

  const avatar = document.createElement("div");
  avatar.className = "msg-avatar";
  avatar.textContent = role === "user" ? "You" : "◈";

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";

  // Format text: split into paragraphs, handle code blocks
  const formatted = formatText(text);
  bubble.innerHTML = formatted;

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ---- FORMAT TEXT ----
function formatText(text) {
  // Handle code blocks
  text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre style="background:rgba(0,0,0,0.4);border:1px solid rgba(124,92,252,0.3);border-radius:8px;padding:0.8rem;font-family:'Space Mono',monospace;font-size:0.8rem;overflow-x:auto;margin:0.5rem 0;">${escapeHtml(code.trim())}</pre>`;
  });

  // Handle inline code
  text = text.replace(/`([^`]+)`/g, '<code style="background:rgba(124,92,252,0.2);padding:1px 5px;border-radius:4px;font-family:monospace;">$1</code>');

  // Handle **bold**
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Handle *italic*
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Convert newlines to paragraphs
  const paragraphs = text.split("\n\n").filter(p => p.trim());
  return paragraphs.map(p => {
    const lines = p.split("\n").join("<br/>");
    return `<p>${lines}</p>`;
  }).join("");
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ---- TYPING INDICATOR ----
function showTyping() {
  const id = "typing-" + Date.now();
  const wrapper = document.createElement("div");
  wrapper.className = "chat-message ai-message";
  wrapper.id = id;

  const avatar = document.createElement("div");
  avatar.className = "msg-avatar";
  avatar.textContent = "◈";

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";
  bubble.innerHTML = `<div class="typing-indicator">
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
  </div>`;

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ---- QUICK PROMPT ----
function setPrompt(text) {
  userInput.value = text;
  userInput.focus();
}

// ---- EVENT LISTENERS ----
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ---- MOBILE NAV ----
const hamburger = document.getElementById("hamburger");
hamburger.addEventListener("click", () => {
  const navLinks = document.querySelector(".nav-links");
  if (navLinks.style.display === "flex") {
    navLinks.style.display = "none";
  } else {
    navLinks.style.display = "flex";
    navLinks.style.flexDirection = "column";
    navLinks.style.position = "absolute";
    navLinks.style.top = "64px";
    navLinks.style.left = "0";
    navLinks.style.right = "0";
    navLinks.style.background = "rgba(5,5,10,0.98)";
    navLinks.style.padding = "1rem 2.5rem 1.5rem";
    navLinks.style.borderBottom = "1px solid rgba(255,255,255,0.08)";
    navLinks.style.gap = "1.2rem";
  }
});
