import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.core.config import Settings
from app.main import create_app


def test_cors_origins_accept_comma_separated_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("PAN_AI_CORS_ORIGINS", "http://a.test, http://b.test")
    assert Settings(_env_file=None).cors_origins == ["http://a.test", "http://b.test"]


def test_production_rejects_default_secret() -> None:
    with pytest.raises(ValidationError, match="PAN_AI_SECRET_KEY"):
        Settings(_env_file=None, environment="production")


def test_production_rejects_short_secret() -> None:
    with pytest.raises(ValidationError, match="PAN_AI_SECRET_KEY"):
        Settings(_env_file=None, environment="production", secret_key="too-short")


def test_production_hides_api_docs() -> None:
    settings = Settings(_env_file=None, environment="production", secret_key="x" * 48)
    with TestClient(create_app(settings)) as client:
        assert client.get("/docs").status_code == 404
        assert client.get("/openapi.json").status_code == 404
        health = client.get("/api/v1/health")
        assert health.status_code == 200
        assert health.json()["environment"] == "production"
