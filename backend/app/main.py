from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.data import seed_flashcards, seed_quizzes
from app.schemas import GenerationRequest, GenerationResponse
from app.services.factory import get_ai_provider

app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/subjects")
async def subjects() -> list[str]:
    return ["arabic_letters", "duas", "facts"]


@app.get("/flashcards")
async def list_flashcards():
    return seed_flashcards


@app.get("/quizzes")
async def list_quizzes():
    return seed_quizzes


@app.post("/ai/generate-flashcards", response_model=GenerationResponse)
async def generate_flashcards(payload: GenerationRequest) -> GenerationResponse:
    provider = get_ai_provider()
    return await provider.generate_flashcards(payload)


@app.post("/ai/generate-quiz", response_model=GenerationResponse)
async def generate_quiz(payload: GenerationRequest) -> GenerationResponse:
    provider = get_ai_provider()
    return await provider.generate_quiz(payload)
