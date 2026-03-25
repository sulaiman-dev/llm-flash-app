from app.config import settings
from app.services.ai_provider import AIProvider
from app.services.fallback import FallbackProvider
from app.services.llm import OpenAIProvider, XAIProvider


def get_ai_provider() -> AIProvider:
    provider = settings.ai_provider.strip().lower()
    if provider == "openai":
        return OpenAIProvider()
    if provider == "xai":
        return XAIProvider()
    return FallbackProvider()
