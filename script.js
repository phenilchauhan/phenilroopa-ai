// Replace with your actual Render URL
const BACKEND_URL = 'https://phenilroopa-backend.onrender.com/chat';
let chatHistory = [];

async function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (!text) return;

    appendMsg('user', text);
    input.value = '';

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, history: chatHistory })
        });
        const data = await response.json();
        
        if (data.reply) {
            appendMsg('bot', data.reply);
            chatHistory.push({ role: 'user', content: text });
            chatHistory.push({ role: 'assistant', content: data.reply });
        } else {
            throw new Error(data.error);
        }
    } catch (err) {
        appendMsg('bot', "Error: Could not reach the AI.");
        console.error(err);
    }
}

function appendMsg(role, text) {
    const chatBody = document.getElementById('chat-body');
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.innerText = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
}
