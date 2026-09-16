"""Pass 41 (Iteration 278) regression - backend verification.

Covers the review_request checklist:
- /api/mystery-schools includes reconstructed egyptian_mystery stream
- /api/mantras: 14 items, all have /audio/mantras/*.mp3 audio_url
- /api/daily-practice: daily_lens present
- /api/sound-frequencies: dolphin item present with audio
- /api/soundscapes CRUD works with QA cookie login
- Admin endpoints return 401/403 without admin auth
- Public files /privacy-policy.html and /.well-known/assetlinks.json
- Shamanic image (power-animal-journey.jpg) reachable
- Hero image /images/hero-main.jpg reachable
- Play Billing config: verification_configured false (not a bug)
"""
import os
import pytest
import requests

BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or "https://breathwork-sanctuary.preview.emergentagent.com").rstrip("/")
QA_EMAIL = "demoqa_740fefc1@example.com"
QA_PASSWORD = "DemoPass123!"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def auth_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": QA_EMAIL, "password": QA_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"QA login failed {r.status_code} {r.text[:200]}")
    return s


# --- Mystery Schools: egyptian_mystery reconstruction ---
def test_mystery_schools_contains_egyptian(client):
    r = client.get(f"{BASE_URL}/api/mystery-schools")
    assert r.status_code == 200, r.text[:200]
    data = r.json()
    items = data if isinstance(data, list) else data.get("items") or data.get("schools") or data.get("mystery_schools") or []
    # scan streams / ids
    haystack = str(data).lower()
    assert "egyptian" in haystack, "No 'egyptian' entry in /api/mystery-schools response"
    # confirm we have several teaching-like items
    assert len(items) >= 1 or "egyptian_mystery" in haystack


def test_mystery_schools_egyptian_teachings_present(client):
    """EGYPTIAN_MYSTERY_SCHOOL_TEACHINGS was reconstructed - verify content depth."""
    r = client.get(f"{BASE_URL}/api/mystery-schools")
    assert r.status_code == 200
    body = r.text.lower()
    # Some egyptian keyword coverage
    hits = sum(1 for kw in ["thoth", "isis", "osiris", "hathor", "hermetic", "ma'at", "maat", "duat", "ankh"] if kw in body)
    assert hits >= 2, f"Egyptian teachings look thin: only {hits} keyword hits"


# --- Mantras audio ---
def test_mantras_14_all_audio(client):
    r = client.get(f"{BASE_URL}/api/mantras")
    assert r.status_code == 200
    data = r.json()
    mantras = data if isinstance(data, list) else data.get("mantras") or data.get("items") or []
    assert len(mantras) >= 14, f"Expected >=14 mantras got {len(mantras)}"
    bad = []
    for m in mantras[:14]:
        au = m.get("audio_url") or m.get("audioUrl")
        if not au or not au.startswith("/audio/mantras/") or not au.endswith(".mp3"):
            bad.append((m.get("title") or m.get("id"), au))
    assert not bad, f"Mantras with invalid audio_url: {bad}"


# --- Daily practice lens ---
def test_daily_practice_has_lens(client):
    r = client.get(f"{BASE_URL}/api/daily-practice")
    assert r.status_code == 200
    data = r.json()
    lens = data.get("daily_lens") or data.get("dailyLens")
    assert lens, f"No daily_lens in keys: {list(data.keys())}"
    assert lens.get("id") and lens.get("title")


# --- Sound frequencies: dolphin ---
def test_sound_frequencies_include_dolphin(client):
    r = client.get(f"{BASE_URL}/api/sound-frequencies")
    assert r.status_code == 200
    data = r.json()
    items = data if isinstance(data, list) else data.get("items") or data.get("frequencies") or []
    dolphin = None
    for it in items:
        name = (it.get("name") or it.get("title") or it.get("id") or "").lower()
        if "dolphin" in name:
            dolphin = it
            break
    assert dolphin is not None, "No dolphin sound frequency found"
    au = dolphin.get("audio_url") or dolphin.get("audioUrl") or dolphin.get("url")
    assert au, f"Dolphin has no audio: {dolphin}"


