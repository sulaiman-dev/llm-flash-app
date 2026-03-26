# IlmFlash Monorepo

IlmFlash is an educational app for kids to learn Islamic basics using flashcards and quizzes.

## Structure

- `frontend/` TanStack Start app
- `backend/` FastAPI API with xAI-powered flashcard generation

## Prerequisites

- Node.js 20+ (recommended for latest TanStack Start tooling)
- Python 3.11+

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

## Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## AI Providers

Configure in `backend/.env`:

- `AI_PROVIDER=xai` and set `XAI_API_KEY`
- `AI_PROVIDER=fallback` for local development without API keys
