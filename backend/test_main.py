from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_docs_available():
    response = client.get("/docs")

    assert response.status_code == 200

def test_applications_without_token():
    response = client.get("/applications")

    assert response.status_code == 401

def test_me_without_token():
    response = client.get("/me")

    assert response.status_code == 401

def test_register_user():
    response = client.post(
        "/register",
        json={
            "name": "Test User",
            "email": "testuser@example.com",
            "password": "123456",
        },
    )

    assert response.status_code == 200