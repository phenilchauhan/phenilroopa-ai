# ◈ PhenilRoopa.AI

> A real-world AI assistant website — built free, hosted free, powered by Claude AI.

![PhenilRoopa.AI](https://img.shields.io/badge/AI-PhenilRoopa.AI-7c5cfc?style=for-the-badge)
![Free Hosting](https://img.shields.io/badge/Hosting-GitHub%20Pages%20(Free)-00c950?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

## 🚀 Live Demo

Once deployed, your site will be live at:
`https://YOUR-GITHUB-USERNAME.github.io/phenilroopa-ai/`

---

## 📁 Project Structure

```
phenilroopa-ai/
├── index.html          ← Main website page
├── css/
│   └── style.css       ← All styling
├── js/
│   └── app.js          ← AI chat logic
├── assets/
│   └── favicon.svg     ← Website icon
└── README.md           ← This file
```

---

## ⚙️ STEP 1 — Get Your Free API Key

1. Go to **https://console.anthropic.com/**
2. Sign up for a free account
3. Click **"API Keys"** in the left sidebar
4. Click **"Create Key"** → copy the key (starts with `sk-ant-...`)

---

## 🔑 STEP 2 — Add Your API Key

Open `js/app.js` and find this line:

```javascript
const API_KEY = "YOUR_ANTHROPIC_API_KEY_HERE";
```

Replace it with your actual key:

```javascript
const API_KEY = "sk-ant-api03-xxxxxxxxxxxxxxxx";
```

Save the file.

---

## 📤 STEP 3 — Upload to GitHub

### Option A: Using GitHub Website (No coding needed)

1. Go to **https://github.com** and sign in (or create a free account)
2. Click the **"+"** icon (top right) → **"New repository"**
3. Name it: `phenilroopa-ai`
4. Set to **Public**
5. Click **"Create repository"**
6. On the next page, click **"uploading an existing file"**
7. Drag and drop ALL your files:
   - `index.html`
   - `css/style.css`
   - `js/app.js`
   - `assets/favicon.svg`
   - `README.md`
8. Write a commit message like: `Add PhenilRoopa.AI website`
9. Click **"Commit changes"**

> ⚠️ Make sure to keep the folder structure: create `css/`, `js/`, `assets/` folders on GitHub too.

### Option B: Using Git (For developers)

```bash
# 1. Initialize git in your project folder
cd phenilroopa-ai
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit — PhenilRoopa.AI"

# 4. Connect to GitHub (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/phenilroopa-ai.git

# 5. Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🌐 STEP 4 — Make It Live (GitHub Pages — FREE)

1. Go to your repository on GitHub
2. Click **"Settings"** (top menu)
3. Scroll down to **"Pages"** (left sidebar)
4. Under **"Source"**, select **"Deploy from a branch"**
5. Select **"main"** branch → **"/ (root)"**
6. Click **"Save"**
7. Wait 1–2 minutes
8. Your site is live at: `https://YOUR-USERNAME.github.io/phenilroopa-ai/`

---

## 🏃 STEP 5 — Run Locally (Test on your computer)

### Method 1: Open directly
Just double-click `index.html` — it opens in your browser!

### Method 2: Using VS Code Live Server
1. Install **VS Code**: https://code.visualstudio.com/
2. Install **Live Server** extension
3. Right-click `index.html` → **"Open with Live Server"**
4. Opens at `http://localhost:5500`

### Method 3: Python (if Python installed)
```bash
cd phenilroopa-ai
python -m http.server 8000
# Open: http://localhost:8000
```

---

## 🔒 IMPORTANT: API Key Security

⚠️ **Never share your API key publicly!**

If you're making this site public on GitHub, consider:

### Option 1: Keep it simple (for personal use only)
Put the key directly in `js/app.js` — fine if only YOU use the site.

### Option 2: Use a backend (for public sites)
Deploy a free backend on **Render.com** or **Railway.app** to keep the key hidden.

### Option 3: Set a usage limit
In your Anthropic dashboard, set a monthly spending limit of $5 so you never get surprised.

---

## ✨ Features

- 🧠 **Real AI Chat** — Powered by Claude (claude-opus-4-5)
- ✍️ **Content Writing** — Essays, emails, stories, and more
- 💻 **Code Helper** — Any programming language
- 🌍 **Multilingual** — English, Hindi, Gujarati, and more
- 📱 **Mobile Friendly** — Works on all devices
- ⚡ **Fast & Free** — GitHub Pages hosting = $0/month
- 🎨 **Beautiful Design** — Dark theme, animated UI

---

## 🛠️ Customization

### Change the AI Name/Persona
Edit the `system` prompt in `js/app.js`:
```javascript
system: `You are PhenilRoopa.AI...`
```

### Change Colors
Edit CSS variables at the top of `css/style.css`:
```css
--accent: #7c5cfc;    /* Purple — change to any color */
--accent3: #5ce8f4;   /* Cyan */
```

### Add More Features
- Add image generation using Anthropic's API
- Add voice input using Web Speech API
- Add conversation save/load using localStorage

---

## 📊 Cost Estimate

| Usage | Cost |
|-------|------|
| 100 messages/day | ~$0.10/day |
| 1000 messages/day | ~$1.00/day |
| Hosting (GitHub Pages) | **FREE** |

Anthropic gives **$5 free credits** when you sign up — enough for thousands of messages!

---

## 📄 License

MIT License — Free to use, modify, and share for any purpose.

---

Made with ❤️ by **PhenilRoopa** · Powered by **Claude AI** · Hosted on **GitHub Pages**
