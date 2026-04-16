const BACKEND_URL = "https://phenilroopa-backend.onrender.com/chat";

async function sendMessage() {
  const input = document.getElementById("message").value;
  const chatBox = document.getElementById("chat");

  if (!input) return;

  chatBox.innerHTML += `<div class="user">You: ${input}</div>`;

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
  } catch (err) {
    chatBox.innerHTML += `<div class="bot">AI: Error connecting to server</div>`;
  }

  document.getElementById("message").value = "";
}
