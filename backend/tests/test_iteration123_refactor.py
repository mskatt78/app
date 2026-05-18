"""
Iteration 123 - Regression tests after major refactor:
- Dashboard modularization (StreakWidget, SacredPracticeWidget, DailyGuidanceGrid, DashboardActionPanels)
- PracticeTimer logic extraction to usePracticeTimerEngine
- Guided toning intensity settings (Off/Subtle/Immersive)
- Backend type hints in admin.py and birth_chart.py
"""
import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

class TestHealthAndBasicEndpoints:
    """Basic health and endpoint availability tests"""
    
    def test_health_endpoint(self):
        """Test health endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        print("✓ Health endpoint working")
    
    def test_dashboard_daily_endpoint(self):
        """Test dashboard daily data endpoint"""
        response = requests.get(f"{BASE_URL}/api/dashboard/daily", timeout=10)
        assert response.status_code == 200
        data = response.json()
        # Verify expected fields for dashboard widgets
        assert "current_moon" in data or "daily_pose" in data or "daily_crystal" in data
        print("✓ Dashboard daily endpoint working")
    
    def test_daily_practice_endpoint(self):
        """Test daily practice endpoint for SacredPracticeWidget"""
        response = requests.get(f"{BASE_URL}/api/daily-practice", timeout=10)
        assert response.status_code == 200
        data = response.json()
        # Verify expected fields
        assert "moon_phase" in data or "day_theme" in data or "morning_practice" in data
        print("✓ Daily practice endpoint working")


class TestAdminEndpointsTypeHints:
    """Test admin.py endpoints still work after type hint additions"""
    
    def test_admin_collections_requires_auth(self):
        """Test admin collections endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/collections", timeout=10)
        assert response.status_code == 401
        print("✓ Admin collections requires auth (expected)")
    
    def test_admin_login_endpoint_exists(self):
        """Test admin login endpoint exists"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "wrong_password"},
            timeout=10
        )
        # Should return 401 for wrong password, not 404
        assert response.status_code == 401
        print("✓ Admin login endpoint exists and validates password")
    
    def test_admin_login_with_correct_password(self):
        """Test admin login with correct password"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "ShamanicAdmin2026!"},
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("session") == "active"
        assert data.get("role") == "admin"
        print("✓ Admin login works with correct password")
    
    def test_admin_seed_status_requires_auth(self):
        """Test seed status endpoint requires auth"""
        response = requests.get(f"{BASE_URL}/api/admin/seed-status", timeout=10)
        assert response.status_code == 401
        print("✓ Admin seed-status requires auth (expected)")


class TestBirthChartEndpointsTypeHints:
    """Test birth_chart.py endpoints still work after type hint additions"""
    
    def test_zodiac_signs_endpoint(self):
        """Test zodiac signs endpoint"""
        response = requests.get(f"{BASE_URL}/api/birth-chart/zodiac-signs", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "Aries" in data
        assert "Pisces" in data
        assert data["Aries"]["element"] == "Fire"
        print("✓ Zodiac signs endpoint working")
    
    def test_planet_meanings_endpoint(self):
        """Test planet meanings endpoint"""
        response = requests.get(f"{BASE_URL}/api/birth-chart/planet-meanings", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "Sun" in data
        assert "Moon" in data
        assert "meaning" in data["Sun"]
        print("✓ Planet meanings endpoint working")
    
    def test_house_meanings_endpoint(self):
        """Test house meanings endpoint"""
        response = requests.get(f"{BASE_URL}/api/birth-chart/house-meanings", timeout=10)
        assert response.status_code == 200
        data = response.json()
        # House meanings use string keys
        assert "1" in data or 1 in data
        print("✓ House meanings endpoint working")
    
    def test_aspect_meanings_endpoint(self):
        """Test aspect meanings endpoint"""
        response = requests.get(f"{BASE_URL}/api/birth-chart/aspect-meanings", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "Conjunction" in data
        assert "Trine" in data
        print("✓ Aspect meanings endpoint working")
    
    def test_birth_chart_calculate(self):
        """Test birth chart calculation endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/birth-chart/calculate",
            json={
                "birth_date": "1990-06-15",
                "birth_time": "14:30",
                "birth_city": "New York",
                "birth_country": "USA"
            },
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        assert "sun_sign" in data
        assert "moon_sign" in data
        assert "rising_sign" in data
        assert "planets" in data
        assert "houses" in data
        print(f"✓ Birth chart calculation working - Sun: {data['sun_sign']}, Moon: {data['moon_sign']}")


class TestContentEndpoints:
    """Test content endpoints used by dashboard widgets"""
    
    def test_rituals_endpoint(self):
        """Test rituals endpoint for Settings page"""
        response = requests.get(f"{BASE_URL}/api/rituals", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Rituals endpoint working - {len(data)} rituals")
    
    def test_meditations_endpoint(self):
        """Test meditations endpoint"""
        response = requests.get(f"{BASE_URL}/api/meditations", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Meditations endpoint working - {len(data)} meditations")
    
    def test_breathwork_endpoint(self):
        """Test breathwork sessions endpoint"""
        response = requests.get(f"{BASE_URL}/api/breathwork", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Breathwork endpoint working - {len(data)} sessions")
    
    def test_yoga_poses_endpoint(self):
        """Test yoga poses endpoint"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Yoga poses endpoint working - {len(data)} poses")


class TestExpandScriptEndpoint:
    """Test expand-script endpoint used by PracticeTimer narration"""
    
    def test_expand_script_basic(self):
        """Test expand-script endpoint for timer narration"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Test Meditation",
                "element": "spirit",
                "duration_minutes": 10,
                "use_ai": False,
                "include_toning": True,
                "anti_repetition_mode": "balanced",
                "steps": ["Step 1: Breathe deeply", "Step 2: Relax"],
                "source_texts": ["Find your center", "Release tension"]
            },
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        assert "segments" in data
        assert isinstance(data["segments"], list)
        assert len(data["segments"]) > 0
        print(f"✓ Expand-script endpoint working - {len(data['segments'])} segments")
    
    def test_expand_script_with_toning_off(self):
        """Test expand-script with toning disabled"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Test Practice",
                "element": "earth",
                "duration_minutes": 7,
                "use_ai": False,
                "include_toning": False,
                "anti_repetition_mode": "strict",
                "steps": ["Ground yourself"],
                "source_texts": ["Connect with earth"]
            },
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        assert "segments" in data
        print("✓ Expand-script with toning=false working")


class TestTTSEndpoint:
    """Test TTS endpoint used by PracticeTimer"""
    
    def test_tts_generate_base64(self):
        """Test TTS generation endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/tts/generate-base64",
            json={
                "text": "Welcome to this sacred practice.",
                "voice": "nova",
                "speed": 0.82
            },
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        assert "audio_base64" in data
        assert len(data["audio_base64"]) > 100  # Should have actual audio data
        print("✓ TTS generate-base64 endpoint working")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
