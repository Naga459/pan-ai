from functools import lru_cache
from pathlib import Path
from typing import Annotated, Literal

from pydantic import Field, SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]

_INSECURE_DEV_KEY = "dev-only-insecure-key-change-me"  # noqa: S105


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        env_prefix="PAN_AI_",
        extra="ignore",
    )

    app_name: str = "PAN AI API"
    environment: Literal["development", "test", "production"] = "development"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    database_url: str = "postgresql+psycopg://pan_ai:pan_ai_dev@127.0.0.1:6760/pan_ai"
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://127.0.0.1:5760", "http://localhost:5760"]
    )

    secret_key: SecretStr = SecretStr(_INSECURE_DEV_KEY)
    storage_dir: Path = BACKEND_DIR / "storage"
    max_upload_mb: int = 10

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        if isinstance(value, str) and not value.strip().startswith("["):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @model_validator(mode="after")
    def _require_real_secret_in_production(self) -> "Settings":
        if self.environment == "production":
            key = self.secret_key.get_secret_value()
            if key == _INSECURE_DEV_KEY or len(key) < 32:
                raise ValueError(
                    "PAN_AI_SECRET_KEY must be set to a random value of at least 32 characters "
                    "in production"
                )
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