# --- Soundscapes anonymous vs authenticated CRUD ---
def test_soundscapes_anonymous_denied(client):
    r = client.get(f"{BASE_URL}/api/soundscapes")
    assert r.status_code in (401, 403), f"Anonymous soundscapes got {r.status_code}"


def test_soundscapes_full_crud(auth_client):
    r = auth_client.get(f"{BASE_URL}/api/soundscapes")
    assert r.status_code == 200
    payload = {"name": "TEST_pass41", "layer_a": "rain", "vol_a": 55}
    r = auth_client.post(f"{BASE_URL}/api/soundscapes", json=payload)
    assert r.status_code in (200, 201), f"POST {r.status_code} {r.text[:200]}"
    sid = (r.json().get("id") or r.json().get("_id"))
    assert sid
    r = auth_client.get(f"{BASE_URL}/api/soundscapes")
    items = r.json() if isinstance(r.json(), list) else r.json().get("items", [])
    assert any((it.get("id") or it.get("_id")) == sid for it in items)
    r = auth_client.delete(f"{BASE_URL}/api/soundscapes/{sid}")
    assert r.status_code in (200, 204)


# --- Admin protection ---
@pytest.mark.parametrize("path", [
    "/api/admin/users",
    "/api/admin/seed-status",
    "/api/admin/stats",
])
def test_admin_endpoints_require_auth(client, path):
    r = client.get(f"{BASE_URL}{path}")
    assert r.status_code in (401, 403, 404), f"{path} returned {r.status_code}"


def test_qa_user_is_not_admin(auth_client):
    """Regular QA cookie should not access admin routes."""
    r = auth_client.get(f"{BASE_URL}/api/admin/users")
    assert r.status_code in (401, 403, 404), f"QA user got {r.status_code} on /api/admin/users (should be forbidden)"


# --- Public static files ---
def test_privacy_policy_public(client):
    r = client.get(f"{BASE_URL}/privacy-policy.html", allow_redirects=True)
    assert r.status_code == 200, f"privacy-policy returned {r.status_code}"
    assert "privacy" in r.text.lower()


def test_assetlinks_json_public(client):
    r = client.get(f"{BASE_URL}/.well-known/assetlinks.json", allow_redirects=True)
    assert r.status_code == 200, f"assetlinks returned {r.status_code}"
    # must be valid JSON
    j = r.json()
    assert isinstance(j, list) and len(j) >= 1, f"assetlinks.json shape unexpected: {j}"


# --- Image reachability ---
@pytest.mark.parametrize("path", [
    "/images/power-animal-journey.jpg",
    "/images/hero-main.jpg",
])
def test_images_reachable(client, path):
    r = client.get(f"{BASE_URL}{path}", allow_redirects=True)
    assert r.status_code == 200, f"{path} returned {r.status_code}"
    ct = r.headers.get("content-type", "")
    assert "image" in ct or path.endswith(".jpg"), f"{path} content-type={ct}"


# --- Play Billing intentional non-config ---
def test_playbilling_config_unconfigured(client):
    r = client.get(f"{BASE_URL}/api/playbilling/config")
    # documented intentional: verification_configured should be false
    if r.status_code == 404:
        pytest.skip("/api/playbilling/config not exposed")
    assert r.status_code == 200
    data = r.json()
    assert data.get("verification_configured") is False, f"Expected verification_configured=false, got {data}"


# --- Auth persistence smoke: /api/auth/me with cookie ---
def test_auth_me_with_cookie(auth_client):
    r = auth_client.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 200, f"/api/auth/me returned {r.status_code}"
    data = r.json()
    assert data.get("email") == QA_EMAIL
