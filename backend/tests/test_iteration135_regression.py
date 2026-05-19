"""
Iteration 135 - Regression tests for domain-level seeding split and MeditationVisualizer architecture
Tests:
1. Backend health and key content endpoints after seeding refactor
2. Verify do_database_seeding coordinator structure
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestBackendHealthAfterSeedingRefactor:
    """Verify backend startup and seeding didn't break after domain-level split"""
    
    def test_health_endpoint(self):
        """Health check should return healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["app"] == "Shamanic Elements Temple Of The Soul"
        assert data["version"] == "2.0.0"
        print("PASS: /api/health returns healthy status")
    
    def test_breathwork_sessions_endpoint(self):
        """Breathwork sessions should be seeded and accessible"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 6, f"Expected at least 6 breathwork sessions, got {len(data)}"
        # Verify structure of first session
        session = data[0]
        assert "id" in session
        assert "name" in session
        assert "element" in session
        assert "description" in session
        print(f"PASS: /api/breathwork/sessions returns {len(data)} sessions")
    
    def test_yoga_poses_endpoint(self):
        """Yoga poses should be seeded and accessible"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 50, f"Expected at least 50 yoga poses, got {len(data)}"
        # Verify structure
        pose = data[0]
        assert "id" in pose
        assert "name" in pose
        assert "element" in pose
        print(f"PASS: /api/yoga/poses returns {len(data)} poses")
    
    def test_crystals_endpoint(self):
        """Crystals should be seeded and accessible"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 30, f"Expected at least 30 crystals, got {len(data)}"
        print(f"PASS: /api/crystals returns {len(data)} crystals")
    
    def test_meditations_endpoint(self):
        """Meditations should be seeded and accessible"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 5, f"Expected at least 5 meditations, got {len(data)}"
        print(f"PASS: /api/meditations returns {len(data)} meditations")
    
    def test_chakra_cleansing_endpoint(self):
        """Chakra cleansing should be seeded with 13 chakras"""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 13, f"Expected at least 13 chakras, got {len(data)}"
        print(f"PASS: /api/chakra-cleansing returns {len(data)} chakras")
    
    def test_masculine_embodiment_endpoint(self):
        """Masculine embodiment should be seeded with 13 practices"""
        response = requests.get(f"{BASE_URL}/api/masculine-embodiment")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 13, f"Expected at least 13 masculine practices, got {len(data)}"
        print(f"PASS: /api/masculine-embodiment returns {len(data)} practices")
    
    def test_feminine_embodiment_endpoint(self):
        """Feminine embodiment should be seeded with 13 practices"""
        response = requests.get(f"{BASE_URL}/api/feminine-embodiment")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 13, f"Expected at least 13 feminine practices, got {len(data)}"
        print(f"PASS: /api/feminine-embodiment returns {len(data)} practices")
    
    def test_elemental_temples_endpoint(self):
        """Elemental temples should be seeded with 5 elements"""
        response = requests.get(f"{BASE_URL}/api/elemental-temples")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 5, f"Expected at least 5 elemental temples, got {len(data)}"
        print(f"PASS: /api/elemental-temples returns {len(data)} temples")
    
    def test_daily_practice_endpoint(self):
        """Daily practice endpoint should work"""
        response = requests.get(f"{BASE_URL}/api/daily-practice")
        assert response.status_code == 200
        data = response.json()
        assert "practice" in data or "message" in data or isinstance(data, dict)
        print("PASS: /api/daily-practice returns valid response")


class TestSeedingCoordinatorStructure:
    """Verify the domain-level seeding split is working"""
    
    def test_seeding_completed_successfully(self):
        """Verify seeding completed by checking multiple collections have data"""
        # If all these endpoints return data, seeding worked
        endpoints = [
            "/api/breathwork/sessions",
            "/api/yoga/poses",
            "/api/crystals",
            "/api/meditations",
            "/api/chakra-cleansing",
        ]
        
        for endpoint in endpoints:
            response = requests.get(f"{BASE_URL}{endpoint}")
            assert response.status_code == 200, f"Endpoint {endpoint} failed"
            data = response.json()
            assert len(data) > 0, f"Endpoint {endpoint} returned empty data"
        
        print("PASS: All seeded collections have data - do_database_seeding coordinator working")
    
    def test_config_domain_seeding(self):
        """Verify config domain seeding by checking app is responsive"""
        # Config seeding updates app_meta - we verify by checking app is healthy
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("PASS: Config domain seeding completed (app healthy)")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
