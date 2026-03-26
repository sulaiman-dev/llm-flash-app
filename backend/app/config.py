from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "IlmFlash API"
    app_env: str = "development"
    ai_provider: str = "xai"
    xai_api_key: str | None = None
    xai_model: str = "grok-4-latest"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
