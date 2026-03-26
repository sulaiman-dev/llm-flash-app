import json

import httpx

from app.config import settings
from app.schemas import Flashcard, GenerationRequest, GenerationResponse, QuizQuestion
from app.services.ai_provider import AIProvider


class XAIProvider(AIProvider):
    async def generate_flashcards(self, payload: GenerationRequest) -> GenerationResponse:
        model = payload.model or settings.xai_model
        content = await _chat_completion(
            provider_name="xai",
            base_url="https://api.x.ai/v1",
            api_key=settings.xai_api_key,
            model=model,
            prompt=_flashcard_prompt(payload),
            use_json_object=False,
        )
        parsed = _safe_json(content)
        cards = [_flashcard_from_dict(item) for item in parsed.get("flashcards", [])]
        return GenerationResponse(provider="xai", model=model, flashcards=cards)

    async def generate_quiz(self, payload: GenerationRequest) -> GenerationResponse:
        model = payload.model or settings.xai_model
        content = await _chat_completion(
            provider_name="xai",
            base_url="https://api.x.ai/v1",
            api_key=settings.xai_api_key,
            model=model,
            prompt=_quiz_prompt(payload),
            use_json_object=False,
        )
        parsed = _safe_json(content)
        questions = [QuizQuestion(**item) for item in parsed.get("questions", [])]
        return GenerationResponse(provider="xai", model=model, questions=questions)


async def _chat_completion(
    provider_name: str,
    base_url: str,
    api_key: str | None,
    model: str,
    prompt: str,
    *,
    use_json_object: bool = True,
) -> str:
    if not api_key:
        return "{}"

    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    body: dict = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You generate safe educational Islamic content for kids."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2 if provider_name == "xai" else 0.7,
    }
    if use_json_object:
        body["response_format"] = {"type": "json_object"}
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(f"{base_url}/chat/completions", headers=headers, json=body)
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            if use_json_object and exc.response is not None and exc.response.status_code == 400:
                return await _chat_completion(
                    provider_name=provider_name,
                    base_url=base_url,
                    api_key=api_key,
                    model=model,
                    prompt=prompt,
                    use_json_object=False,
                )
            raise
        data = response.json()
        return data["choices"][0]["message"]["content"]


def _flashcard_from_dict(item: dict) -> Flashcard:
    data = dict(item)
    data.pop("id", None)
    return Flashcard(**data)


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
    content = content.strip()
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass

    if content.startswith("```"):
        parts = content.split("```")
        for part in parts:
            candidate = part.strip()
            if candidate.startswith("json"):
                candidate = candidate[4:].strip()
            if not candidate:
                continue
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                continue

    start = content.find("{")
    end = content.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(content[start : end + 1])
        except json.JSONDecodeError:
            return {}

    return {}
