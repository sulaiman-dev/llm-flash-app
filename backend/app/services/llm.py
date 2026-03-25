import json

import httpx

from app.config import settings
from app.schemas import Flashcard, GenerationRequest, GenerationResponse, QuizQuestion
from app.services.ai_provider import AIProvider


class OpenAIProvider(AIProvider):
    async def generate_flashcards(self, payload: GenerationRequest) -> GenerationResponse:
        content = await _chat_completion(
            base_url="https://api.openai.com/v1",
            api_key=settings.openai_api_key,
            model=settings.openai_model,
            prompt=_flashcard_prompt(payload),
        )
        parsed = _safe_json(content)
        cards = [Flashcard(**item) for item in parsed.get("flashcards", [])]
        return GenerationResponse(
            provider="openai",
            model=settings.openai_model,
            flashcards=cards,
        )

    async def generate_quiz(self, payload: GenerationRequest) -> GenerationResponse:
        content = await _chat_completion(
            base_url="https://api.openai.com/v1",
            api_key=settings.openai_api_key,
            model=settings.openai_model,
            prompt=_quiz_prompt(payload),
        )
        parsed = _safe_json(content)
        questions = [QuizQuestion(**item) for item in parsed.get("questions", [])]
        return GenerationResponse(
            provider="openai",
            model=settings.openai_model,
            questions=questions,
        )


class XAIProvider(AIProvider):
    async def generate_flashcards(self, payload: GenerationRequest) -> GenerationResponse:
        content = await _chat_completion(
            base_url="https://api.x.ai/v1",
            api_key=settings.xai_api_key,
            model=settings.xai_model,
            prompt=_flashcard_prompt(payload),
        )
        parsed = _safe_json(content)
        cards = [Flashcard(**item) for item in parsed.get("flashcards", [])]
        return GenerationResponse(provider="xai", model=settings.xai_model, flashcards=cards)

    async def generate_quiz(self, payload: GenerationRequest) -> GenerationResponse:
        content = await _chat_completion(
            base_url="https://api.x.ai/v1",
            api_key=settings.xai_api_key,
            model=settings.xai_model,
            prompt=_quiz_prompt(payload),
        )
        parsed = _safe_json(content)
        questions = [QuizQuestion(**item) for item in parsed.get("questions", [])]
        return GenerationResponse(provider="xai", model=settings.xai_model, questions=questions)


async def _chat_completion(base_url: str, api_key: str | None, model: str, prompt: str) -> str:
    if not api_key:
        return "{}"

    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You generate safe educational Islamic content for kids."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
        "response_format": {"type": "json_object"},
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(f"{base_url}/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        body = response.json()
        return body["choices"][0]["message"]["content"]


def _flashcard_prompt(payload: GenerationRequest) -> str:
    return (
        "Return JSON with key 'flashcards'. "
        "Each item must include: subject, front_text, back_text, arabic_text, transliteration, "
        "translation, difficulty, age_group, tags. "
        f"Create {payload.count} flashcards for subject '{payload.subject}' on topic '{payload.topic}' "
        f"for children age group '{payload.age_group}'. Keep language simple and authentic."
    )


def _quiz_prompt(payload: GenerationRequest) -> str:
    return (
        "Return JSON with key 'questions'. "
        "Each item must include: subject, question, choices (4), correct_answer, explanation. "
        f"Create {payload.count} quiz questions for subject '{payload.subject}' on topic '{payload.topic}' "
        f"for children age group '{payload.age_group}'. Keep it easy and engaging."
    )


def _safe_json(content: str) -> dict:
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {}
