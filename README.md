# 🩺 **Medical Translation Assistant**
## **by Pranati B**

---

## 🚀 **Project Overview**

**A full-stack web application** built to enable **seamless, real-time communication** between doctors and patients who speak different languages.

The system acts as an **AI-powered medical intermediary**—handling **live translations**, **voice messaging**, and **AI-generated consultation summaries** to reduce misunderstandings in critical healthcare interactions.

**Clean UX. Fast inference. Medical accuracy first.**

---

## ✨ **Features**

### ✅ **Completed**

**👥 Role-Based Chat Interface**  
Distinct UIs for **Doctor** and **Patient** roles with clear visual context.

**🌍 Real-Time AI Translation**  
Automatic **bidirectional translation** (e.g., English ↔ Spanish) using **Groq + Llama 3**, carefully prompted to preserve **medical terminology**.

**🎙️ Audio Messaging**  
Voice message **recording, upload, and playback** using the browser **MediaRecorder API**.

**🧠 AI Consultation Summaries**  
**One-click generation** of structured clinical notes:
- **Symptoms**
- **Diagnoses**
- **Medications**
- **Follow-up Actions**

**🔍 Contextual Search**  
**Full-text search** across chat history with **keyword highlighting**.

**📱 Responsive Design**  
**Mobile-friendly**, minimal interface built with **Tailwind CSS**.

---

## 🧰 **Tech Stack**

### 🎨 **Frontend**
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks
- **Icons:** Lucide React

### ⚙️ **Backend**
- **Framework:** FastAPI
- **Language:** Python 3.x
- **Database:** SQLite
- **AI Integration:** Groq Python SDK

### 🧠 **AI Tools & Models**
- **⚡ Groq API**  
  Low-latency inference for near real-time responses.

- **🤖 Llama 3 (8b-8192)**  
  Used for:
  - **Context-aware medical translation**
  - **Structured summarization** of clinical conversations

---

## ⚙️ **Setup Instructions**

### 📌 **Prerequisites**
- **Node.js v18+**
- **Python 3.8+**
- **Groq API Key**

### 🔧 **Backend Setup**
```bash
cd backend

python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install fastapi uvicorn python-dotenv groq python-multipart
Create a .env file inside backend/:

env
GROQ_API_KEY=your_groq_api_key_here
ALLOWED_ORIGINS=http://localhost:3000
Run the backend:

bash
uvicorn app.main:app --reload
Backend runs at:
http://localhost:8000

```

🎨 Frontend Setup
bash
cd frontend
npm install
Create .env.local:

env
NEXT_PUBLIC_API_URL=http://localhost:8000
Run the frontend:

bash
npm run dev
Application runs at:
http://localhost:3000

⚠️ Known Limitations & Trade-offs
🗄️ Database Persistence
SQLite is used for MVP simplicity. Replace with PostgreSQL for production deployments.

🎧 Audio Transcription
Audio messages are stored and playable but not transcribed into text.

🔐 Authentication
Uses a role selector instead of a full authentication system (JWT / OAuth).

🔗 Live Demo
👉 https://healthcare-doctor.vercel.app?_vercel_share=bTVWGAzFMo1kQJri0QZyfe4Knk8VUdy5
🚧 Future Improvements
Speech-to-text transcription for audio messages

Doctor-editable AI summaries

Proper authentication and user sessions

Scalable database and production-ready deployment
