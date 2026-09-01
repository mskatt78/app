"""
Tests for Sacred Journey backend endpoints (practice-history + stats) used by
the Dashboard SacredJourneyWidget, plus a smoke check for the TTS endpoint
used by the offline meditation download flow.
"""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or "https://breathwork-sanctuary.preview.emergentagent.com"
API = f"{BASE_URL}/api"

QA_EMAIL = "demoqa_740fefc1@example.com"
QA_PASSWORD = "DemoPass123!"


@pytest.fixture(scope="module")
def auth_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": QA_EMAIL, "password": QA_PASSWORD}, timeout=30)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "user" in data
    return s


# ---------- Practice history stats ----------

class TestPracticeHistoryStats:
    def test_stats_requires_auth(self):
        r = requests.get(f"{API}/practice-history/stats", timeout=15)
        assert r.status_code in (401, 403)

    def test_stats_shape(self, auth_session):
        r = auth_session.get(f"{API}/practice-history/stats", timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        for key in ("total_sessions", "total_minutes", "by_type", "current_streak"):
            assert key in data, f"Missing '{key}' in stats response"
        assert isinstance(data["total_sessions"], int)
        assert isinstance(data["total_minutes"], int) or isinstance(data["total_minutes"], float)
        assert isinstance(data["by_type"], dict)
        assert isinstance(data["current_streak"], int)

    def test_log_and_stats_persist(self, auth_session):
        # Get baseline
        r0 = auth_session.get(f"{API}/practice-history/stats", timeout=15)
        assert r0.status_code == 200
        base = r0.json()

        # Log a practice
        payload = {
            "practice_type": "meditation",
            "practice_id": "test_offline_qa",
            "duration_minutes": 10,
            "notes": "Completed Inner Peace Journey",
        }
        r1 = auth_session.post(f"{API}/practice-history", json=payload, timeout=15)
        assert r1.status_code == 200, r1.text
        entry = r1.json()
        assert entry["practice_type"] == "meditation"
        assert entry["duration_minutes"] == 10
        assert entry["notes"] == "Completed Inner Peace Journey"
        assert "log_id" in entry
        assert "completed_at" in entry
        # No mongo _id in response
        assert "_id" not in entry

        # Verify stats increment
        r2 = auth_session.get(f"{API}/practice-history/stats", timeout=15)
        assert r2.status_code == 200
        after = r2.json()
        assert after["total_sessions"] == base["total_sessions"] + 1
        assert after["total_minutes"] == base["total_minutes"] + 10
        assert "meditation" in after["by_type"]

        # Verify recent list contains the entry
        r3 = auth_session.get(f"{API}/practice-history", params={"limit": 4}, timeout=15)
        assert r3.status_code == 200
        history = r3.json()
        assert isinstance(history, list)
        assert any(h.get("notes") == "Completed Inner Peace Journey" for h in history)
        for h in history:
            assert "_id" not in h


# ---------- TTS endpoint (used by offline download) ----------

class TestTtsBase64Endpoint:
    def test_tts_generate_base64_public(self):
        # Public endpoint — no auth required for TTS in this app
        r = requests.post(
            f"{API}/tts/generate-base64",
            json={"text": "Breathe in peace.", "voice": "alloy", "speed": 0.9},
            timeout=60,
        )
        # Accept 200 (normal) or 402/503 if provider budget exceeded
        assert r.status_code in (200, 402, 503), r.text
        if r.status_code == 200:
            data = r.json()
            assert "audio_base64" in data
            assert isinstance(data["audio_base64"], str)
            assert len(data["audio_base64"]) > 100
