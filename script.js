const BACKEND_URL = "https://phenilroopa-backend.onrender.com/chat";

async function sendMessage() {
  const inputEl = document.getElementById("message");
  const chatBox = document.getElementById("chat");

  const input = inputEl.value.trim();
  if (!input) return;

  chatBox.innerHTML += `<div class="user">You: ${input}</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;

  inputEl.value = "";

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: input })
    });

    const data = await res.json();

    chatBox.innerHTML += `<div class="bot">AI: ${data.reply || data.error}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;

  } catch (err) {
    chatBox.innerHTML += `<div class="bot">AI: Error connecting to server</div>`;
  }
}
