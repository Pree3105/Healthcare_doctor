# Medical Translation Assistant

## Project Overview
A full-stack web application designed to facilitate real-time communication between doctors and patients who speak different languages. The application acts as an intelligent intermediary, providing real-time translation of text messages, audio recording capabilities, and AI-powered consultation summaries to ensure accurate medical understanding.

## Features

### Completed
- **Role-Based Chat Interface**: Distinct UIs for Doctor and Patient roles with visual cues.
- **Real-time AI Translation**: Automatic translation of messages between selected languages (e.g., English ↔ Spanish) using Groq/Llama 3, specifically prompted to preserve medical terminology.
- **Audio Messaging**: Integrated `MediaRecorder` API to record, upload, and play back voice messages within the chat.
- **AI Summarization**: One-click generation of structured clinical notes (Symptoms, Diagnoses, Medications, Follow-up) based on the conversation history.
- **Contextual Search**: Full-text search capability to find specific medical terms or past conversations, with keyword highlighting.
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS.

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (`useState`, `useEffect`, `useCallback`)
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.x
- **Database**: SQLite (Local storage for conversations, messages, and summaries)
- **AI Integration**: Groq Python SDK

## AI Tools & Resources Leveraged
- **Groq API**: Utilized for high-speed inference to ensure near real-time translation.
- **Llama 3 (8b-8192)**: The Large Language Model used for:
  - **Translation**: Context-aware translation focusing on medical accuracy.
  - **Summarization**: Extracting key medical information from unstructured chat logs.

## Setup Instructions

### Prerequisites
- Node.js (v18+) & npm
- Python 3.8+
- A Groq API Key

### 1. Backend Setup
Navigate to the backend directory and set up the Python environment.

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn python-dotenv groq python-multipart
```

Create a `.env` file in the `backend` directory:
```env
GROQ_API_KEY=your_groq_api_key_here
ALLOWED_ORIGINS=http://localhost:3000
```

Run the server:
```bash
uvicorn app.main:app --reload
```
The backend will start at `http://localhost:8000`.

### 2. Frontend Setup
Navigate to the frontend directory.

```bash
cd frontend

# Install dependencies
npm install
```

Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the development server:
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

## Known Limitations & Trade-offs
- **Database Persistence**: The project uses SQLite for simplicity and ease of local setup. For a production serverless deployment, this should be replaced with a cloud database (e.g., PostgreSQL) to ensure data persistence across restarts.
- **Audio Transcription**: While audio messages are stored and playable, they are not currently transcribed into text due to the scope of the MVP.
- **Authentication**: The application uses a simple role selector for demonstration purposes rather than a full authentication system.

## Submission Links
- **GitHub Repository**: [Insert your GitHub Link Here]
- **Deployed Application**: [Insert your Vercel/Render Link Here]
