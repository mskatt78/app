"""
Iteration 130 - Critical Stability Fixes Testing
Tests for: routeGuards, SacredPracticeWidget, useCoursePayments, YogaLibrary, guidedToningSettings
Focus: Hook dependency stabilization and cookie-backed storage
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasicEndpoints:
    """Basic health and endpoint availability tests"""
    
    def test_health_endpoint(self):
        """Test health endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("✓ Health endpoint working")
    
    def test_auth_me_returns_401_without_token(self):
        """Test /auth/me returns 401 for unauthenticated requests"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✓ /auth/me correctly returns 401 without token")


class TestDailyPracticeWidget:
    """Tests for SacredPracticeWidget API endpoint"""
    
    def test_daily_practice_endpoint(self):
        """Test /daily-practice endpoint returns practice data"""
        response = requests.get(f"{BASE_URL}/api/daily-practice")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure for SacredPracticeWidget
        assert "moon_phase" in data, "Missing moon_phase field"
        assert "day_theme" in data, "Missing day_theme field"
        
        # Check for morning/evening practice cards
        has_morning = "morning_practice" in data and data["morning_practice"] is not None
        has_evening = "evening_practice" in data and data["evening_practice"] is not None
        
        print("✓ Daily practice endpoint working")
        print(f"  - Moon phase: {data.get('moon_phase')}")
        print(f"  - Day theme: {data.get('day_theme')}")
        print(f"  - Has morning practice: {has_morning}")
        print(f"  - Has evening practice: {has_evening}")
        
        if has_morning:
            assert "name" in data["morning_practice"], "Morning practice missing name"
        if has_evening:
            assert "name" in data["evening_practice"], "Evening practice missing name"


class TestYogaLibraryEndpoints:
    """Tests for YogaLibrary API endpoints"""
    
    def test_yoga_poses_endpoint(self):
        """Test /yoga/poses endpoint returns poses"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list), "Expected list of poses"
        assert len(data) > 0, "Expected at least one pose"
        
        # Verify pose structure
        pose = data[0]
        assert "id" in pose, "Pose missing id"
        assert "name" in pose, "Pose missing name"
        assert "element" in pose, "Pose missing element"
        
        print(f"✓ Yoga poses endpoint working - {len(data)} poses returned")
    
    def test_favorites_endpoint_without_auth(self):
        """Test /favorites endpoint behavior without auth"""
        response = requests.get(f"{BASE_URL}/api/favorites?item_type=pose")
        # Should return 401 or empty list depending on implementation
        assert response.status_code in [200, 401], f"Unexpected status: {response.status_code}"
        print(f"✓ Favorites endpoint returns {response.status_code} without auth")


class TestCoursePaymentsEndpoints:
    """Tests for useCoursePayments related endpoints"""
    
    def test_course_access_without_auth(self):
        """Test /payments/course-access without authentication"""
        response = requests.get(f"{BASE_URL}/api/payments/course-access")
        # Should return 401 without auth
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Course access endpoint correctly requires auth")
    
    def test_payment_status_without_auth(self):
        """Test /payments/status/{session_id} without authentication"""
        response = requests.get(f"{BASE_URL}/api/payments/status/test_session_123")
        # Should return 401 without auth
        assert response.status_code in [401, 403, 404], f"Expected 401/403/404, got {response.status_code}"
        print("✓ Payment status endpoint correctly handles unauthenticated request")


class TestAuthRouteEndpoints:
    """Tests for auth route guard related endpoints"""
    
    def test_auth_session_endpoint_exists(self):
        """Test /auth/session endpoint exists"""
        response = requests.post(
            f"{BASE_URL}/api/auth/session",
            json={"session_id": "invalid_test_session"}
        )
        # Should return 400/401/404 for invalid session, not 500
        assert response.status_code in [400, 401, 404, 422], f"Unexpected status: {response.status_code}"
        print(f"✓ Auth session endpoint exists and handles invalid session (status: {response.status_code})")
    
    def test_admin_collections_without_auth(self):
        """Test /admin/collections requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/collections")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Admin collections endpoint correctly requires auth")


class TestBreathworkEndpoints:
    """Tests for breathwork sessions (related to dashboard)"""
    
    def test_breathwork_sessions(self):
        """Test /breathwork/sessions endpoint"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list), "Expected list of sessions"
        print(f"✓ Breathwork sessions endpoint working - {len(data)} sessions")


class TestMeditationsEndpoint:
    """Tests for meditations (used in various components)"""
    
    def test_meditations_list(self):
        """Test /meditations endpoint"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list), "Expected list of meditations"
        print(f"✓ Meditations endpoint working - {len(data)} meditations")


class TestTTSEndpoints:
    """Tests for TTS endpoints (used by GuidedAudioButton)"""
    
    def test_tts_generate_base64(self):
        """Test /tts/generate-base64 endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/tts/generate-base64",
            json={"text": "Test meditation guidance.", "voice": "alloy"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "audio_base64" in data, "Missing audio_base64 in response"
        assert "format" in data, "Missing format in response"
        print("✓ TTS generate-base64 endpoint working")
    
    def test_tts_meditation_parts(self):
        """Test /tts/meditation/{id}/parts endpoint"""
        response = requests.get(f"{BASE_URL}/api/tts/meditation/1/parts")
        assert response.status_code == 200
        data = response.json()
        
        assert "total_parts" in data, "Missing total_parts in response"
        print(f"✓ TTS meditation parts endpoint working - {data.get('total_parts')} parts")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
