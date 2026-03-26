from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.data import seed_quizzes
from app.schemas import (
    AIOptionsResponse,
    AppendFlashcardsRequest,
    Flashcard,
    GenerationRequest,
    GenerationResponse,
    ProviderOption,
)
from app.services.factory import resolve_ai_provider
from app.services.fallback import FallbackProvider
from app.store import append_cards, init_store, list_cards


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_store()
    yield


app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)

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
async def get_flashcards(subject: str | None = None) -> list[Flashcard]:
    cards = list_cards()
    if subject:
        cards = [c for c in cards if c.subject == subject]
    return cards


@app.post("/flashcards", response_model=list[Flashcard])
async def post_flashcards(body: AppendFlashcardsRequest) -> list[Flashcard]:
    return append_cards(body.flashcards)


@app.get("/quizzes")
async def list_quizzes():
    return seed_quizzes


@app.get("/ai/options", response_model=AIOptionsResponse)
async def ai_options() -> AIOptionsResponse:
    return AIOptionsResponse(
        default_provider="xai" if settings.xai_api_key else "fallback",
        default_models={
            "xai": settings.xai_model,
            "fallback": "static-seed",
        },
        providers=[
            ProviderOption(
                id="xai",
                label="xAI (Grok)",
                configured=bool(settings.xai_api_key),
                models=["grok-4-latest", "grok-3", "grok-3-mini"],
            ),
            ProviderOption(
                id="fallback",
                label="Offline (demo)",
                configured=True,
                models=["static-seed"],
            ),
        ],
    )


@app.post("/ai/generate-flashcards", response_model=GenerationResponse)
async def generate_flashcards(payload: GenerationRequest) -> GenerationResponse:
    provider, warning = resolve_ai_provider(payload.provider)
    try:
        result = await provider.generate_flashcards(payload)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=_provider_error_detail(exc)) from exc
    return result.model_copy(
        update={
            "used_fallback": isinstance(provider, FallbackProvider),
            "warning": warning,
        }
    )


@app.post("/ai/generate-quiz", response_model=GenerationResponse)
async def generate_quiz(payload: GenerationRequest) -> GenerationResponse:
    provider, warning = resolve_ai_provider(payload.provider)
    try:
        result = await provider.generate_quiz(payload)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=_provider_error_detail(exc)) from exc
    return result.model_copy(
        update={
            "used_fallback": isinstance(provider, FallbackProvider),
            "warning": warning,
        }
    )


def _provider_error_detail(exc: httpx.HTTPError) -> str:
    response = getattr(exc, "response", None)
    if response is None:
        return f"AI provider request failed: {exc}"

    body = response.text.strip()
    if len(body) > 500:
        body = body[:500] + "..."
    if body:
        return f"AI provider request failed ({response.status_code}): {body}"
    return f"AI provider request failed: {exc}"
