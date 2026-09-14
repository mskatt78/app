"""Iteration 277 audit-pass verification (backend)."""
import os
import re
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://breathwork-sanctuary.preview.emergentagent.com").rstrip("/")
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


# === YOGA: pose-specific master_embodiment_protocol ===
def test_yoga_pose_specific_protocol(client):
    r = client.get(f"{BASE_URL}/api/yoga/poses")
    assert r.status_code == 200
    poses = r.json()
    assert isinstance(poses, list) and len(poses) >= 3
    required_keys = {
        "preparation_phase", "anatomy_awareness", "breath_guidance",
        "embodiment_phase", "modifications", "integration_phase",
    }
    protocols = []
    checked = 0
    for pose in poses:
        prot = pose.get("master_embodiment_protocol")
        assert prot, f"Missing master_embodiment_protocol for {pose.get('name')}"
        missing = required_keys - set(prot.keys())
        assert not missing, f"{pose.get('name')} missing keys: {missing}"
        # collect a signature to compare uniqueness
        sig = str(prot.get("anatomy_awareness", ""))[:200] + str(prot.get("modifications", ""))[:200]
        protocols.append((pose.get("name"), sig))
        checked += 1
        if checked >= 5:
            break
    # ensure content is not identical across poses
    sigs = {sig for _, sig in protocols}
    assert len(sigs) >= 2, f"All pose protocols look identical: {protocols}"


# === MANTRAS: audio URLs ===
def test_mantra_audio_urls(client):
    r = client.get(f"{BASE_URL}/api/mantras")
    assert r.status_code == 200
    data = r.json()
    mantras = data if isinstance(data, list) else data.get("mantras") or data.get("items") or []
    assert len(mantras) >= 14, f"Expected >=14 mantras got {len(mantras)}"
    for m in mantras[:14]:
        au = m.get("audio_url") or m.get("audioUrl")
        assert au and au.startswith("/audio/mantras/"), f"Bad audio_url: {au} for {m.get('title') or m.get('name')}"


@pytest.mark.parametrize("path", ["/audio/mantras/1.mp3", "/audio/mantras/7.mp3"])
def test_mantra_audio_files_reachable(client, path):
    r = client.get(f"{BASE_URL}{path}", allow_redirects=True)
    assert r.status_code == 200, f"{path} returned {r.status_code}"


# === DAILY PRACTICE lens ===
def test_daily_practice_lens(client):
    r = client.get(f"{BASE_URL}/api/daily-practice")
    assert r.status_code == 200
    data = r.json()
    lens = data.get("daily_lens") or data.get("dailyLens")
    assert lens, f"No daily_lens in response keys: {list(data.keys())}"
    assert lens.get("id") and lens.get("title") and lens.get("guidance")


# === Deepening arcs not identical to base ===
@pytest.mark.parametrize("endpoint", ["/api/elemental-practices", "/api/shamanic-practices"])
def test_deepening_not_repeat_base(client, endpoint):
    r = client.get(f"{BASE_URL}{endpoint}")
    assert r.status_code == 200
    data = r.json()
    items = data if isinstance(data, list) else data.get("items") or data.get("practices") or []
    # flatten
    flat = []
    def walk(x):
        if isinstance(x, list):
            for i in x: walk(i)
        elif isinstance(x, dict):
            flat.append(x)
            for v in x.values(): walk(v)
    walk(items)
    by_id = {it.get("id"): it for it in flat if it.get("id")}
    deepening = [it for _id, it in by_id.items() if "-deepening-" in str(_id)]
    if not deepening:
        pytest.skip(f"No deepening items in {endpoint}")
    stage_names = ["Subtle Body Attunement", "Shadow Integration", "Elemental", "Attunement", "Integration"]
    problems = []
    for d in deepening[:10]:
        base_id = re.sub(r"-deepening-.*$", "", d.get("id", ""))
        base = by_id.get(base_id)
        d_desc = (d.get("description") or "").strip()
        b_desc = ((base or {}).get("description") or "").strip()
        if base and d_desc and d_desc == b_desc:
            problems.append(d.get("id"))
        title = d.get("title") or d.get("name") or ""
        if not any(s.lower() in title.lower() for s in stage_names):
            # not fatal but track
            pass
    assert not problems, f"Deepening items repeat base descriptions: {problems}"


# === Shamanic image overrides ===
def test_shamanic_image_overrides(client):
    r = client.get(f"{BASE_URL}/api/shamanic-practices")
    assert r.status_code == 200
    data = r.json()
    items = data if isinstance(data, list) else data.get("items") or data.get("practices") or []
    flat = []
    def walk(x):
        if isinstance(x, list):
            for i in x: walk(i)
        elif isinstance(x, dict):
            flat.append(x)
            for v in x.values(): walk(v)
    walk(items)
    expected = {
        "power-animal-journey": "/images/power-animal-journey.jpg",
        "ancestral-healing-ritual": "/images/ancestral-healing-ritual.jpg",
    }
    found = {}
    for it in flat:
        img = it.get("image_url") or it.get("imageUrl") or ""
        for key in expected:
            if key in img:
                found.setdefault(key, img)
    for key, url in expected.items():
        assert found.get(key) == url, f"{key} image = {found.get(key)}, expected {url}"
        # verify file resolves
        rr = client.get(f"{BASE_URL}{url}", allow_redirects=True)
        assert rr.status_code == 200, f"{url} returned {rr.status_code}"


# === Mindfulness linked_practices sanity ===
def test_mindfulness_linked_practices(client):
    r = client.get(f"{BASE_URL}/api/mindfulness")
    assert r.status_code == 200
    data = r.json()
    items = data if isinstance(data, list) else data.get("items") or data.get("practices") or []
    checked = 0
    for it in items:
        links = it.get("linked_practices") or it.get("linkedPractices") or []
        routes = []
        for lp in links:
            if isinstance(lp, dict):
                routes.append(lp.get("route") or lp.get("path") or lp.get("href"))
            elif isinstance(lp, str):
                routes.append(lp)
        # no self-referencing /mindfulness
        for rt in routes:
            if rt:
                assert not rt.rstrip("/").endswith("/mindfulness"), f"Self-referencing /mindfulness in {it.get('id')}"
        # no duplicates
        clean = [r for r in routes if r]
        assert len(clean) == len(set(clean)), f"Duplicate routes in {it.get('id')}: {clean}"
        checked += 1
        if checked >= 20:
            break


# === Soundscapes CRUD regression ===
def test_soundscapes_anonymous_401(client):
    r = client.get(f"{BASE_URL}/api/soundscapes")
    assert r.status_code in (401, 403), f"Anonymous got {r.status_code}"


def test_soundscapes_crud(auth_client):
    # LIST
    r = auth_client.get(f"{BASE_URL}/api/soundscapes")
    assert r.status_code == 200
    # CREATE
    payload = {"name": "TEST_iter277", "layer_a": "rain", "vol_a": 60}
    r = auth_client.post(f"{BASE_URL}/api/soundscapes", json=payload)
    assert r.status_code in (200, 201), f"POST {r.status_code} {r.text[:200]}"
    created = r.json()
    sid = created.get("id") or created.get("_id")
    assert sid, f"No id: {created}"
    # GET verify persist
    r = auth_client.get(f"{BASE_URL}/api/soundscapes")
    assert r.status_code == 200
    items = r.json() if isinstance(r.json(), list) else r.json().get("items", [])
    assert any((it.get("id") or it.get("_id")) == sid for it in items), "Created not found"
    # DELETE
    r = auth_client.delete(f"{BASE_URL}/api/soundscapes/{sid}")
    assert r.status_code in (200, 204)
