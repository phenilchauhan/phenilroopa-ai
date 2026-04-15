// ============================================================
// PhenilRoopa.AI — App Logic (FIXED)
// ============================================================

// ---- CONFIG ----
const API_KEY = "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";
const API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

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

  addMessage("user", text);
  userInput.value = "";
  sendBtn.disabled = true;

  conversationHistory.push({ role: "user", content: text });

  const typingId = showTyping();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`   // ✅ FIXED
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You are PhenilRoopa.AI — a helpful assistant."
          },
          ...conversationHistory
        ],
        max_tokens: 1000
      })
    });

    removeTyping(typingId);

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "API Error");
    }

    const data = await response.json();

    // ✅ FIXED RESPONSE FORMAT
    const aiText = data.choices?.[0]?.message?.content || "No response";

    conversationHistory.push({ role: "assistant", content: aiText });
    addMessage("ai", aiText);

  } catch (error) {
    removeTyping(typingId);
    addMessage("ai", "⚠️ Error: " + error.message);
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

  bubble.innerHTML = formatText(text);

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ---- FORMAT TEXT ----
function formatText(text) {
  text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre style="background:#111;padding:10px;border-radius:6px;overflow:auto;">${escapeHtml(code)}</pre>`;
  });

  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

  return text.split("\n").map(line => `<p>${line}</p>`).join("");
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
  bubble.innerHTML = "Typing...";

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chatBox.appendChild(wrapper);

  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ---- EVENTS ----
sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});
