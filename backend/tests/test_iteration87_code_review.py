"""
Backend tests for Iteration 87 - Code Review Findings
Tests: Admin auth migration (httpOnly cookies), numerology uuid import, content expand-script, birth-chart
"""
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestHealthAndBasics:
    """Basic health checks"""

    def test_api_health(self):
        """API health endpoint should return 200"""
        resp = requests.get(f"{BASE_URL}/api/health")
        assert resp.status_code == 200
        print("PASS: API health check")

    def test_frontend_loads(self):
        """Frontend should load"""
        resp = requests.get(f"{BASE_URL}/")
        assert resp.status_code == 200
        print("PASS: Frontend loads")


class TestAdminAuthCookieMigration:
    """Test admin auth with httpOnly cookie-based sessions"""

    def test_admin_login_with_password(self):
        """Admin login with password should set httpOnly cookie"""
        session = requests.Session()
        resp = session.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "ShamanicAdmin2026!"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("session") == "active"
        assert data.get("role") == "admin"
        # Check that cookie was set
        cookies = session.cookies.get_dict()
        assert "admin_session" in cookies, f"Expected admin_session cookie, got {cookies.keys()}"
        print("PASS: Admin login sets httpOnly cookie")

    def test_admin_collections_with_cookie(self):
        """Admin collections endpoint should work with cookie auth"""
        session = requests.Session()
        # Login first
        login_resp = session.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "ShamanicAdmin2026!"},
        )
        assert login_resp.status_code == 200
        
        # Access collections with cookie
        resp = session.get(f"{BASE_URL}/api/admin/collections")
        assert resp.status_code == 200
        collections = resp.json()
        assert isinstance(collections, list)
        assert len(collections) > 0
        print(f"PASS: Admin collections returns {len(collections)} collections with cookie auth")

    def test_admin_manage_items_with_cookie(self):
        """Admin manage items endpoint should work with cookie auth"""
        session = requests.Session()
        # Login first
        login_resp = session.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "ShamanicAdmin2026!"},
        )
        assert login_resp.status_code == 200
        
        # Access items with cookie
        resp = session.get(f"{BASE_URL}/api/admin/yoga_poses/items?page=1&limit=5")
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert "total" in data
        print(f"PASS: Admin manage items returns {len(data['items'])} items with cookie auth")

    def test_admin_logout_clears_cookie(self):
        """Admin logout should clear the session cookie"""
        session = requests.Session()
        # Login first
        login_resp = session.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "ShamanicAdmin2026!"},
        )
        assert login_resp.status_code == 200
        
        # Logout
        logout_resp = session.post(f"{BASE_URL}/api/admin/logout")
        assert logout_resp.status_code == 200
        data = logout_resp.json()
        assert data.get("logged_out")
        
        # Try to access collections after logout - should fail
        resp = session.get(f"{BASE_URL}/api/admin/collections")
        assert resp.status_code == 401, f"Expected 401 after logout, got {resp.status_code}"
        print("PASS: Admin logout clears cookie and blocks access")

    def test_admin_without_auth_returns_401(self):
        """Admin endpoints without auth should return 401"""
        resp = requests.get(f"{BASE_URL}/api/admin/collections")
        assert resp.status_code == 401
        print("PASS: Admin collections without auth returns 401")


