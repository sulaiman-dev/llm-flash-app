from app.config import settings
from app.services.ai_provider import AIProvider
from app.services.fallback import FallbackProvider
from app.services.llm import XAIProvider


def resolve_ai_provider(requested: str | None) -> tuple[AIProvider, str | None]:
    name = (requested or settings.ai_provider).strip().lower()
    if name == "xai":
        if settings.xai_api_key:
            return XAIProvider(), None
        return FallbackProvider(), "xAI API key not set; using offline fallback."
    if name == "fallback":
        return FallbackProvider(), None
    return FallbackProvider(), f"Unknown provider '{requested}'; using offline fallback."


def get_ai_provider() -> AIProvider:
    provider, _warn = resolve_ai_provider(None)
    return provider
