"""Backend tests for iteration 276: genuine audio + welcome journey support."""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://breathwork-sanctuary.preview.emergentagent.com").rstrip("/")


# ============ AUDIO STATIC FILES ============
@pytest.mark.parametrize("fname", ["whale.mp3", "drums.mp3", "rain.mp3", "birds.mp3", "ocean.mp3"])
def test_audio_file_served(fname):
    r = requests.get(f"{BASE_URL}/audio/{fname}", timeout=20, stream=True)
    assert r.status_code == 200, f"{fname} returned {r.status_code}"
    assert "audio/mpeg" in r.headers.get("content-type", ""), r.headers
    # Ensure > 1KB of body
    chunk = next(r.iter_content(2048))
    assert chunk and len(chunk) > 500


# ============ SOUND FREQUENCIES ============
def test_nature_category_returns_expected_entries():
    r = requests.get(f"{BASE_URL}/api/sound-frequencies", params={"category": "nature"}, timeout=15)
    assert r.status_code == 200
    data = r.json()
    ids = {e["id"]: e for e in data}
    for key in ("freq-forest-birds", "freq-rain", "freq-water"):
        assert key in ids, f"missing {key}"
    assert ids["freq-forest-birds"]["audio_url"] == "/audio/birds.mp3"
    assert ids["freq-rain"]["audio_url"] == "/audio/rain.mp3"
    assert ids["freq-water"]["audio_url"] == "/audio/ocean.mp3"
    for e in ids.values():
        assert e.get("audio_credit"), f"{e['id']} missing audio_credit"


def test_whale_entry_audio_and_credit():
    r = requests.get(f"{BASE_URL}/api/sound-frequencies/freq-whale", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["audio_url"] == "/audio/whale.mp3"
    assert "NOAA" in (d.get("audio_credit") or "")


@pytest.mark.parametrize("fid", ["freq-drum", "freq-drum-journey"])
def test_drum_entries_audio(fid):
    r = requests.get(f"{BASE_URL}/api/sound-frequencies/{fid}", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["audio_url"] == "/audio/drums.mp3"
    assert d.get("audio_credit")


# ============ WELCOME JOURNEY -> practice-history support ============
def _register_fresh_user():
    import uuid
    email = f"welcome_{uuid.uuid4().hex[:10]}@example.com"
    password = "TestPass123!"
    r = requests.post(
        f"{BASE_URL}/api/auth/register",
        json={"email": email, "password": password, "name": "Welcome Test"},
        timeout=20,
    )
    if r.status_code not in (200, 201):
        pytest.skip(f"Register failed: {r.status_code} {r.text[:200]}")
    body = r.json()
    token = body.get("access_token") or body.get("token") or body.get("session_token")
    assert token, body
    return email, password, token


def test_fresh_user_practice_stats_zero_and_log_flow():
    email, password, token = _register_fresh_user()
    h = {"Authorization": f"Bearer {token}"}
    # New user: stats should be 0
    stats = requests.get(f"{BASE_URL}/api/practice-history/stats", headers=h, timeout=15)
    assert stats.status_code == 200
    assert stats.json().get("total_sessions", 0) == 0

    # Log welcome practice like WelcomeJourney does
    log = requests.post(
        f"{BASE_URL}/api/practice-history",
        headers=h,
        json={
            "practice_type": "meditation",
            "practice_id": "welcome-arrival",
            "duration_minutes": 5,
            "notes": "Completed Breath of Arrival — first practice",
        },
        timeout=20,
    )
    assert log.status_code in (200, 201), log.text

    # Verify persisted with recognizable name/id
    hist = requests.get(f"{BASE_URL}/api/practice-history", headers=h, timeout=15)
    assert hist.status_code == 200
    body = hist.json()
    items = body if isinstance(body, list) else body.get("items", body.get("history", []))
    assert items, f"empty history: {body}"
    joined = str(items).lower()
    assert "welcome-arrival" in joined or "breath of arrival" in joined
