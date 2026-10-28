# AI Interview Partner

An intelligent, interactive mock interview platform featuring a dual-window live video and AI avatar room.

## Project Structure
```
ai-interview-partner/
├── frontend/                          # Next.js + TypeScript + shadcn/ui + Tailwind CSS
│   ├── app/
│   │   ├── layout.tsx                 # Root layout (Roboto font, purple theme)
│   │   ├── page.tsx                   # Landing / upload page
│   │   ├── interview/
│   │   │   └── page.tsx               # Interview room (dual windows)
│   │   └── globals.css                # Tailwind + custom purple theme
│   ├── components/
│   │   ├── ui/                        # UI components (Button, Card, etc.)
│   │   ├── upload/                    # Resume & JD input components
│   │   ├── interview/                 # Dual window, avatar, webcam, questions
│   │   └── layout/                    # Header & navigation
│   ├── lib/                           # API client & utilities
│   ├── hooks/                         # Webcam & Audio hooks
│   └── types/                         # Shared TypeScript types
│
├── backend/                           # FastAPI + Python
│   ├── app/
│   │   ├── main.py                    # App entry & CORS setup
│   │   ├── routers/                   # Resume, interview, and voice endpoints
│   │   ├── services/                  # PDF parsing, LLM prompt engineering, TTS
│   │   ├── models/                    # Pydantic schemas
│   │   └── config.py                  # Environment config
│   ├── requirements.txt
│   └── .env.example
│
└── README.md
```

## Quick Start

### Backend (FastAPI)
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your HF_TOKEN (Hugging Face token)

uvicorn app.main:app --reload --port 8000
```

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.