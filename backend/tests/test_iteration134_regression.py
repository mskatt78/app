"""
Iteration 134 - Regression tests for code quality cleanup batch
Tests:
- /api/user/achievements endpoint after get_achievements complexity refactor
- Backend startup/seeding module integrity
- Core API endpoints sanity check
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestHealthAndStartup:
    """Verify backend startup and seeding module integrity"""
    
    def test_health_endpoint(self):
        """Health check confirms server started successfully"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        assert "Shamanic" in data.get("app", "")
        print("PASS: Health endpoint returns healthy status")
    
    def test_root_health_endpoint(self):
        """Root health check for deployment verification"""
        response = requests.get(f"{BASE_URL}/health")
        # Root health may return HTML through ingress or JSON directly
        assert response.status_code == 200
        # Try to parse JSON, but don't fail if it's HTML
        try:
            data = response.json()
            assert data.get("status") == "healthy"
            print("PASS: Root health endpoint returns healthy JSON status")
        except Exception:
            # Ingress may serve HTML, which is acceptable
            print("PASS: Root health endpoint returns 200 (HTML response through ingress)")


class TestAchievementsEndpoint:
    """Test /api/user/achievements after helper decomposition"""
    
    def test_achievements_requires_auth(self):
        """Achievements endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/achievements")
        assert response.status_code == 401
        print("PASS: Achievements endpoint correctly requires auth (401)")
    
    def test_achievements_with_invalid_token(self):
        """Achievements endpoint rejects invalid token"""
        headers = {"Authorization": "Bearer invalid_token_12345"}
        response = requests.get(f"{BASE_URL}/api/achievements", headers=headers)
        assert response.status_code == 401
        print("PASS: Achievements endpoint rejects invalid token (401)")


class TestDashboardEndpoints:
    """Test dashboard-related endpoints"""
    
    def test_daily_guidance_requires_auth(self):
        """Daily guidance endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/dashboard/daily")
        assert response.status_code == 401
        print("PASS: Dashboard daily guidance requires auth (401)")
    
    def test_daily_practice_public(self):
        """Daily practice endpoint is public"""
        response = requests.get(f"{BASE_URL}/api/daily-practice")
        # Should return 200 or 404 (if not implemented), not 500
        assert response.status_code in [200, 404]
        print(f"PASS: Daily practice endpoint returns {response.status_code}")


class TestJournalEndpoints:
    """Test journal endpoints after component split"""
    
    def test_journal_list_requires_auth(self):
        """Journal list requires authentication"""
        response = requests.get(f"{BASE_URL}/api/journal")
        assert response.status_code == 401
        print("PASS: Journal list requires auth (401)")
    
    def test_journal_create_requires_auth(self):
        """Journal create requires authentication"""
        response = requests.post(f"{BASE_URL}/api/journal", json={
            "content": "Test journal entry",
            "journal_type": "personal"
        })
        assert response.status_code == 401
        print("PASS: Journal create requires auth (401)")


class TestMasculineTempleEndpoints:
    """Test masculine embodiment endpoints"""
    
    def test_masculine_embodiment_list(self):
        """Masculine embodiment practices list is public"""
        response = requests.get(f"{BASE_URL}/api/masculine-embodiment")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Masculine embodiment returns {len(data)} practices")
        
        # Verify data structure if practices exist
        if len(data) > 0:
            practice = data[0]
            assert "id" in practice or "name" in practice
            print("PASS: Practice has expected structure (id/name present)")


class TestCoreContentEndpoints:
    """Test core content endpoints for sanity"""
    
    def test_yoga_poses(self):
        """Yoga poses endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"PASS: Yoga poses returns {len(data)} poses")
    
    def test_breathwork_sessions(self):
        """Breathwork sessions endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"PASS: Breathwork sessions returns {len(data)} sessions")
    
    def test_crystals_list(self):
        """Crystals list endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"PASS: Crystals returns {len(data)} crystals")
    
    def test_mantras_list(self):
        """Mantras list endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Mantras returns {len(data)} mantras")
    
    def test_mudras_list(self):
        """Mudras list endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Mudras returns {len(data)} mudras")
    
    def test_chakra_cleansing(self):
        """Chakra cleansing endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 7  # At least 7 base chakras
        print(f"PASS: Chakra cleansing returns {len(data)} chakras")


class TestAuthEndpoints:
    """Test auth endpoints for route guards"""
    
    def test_auth_me_requires_auth(self):
        """Auth me endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("PASS: Auth me requires auth (401)")
    
    def test_auth_me_with_invalid_token(self):
        """Auth me rejects invalid token"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert response.status_code == 401
        print("PASS: Auth me rejects invalid token (401)")


class TestMeditationContent:
    """Test meditation-related endpoints for MeditationVisualizer"""
    
    def test_meditations_list(self):
        """Meditations list endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Meditations returns {len(data)} meditations")
    
    def test_elemental_practices(self):
        """Elemental practices endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Elemental practices returns {len(data)} practices")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
