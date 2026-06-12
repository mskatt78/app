"""
Iteration 158 - Backend Hardening Regression Tests
Tests for complexity refactors in:
- email_service.py helper decomposition
- content.py expand-script helpers
- gifts.py stripe checkout helper decomposition
- admin.py yoga verification helper decomposition
- seed_content.py and seed_database.py structural validity
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestHealthAndBasicEndpoints:
    """Basic health and connectivity tests"""
    
    def test_health_endpoint(self):
        """Health endpoint returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
    
    def test_yoga_poses_endpoint(self):
        """Yoga poses endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if data:
            assert "name" in data[0] or "id" in data[0]


class TestExpandScriptEndpoint:
    """Tests for POST /api/content/expand-script after helper decomposition"""
    
    def test_expand_script_basic(self):
        """Basic expand-script request returns valid schema"""
        payload = {
            "practice_name": "Test Meditation",
            "element": "earth",
            "duration_minutes": 7,
            "steps": ["Step one", "Step two"],
            "source_texts": ["Source text one"],
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": False
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Validate schema
        assert "practice_name" in data
        assert "target_minutes" in data
        assert "target_word_count" in data
        assert "word_count" in data
        assert "used_ai" in data
        assert "paragraphs" in data
        assert "segments" in data
        
        assert data["practice_name"] == "Test Meditation"
        assert isinstance(data["paragraphs"], list)
        assert isinstance(data["segments"], list)
    
    def test_expand_script_with_toning(self):
        """Expand-script with toning enabled"""
        payload = {
            "practice_name": "Toning Test",
            "element": "fire",
            "duration_minutes": 10,
            "steps": ["Breathe deeply", "Feel the warmth"],
            "source_texts": [],
            "use_ai": False,
            "anti_repetition_mode": "balanced",
            "include_toning": True
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["word_count"] > 0
        assert len(data["paragraphs"]) > 0
    
    def test_expand_script_word_count_adequate(self):
        """Expand-script produces adequate word count for target duration"""
        payload = {
            "practice_name": "Word Count Test",
            "element": "water",
            "duration_minutes": 15,
            "steps": ["Relax", "Flow", "Release"],
            "source_texts": ["Water flows naturally"],
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": False
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Word count should be at least 70% of target
        target = data["target_word_count"]
        actual = data["word_count"]
        assert actual >= target * 0.7, f"Word count {actual} is less than 70% of target {target}"
    
    def test_expand_script_segments_generated(self):
        """Expand-script generates segments for narration"""
        payload = {
            "practice_name": "Segment Test",
            "element": "air",
            "duration_minutes": 10,
            "steps": ["Breathe in", "Breathe out", "Feel lightness"],
            "source_texts": [],
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": False
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["segments"]) >= 1, "Should have at least 1 segment"


class TestGiftsEndpoints:
    """Tests for gifts endpoints after helper decomposition"""
    
    def test_create_gift_endpoint(self):
        """Gift creation endpoint works"""
        payload = {
            "recipient_email": "test@example.com",
            "recipient_name": "Test Recipient",
            "gift_type": "subscription",
            "plan_id": "monthly",
            "message": "Test gift message",
            "sender_name": "Test Sender"
        }
        response = requests.post(f"{BASE_URL}/api/gifts/create", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert "gift_code" in data
        assert data["gift_code"].startswith("GIFT-")
        assert "gift" in data
    
    def test_get_gift_not_found(self):
        """Get gift returns 404 for non-existent code"""
        response = requests.get(f"{BASE_URL}/api/gifts/GIFT-NONEXISTENT")
        assert response.status_code == 404


class TestAdminEndpoints:
    """Tests for admin endpoints after helper decomposition"""
    
    def test_admin_login_wrong_password(self):
        """Admin login rejects wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "wrong_password"}
        )
        assert response.status_code == 401
    
    def test_admin_collections_requires_auth(self):
        """Admin collections endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/collections")
        assert response.status_code == 401


class TestContentEndpoints:
    """Tests for content endpoints"""
    
    def test_mantras_endpoint(self):
        """Mantras endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_crystals_endpoint(self):
        """Crystals endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_breathwork_endpoint(self):
        """Breathwork endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_meditations_endpoint(self):
        """Meditations endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestSeedScriptsStructure:
    """Tests that seed scripts are structurally valid (import tests done separately)"""
    
    def test_seed_status_endpoint(self):
        """Seed status endpoint works (requires admin auth, expect 401)"""
        response = requests.get(f"{BASE_URL}/api/admin/seed-status")
        # Without auth, should return 401
        assert response.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
