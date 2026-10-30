from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from app import __version__
from app.db.session import get_db


class _BrokenSession:
    def execute(self, *_args, **_kwargs):
        raise OperationalError("SELECT 1", {}, Exception("connection refused"))


class _HealthySession:
    def execute(self, *_args, **_kwargs):
        return None


def test_health_reports_service_metadata(client: TestClient) -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "PAN AI API",
        "version": __version__,
        "environment": "test",
    }


def test_readiness_ok_when_database_reachable(client: TestClient) -> None:
    client.app.dependency_overrides[get_db] = lambda: _HealthySession()
    response = client.get("/api/v1/health/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "ready", "database": "ok"}


def test_readiness_503_when_database_unreachable(client: TestClient) -> None:
    client.app.dependency_overrides[get_db] = lambda: _BrokenSession()
    response = client.get("/api/v1/health/ready")
    assert response.status_code == 503
    assert response.json() == {"status": "degraded", "database": "unavailable"}


def test_cors_allows_frontend_origin(client: TestClient) -> None:
    response = client.options(
        "/api/v1/health",
        headers={"Origin": "http://127.0.0.1:5760", "Access-Control-Request-Method": "GET"},
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:5760"


def test_cors_rejects_unknown_origin(client: TestClient) -> None:
    response = client.options(
        "/api/v1/health",
        headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "GET"},
    )
    assert "access-control-allow-origin" not in response.headers
