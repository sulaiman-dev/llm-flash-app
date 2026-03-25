from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "IlmFlash API"
    app_env: str = "development"
    ai_provider: str = "openai"
    openai_api_key: str | None = None
    xai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    xai_model: str = "grok-2-latest"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
