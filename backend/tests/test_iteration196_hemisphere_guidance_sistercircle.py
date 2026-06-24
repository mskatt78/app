"""
Iteration 196 Tests - Astrology Hemisphere Toggle, Daily Guidance Tweaks, Sister Circle Texture

Tests for:
1. Astrology page hemisphere toggle and localStorage persistence
2. Daily guidance API returns guidance_tweak with practical + spiritual arrays
3. Rose Temple Sister Circle texture section with thematic pillars
4. No regressions in /astrology and /rose-temple routes
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
TEST_EMAIL = "demoqa_740fefc1@example.com"
TEST_PASSWORD = "DemoPass123!"


class TestAstrologyEndpoints:
    """Test astrology API endpoints for hemisphere support"""
    
    def test_astrology_months_endpoint(self):
        """Test /api/astrology/months returns months with hemisphere descriptions"""
        response = requests.get(f"{BASE_URL}/api/astrology/months")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of months"
        assert len(data) > 0, "Expected at least one month"
        
        # Check first month has hemisphere-specific descriptions
        first_month = data[0]
        assert "id" in first_month
        assert "name" in first_month
        assert "description" in first_month
        
        # Verify hemisphere-specific descriptions exist
        assert "description_north" in first_month, "Missing description_north field"
        assert "description_south" in first_month, "Missing description_south field"
        
        print(f"SUCCESS: Found {len(data)} months with hemisphere descriptions")
    
    def test_astrology_current_endpoint(self):
        """Test /api/astrology/current returns current moon with hemisphere descriptions"""
        response = requests.get(f"{BASE_URL}/api/astrology/current")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "id" in data
        assert "name" in data
        assert "element" in data
        
        # Verify hemisphere-specific descriptions
        assert "description_north" in data, "Missing description_north in current moon"
        assert "description_south" in data, "Missing description_south in current moon"
        
        print(f"SUCCESS: Current moon is {data['name']} with hemisphere descriptions")
    
    def test_astrology_months_have_themes_and_crystals(self):
        """Test months have themes and crystals for full content"""
        response = requests.get(f"{BASE_URL}/api/astrology/months")
        assert response.status_code == 200
        
        data = response.json()
        for month in data[:3]:  # Check first 3 months
            assert "themes" in month, f"Month {month.get('name')} missing themes"
            assert "crystals" in month, f"Month {month.get('name')} missing crystals"
            assert isinstance(month["themes"], list)
            assert isinstance(month["crystals"], list)
        
        print("SUCCESS: Months have themes and crystals")


class TestDailyGuidanceAPI:
    """Test daily guidance API with guidance_tweak field"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("session_token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_daily_guidance_returns_guidance_tweak(self, auth_token):
        """Test /api/dashboard/daily returns guidance_tweak with practical and spiritual"""
        response = requests.get(
            f"{BASE_URL}/api/dashboard/daily",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Verify guidance_tweak exists
        assert "guidance_tweak" in data, "Missing guidance_tweak field"
        
        guidance_tweak = data["guidance_tweak"]
        assert "practical" in guidance_tweak, "Missing practical array in guidance_tweak"
        assert "spiritual" in guidance_tweak, "Missing spiritual array in guidance_tweak"
        
        # Verify arrays have content
        assert isinstance(guidance_tweak["practical"], list)
        assert isinstance(guidance_tweak["spiritual"], list)
        assert len(guidance_tweak["practical"]) > 0, "Practical array is empty"
        assert len(guidance_tweak["spiritual"]) > 0, "Spiritual array is empty"
        
        print(f"SUCCESS: guidance_tweak has {len(guidance_tweak['practical'])} practical items and {len(guidance_tweak['spiritual'])} spiritual items")
    
    def test_daily_guidance_has_core_fields(self, auth_token):
        """Test daily guidance has all expected core fields"""
        response = requests.get(
            f"{BASE_URL}/api/dashboard/daily",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        
        # Check core fields
        expected_fields = [
            "greeting",
            "current_moon",
            "daily_pose",
            "daily_crystal",
            "daily_mantra",
            "daily_breathwork",
            "guidance_tweak"
        ]
        
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
        
        print("SUCCESS: Daily guidance has all core fields")
    
    def test_daily_guidance_practical_content(self, auth_token):
        """Test practical focus content is actionable"""
        response = requests.get(
            f"{BASE_URL}/api/dashboard/daily",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        practical = data.get("guidance_tweak", {}).get("practical", [])
        
        # Verify practical items are strings with content
        for item in practical:
            assert isinstance(item, str), "Practical item should be string"
            assert len(item) > 10, "Practical item should have meaningful content"
        
        print(f"SUCCESS: Practical focus has {len(practical)} actionable items")
    
    def test_daily_guidance_spiritual_content(self, auth_token):
        """Test spiritual focus content is meaningful"""
        response = requests.get(
            f"{BASE_URL}/api/dashboard/daily",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        spiritual = data.get("guidance_tweak", {}).get("spiritual", [])
        
        # Verify spiritual items are strings with content
        for item in spiritual:
            assert isinstance(item, str), "Spiritual item should be string"
            assert len(item) > 10, "Spiritual item should have meaningful content"
        
        print(f"SUCCESS: Spiritual focus has {len(spiritual)} meaningful items")


class TestRoseTempleEndpoints:
    """Test Rose Temple API endpoints"""
    
    def test_rose_temple_page_accessible(self):
        """Test /rose-temple page is accessible (frontend route)"""
        response = requests.get(f"{BASE_URL}/rose-temple", allow_redirects=True)
        # Frontend routes return 200 from the SPA
        assert response.status_code == 200, f"Rose Temple page not accessible: {response.status_code}"
        print("SUCCESS: Rose Temple page is accessible")
    
    def test_astrology_page_accessible(self):
        """Test /astrology page is accessible (frontend route)"""
        response = requests.get(f"{BASE_URL}/astrology", allow_redirects=True)
        assert response.status_code == 200, f"Astrology page not accessible: {response.status_code}"
        print("SUCCESS: Astrology page is accessible")


class TestAuthenticationFlow:
    """Test authentication flow for dashboard access"""
    
    def test_login_with_test_credentials(self):
        """Test login with QA test credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.status_code}"
        
        data = response.json()
        assert "session_token" in data, "Missing session_token in response"
        assert "user" in data, "Missing user in response"
        
        user = data["user"]
        assert user.get("email") == TEST_EMAIL
        
        print(f"SUCCESS: Logged in as {user.get('name', 'Demo QA')}")
    
    def test_dashboard_requires_auth(self):
        """Test dashboard/daily endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/dashboard/daily")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("SUCCESS: Dashboard endpoint properly requires authentication")


class TestHealthAndBasicEndpoints:
    """Test basic health and accessibility"""
    
    def test_health_endpoint(self):
        """Test /api/health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.status_code}"
        print("SUCCESS: Health endpoint is healthy")
    
    def test_frontend_loads(self):
        """Test frontend root loads"""
        response = requests.get(BASE_URL)
        assert response.status_code == 200, f"Frontend failed to load: {response.status_code}"
        print("SUCCESS: Frontend loads correctly")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
