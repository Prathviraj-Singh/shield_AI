# ShieldAI 🛡️ 

**ShieldAI** is a comprehensive, full-stack Cyber Safety and Fraud Detection agent designed to protect users against modern phishing, OTP scams, and deceptive threat vectors. It utilizes a powerful backend engine (FastAPI + AI), a robust PostgreSQL database (Supabase), and a highly modern, responsive frontend (React + Vite + Tailwind + Framer Motion).

It also includes a real-time **Chrome Extension** that detects Indian-specific phishing patterns securely in Gmail.

---

## 📸 Screenshots
*(Placeholder: Insert your Dashboard and Extension screenshots here)*

---

## 🛠 Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion, Axios
- **Backend**: Python 3.11, FastAPI, Uvicorn, Pydantic
- **Database**: Supabase (PostgreSQL), Real-time subscriptions
- **Extension**: Chrome Manifest V3

---

## ⚙️ Environment Variables

### Frontend (`frontend/.env`)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_BASE_URL=http://localhost:8000
```

### Backend (`backend/.env`)
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/shieldai
API_V1_STR=/api/v1
SECRET_KEY=your_secret_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

---

## 🚀 How to Run Locally

1. **Clone the repository.**
2. **Start the Backend:**
    ```bash
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    fastapi dev app/main.py --port 8000
    ```
3. **Start the Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
4. Application runs live on: `http://localhost:5173`.

---

## 🧩 Loading the Chrome Extension
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** in the top right.
3. Click **Load unpacked** and select the `extension/` directory in this repository.
4. Open Gmail. The extension will now automatically aggressively scan your inbox for target keywords!

---

## 🌐 Deployment Instructions

### Deploy Frontend (Vercel)
A `vercel.json` is already included to appropriately route React SPAs built with Vite.
- Push the repo to GitHub.
- Import the project into Vercel.
- Set the Root Directory to `frontend`.
- Import your `VITE_` Environment Variables.
- Deploy!

### Deploy Backend (Google Cloud Run)
A `Dockerfile` is included specifically for Cloud Run compatibility.
```bash
# Build the container
docker build -t shieldai-backend ./backend

# Submit to Google Cloud Run
gcloud run deploy shieldai-backend --source ./backend --port 8080 --allow-unauthenticated
```