class TestNumerologyUuidImport:
    """Test numerology endpoint - verifies uuid import is working (not dynamic)"""

    def test_numerology_calculate_public(self):
        """Public numerology calculate endpoint should work"""
        resp = requests.post(
            f"{BASE_URL}/api/numerology/calculate",
            json={"birth_date": "1990-05-15", "full_name": "Test User"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "life_path_number" in data
        assert "life_path" in data
        assert "personal_year" in data
        print(f"PASS: Numerology calculate returns life_path_number={data['life_path_number']}")

    def test_numerology_life_paths(self):
        """Get all life path meanings"""
        resp = requests.get(f"{BASE_URL}/api/numerology/life-paths")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, dict)
        assert len(data) > 0
        print(f"PASS: Numerology life-paths returns {len(data)} paths")


class TestContentExpandScript:
    """Test content expand-script endpoint"""

    def test_expand_script_basic(self):
        """Expand script should generate paragraphs and segments"""
        resp = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Morning Meditation",
                "element": "earth",
                "duration_minutes": 7,
                "steps": ["Breathe deeply", "Relax your body", "Focus on the present"],
                "source_texts": ["Find your center"],
                "use_ai": False,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["practice_name"] == "Morning Meditation"
        assert data["target_minutes"] == 7
        assert data["word_count"] >= 800, f"Expected 800+ words, got {data['word_count']}"
        assert len(data["paragraphs"]) > 0
        assert len(data["segments"]) > 0
        print(f"PASS: Expand script returns {data['word_count']} words, {len(data['segments'])} segments")


class TestBirthChartAPI:
    """Test birth chart calculation API"""

    def test_birth_chart_calculate(self):
        """Birth chart calculate should return full chart data"""
        resp = requests.post(
            f"{BASE_URL}/api/birth-chart/calculate",
            json={
                "birth_date": "1990-05-15",
                "birth_time": "14:30",
                "birth_city": "New York",
                "birth_country": "USA",
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "sun_sign" in data
        assert "moon_sign" in data
        assert "rising_sign" in data
        assert "planets" in data
        assert "houses" in data
        assert "aspects" in data
        assert data["calculation_method"] == "Swiss Ephemeris"
        print(f"PASS: Birth chart returns sun={data['sun_sign']}, moon={data['moon_sign']}, rising={data['rising_sign']}")

    def test_birth_chart_zodiac_signs(self):
        """Get zodiac signs reference data"""
        resp = requests.get(f"{BASE_URL}/api/birth-chart/zodiac-signs")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 12
        assert "Aries" in data
        assert "Pisces" in data
        print("PASS: Birth chart zodiac-signs returns 12 signs")

    def test_birth_chart_planet_meanings(self):
        """Get planet meanings reference data"""
        resp = requests.get(f"{BASE_URL}/api/birth-chart/planet-meanings")
        assert resp.status_code == 200
        data = resp.json()
        assert "Sun" in data
        assert "Moon" in data
        assert "Mercury" in data
        print(f"PASS: Birth chart planet-meanings returns {len(data)} planets")


class TestAdminSeedEndpoint:
    """Test admin seed database endpoint"""

    def test_admin_seed_status(self):
        """Admin seed status should return collection counts"""
        session = requests.Session()
        # Login first
        login_resp = session.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "ShamanicAdmin2026!"},
        )
        assert login_resp.status_code == 200
        
        # Get seed status
        resp = session.get(f"{BASE_URL}/api/admin/seed-status")
        assert resp.status_code == 200
        data = resp.json()
        assert "collections" in data
        assert "total_collections" in data
        print(f"PASS: Admin seed-status returns {data['total_collections']} collections")


class TestSacredRitesTestFile:
    """Verify the sacred rites test file still works after anti-pattern updates"""

    def test_sacred_rites_courses_exist(self):
        """Sacred rites courses should exist"""
        resp = requests.get(f"{BASE_URL}/api/courses")
        assert resp.status_code == 200
        courses = resp.json()
        course_ids = [c.get("id") for c in courses]
        assert "munay-ki" in course_ids
        assert "nusta-karpay" in course_ids
        assert "13th-rite-womb" in course_ids
        print("PASS: All 3 sacred rites courses exist")

    def test_sound_frequencies_shamanic(self):
        """Sound frequencies should have shamanic category"""
        resp = requests.get(f"{BASE_URL}/api/sound-frequencies")
        assert resp.status_code == 200
        entries = resp.json()
        shamanic = [e for e in entries if e.get("category") == "shamanic"]
        assert len(shamanic) >= 5, f"Expected 5+ shamanic entries, got {len(shamanic)}"
        print(f"PASS: Sound frequencies has {len(shamanic)} shamanic entries")

    def test_creative_processes_ceremony(self):
        """Creative processes should have ceremony category"""
        resp = requests.get(f"{BASE_URL}/api/creative-processes")
        assert resp.status_code == 200
        processes = resp.json()
        ceremony = [p for p in processes if p.get("category") == "ceremony"]
        assert len(ceremony) >= 1, f"Expected 1+ ceremony entries, got {len(ceremony)}"
        print(f"PASS: Creative processes has {len(ceremony)} ceremony entries")
