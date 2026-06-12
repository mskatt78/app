"""
Iteration 159 - Continuous hardening regression tests
Tests backend helper decomposition and frontend route health after refactors.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasicEndpoints:
    """Basic health and endpoint availability tests"""
    
    def test_health_endpoint(self):
        """Verify health endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("✓ Health endpoint working")
    
    def test_mantras_endpoint(self):
        """Verify mantras endpoint returns 200 with data"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Mantras endpoint working - {len(data)} mantras")
    
    def test_yoga_poses_endpoint(self):
        """Verify yoga poses endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Yoga poses endpoint working - {len(data)} poses")
    
    def test_breathwork_sessions_endpoint(self):
        """Verify breathwork sessions endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Breathwork sessions endpoint working - {len(data)} sessions")
    
    def test_grounding_endpoint(self):
        """Verify grounding exercises endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/grounding")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Grounding endpoint working - {len(data)} exercises")


class TestEmailServiceHelpers:
    """Test email_service.py helper decomposition"""
    
    def test_gift_create_endpoint(self):
        """Test gift creation uses email service helpers correctly"""
        response = requests.post(f"{BASE_URL}/api/gifts/create", json={
            "recipient_email": "test@example.com",
            "recipient_name": "Test Recipient",
            "gift_type": "subscription",
            "plan_id": "monthly",
            "message": "Test gift message",
            "sender_name": "Test Sender"
        })
        assert response.status_code == 200
        data = response.json()
        assert "gift_code" in data
        assert data["gift_code"].startswith("GIFT-")
        print(f"✓ Gift creation working - code: {data['gift_code']}")
    
    def test_gift_not_found(self):
        """Test gift lookup returns 404 for non-existent gift"""
        response = requests.get(f"{BASE_URL}/api/gifts/GIFT-NONEXISTENT")
        assert response.status_code == 404
        print("✓ Gift not found returns 404 correctly")


class TestContentExpandScriptHelpers:
    """Test content.py expand-script helper decomposition"""
    
    def test_expand_script_basic(self):
        """Test expand-script endpoint returns valid schema"""
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json={
            "practice_name": "Test Grounding Practice",
            "element": "Earth",
            "duration_minutes": 10,
            "steps": ["Step 1: Ground yourself", "Step 2: Breathe deeply"],
            "source_texts": ["Connect with the earth element"],
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": False
        })
        assert response.status_code == 200
        data = response.json()
        
        # Verify schema fields
        assert "practice_name" in data
        assert "target_minutes" in data
        assert "target_word_count" in data
        assert "word_count" in data
        assert "used_ai" in data
        assert "paragraphs" in data
        assert "segments" in data
        
        assert data["practice_name"] == "Test Grounding Practice"
        assert isinstance(data["paragraphs"], list)
        assert isinstance(data["segments"], list)
        assert len(data["paragraphs"]) > 0
        assert len(data["segments"]) > 0
        print(f"✓ Expand-script basic working - {data['word_count']} words, {len(data['segments'])} segments")
    
    def test_expand_script_with_toning(self):
        """Test expand-script with toning enabled"""
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json={
            "practice_name": "Fire Activation Practice",
            "element": "Fire",
            "duration_minutes": 12,
            "steps": ["Ignite inner fire", "Transform obstacles"],
            "source_texts": ["Fire element awakens courage"],
            "use_ai": False,
            "anti_repetition_mode": "balanced",
            "include_toning": True
        })
        assert response.status_code == 200
        data = response.json()
        assert data["word_count"] > 0
        print(f"✓ Expand-script with toning working - {data['word_count']} words")
    
    def test_expand_script_word_count_adequate(self):
        """Test expand-script generates adequate word count"""
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json={
            "practice_name": "Water Flow Meditation",
            "element": "Water",
            "duration_minutes": 15,
            "steps": ["Flow like water", "Release tension", "Embrace fluidity"],
            "source_texts": ["Water teaches us to adapt and flow"],
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": True
        })
        assert response.status_code == 200
        data = response.json()
        
        # Word count should be at least 70% of target
        target = data["target_word_count"]
        actual = data["word_count"]
        ratio = actual / target if target > 0 else 0
        
        assert ratio >= 0.7, f"Word count ratio {ratio:.2f} below 70% threshold"
        print(f"✓ Word count adequate - {actual}/{target} ({ratio:.1%})")


class TestGiftsStripeHelpers:
    """Test gifts.py Stripe checkout helper decomposition"""
    
    def test_gift_pay_requires_auth(self):
        """Test gift payment requires authentication"""
        response = requests.post(f"{BASE_URL}/api/gifts/pay", json={
            "gift_code": "GIFT-TEST1234",
            "origin_url": "https://example.com",
            "payment_method": "stripe"
        })
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403, 404]
        print("✓ Gift payment requires auth correctly")
    
    def test_gift_redeem_requires_auth(self):
        """Test gift redemption requires authentication"""
        response = requests.post(f"{BASE_URL}/api/gifts/redeem", json={
            "gift_code": "GIFT-TEST1234"
        })
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403]
        print("✓ Gift redemption requires auth correctly")


class TestAdminYogaVerificationHelpers:
    """Test admin.py yoga verification helper decomposition"""
    
    def test_admin_login_wrong_password(self):
        """Test admin login rejects wrong password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "password": "wrong_password"
        })
        assert response.status_code == 401
        print("✓ Admin login rejects wrong password")
    
    def test_admin_collections_requires_auth(self):
        """Test admin collections endpoint requires auth"""
        response = requests.get(f"{BASE_URL}/api/admin/collections")
        assert response.status_code == 401
        print("✓ Admin collections requires auth")
    
    def test_admin_seed_status_requires_auth(self):
        """Test admin seed-status endpoint requires auth"""
        response = requests.get(f"{BASE_URL}/api/admin/seed-status")
        assert response.status_code == 401
        print("✓ Admin seed-status requires auth")


class TestSeedScriptsStructure:
    """Test seed scripts are structurally valid"""
    
    def test_seed_content_imports(self):
        """Test seed_content.py imports work"""
        import sys
        sys.path.insert(0, '/app/backend')
        
        # Import the module
        from seed_content import YOGA_POSES, BREATHWORK_SESSIONS, SHAMANIC_CEREMONIES, ELEMENTAL_PRACTICES, CREATIVE_PROCESSES
        
        assert len(YOGA_POSES) >= 6, f"Expected at least 6 yoga poses, got {len(YOGA_POSES)}"
        assert len(BREATHWORK_SESSIONS) >= 5, f"Expected at least 5 breathwork sessions, got {len(BREATHWORK_SESSIONS)}"
        assert len(SHAMANIC_CEREMONIES) >= 5, f"Expected at least 5 shamanic ceremonies, got {len(SHAMANIC_CEREMONIES)}"
        assert len(ELEMENTAL_PRACTICES) >= 5, f"Expected at least 5 elemental practices, got {len(ELEMENTAL_PRACTICES)}"
        assert len(CREATIVE_PROCESSES) >= 5, f"Expected at least 5 creative processes, got {len(CREATIVE_PROCESSES)}"
        
        print(f"✓ seed_content.py valid - {len(YOGA_POSES)} yoga, {len(BREATHWORK_SESSIONS)} breathwork, {len(SHAMANIC_CEREMONIES)} shamanic, {len(ELEMENTAL_PRACTICES)} elemental, {len(CREATIVE_PROCESSES)} creative")
    
    def test_seed_database_imports(self):
        """Test seed_database.py imports work"""
        import sys
        sys.path.insert(0, '/app/backend')
        
        from seed_database import _build_seed_collections
        
        collections = _build_seed_collections()
        assert len(collections) >= 17, f"Expected at least 17 collections, got {len(collections)}"
        
        collection_names = [c[0] for c in collections]
        expected = ["yoga_poses", "crystals", "mantras", "mudras", "breathwork_sessions"]
        for name in expected:
            assert name in collection_names, f"Missing collection: {name}"
        
        print(f"✓ seed_database.py valid - {len(collections)} collections")


class TestFrontendRouteHealth:
    """Test frontend routes are accessible"""
    
    def test_home_route(self):
        """Test home page loads"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        print("✓ Home route accessible")
    
    def test_mantras_route(self):
        """Test mantras page loads"""
        response = requests.get(f"{BASE_URL}/mantras")
        assert response.status_code == 200
        print("✓ Mantras route accessible")
    
    def test_grounding_route(self):
        """Test grounding page loads"""
        response = requests.get(f"{BASE_URL}/grounding")
        assert response.status_code == 200
        print("✓ Grounding route accessible")
    
    def test_yoga_route(self):
        """Test yoga page loads"""
        response = requests.get(f"{BASE_URL}/yoga")
        assert response.status_code == 200
        print("✓ Yoga route accessible")
    
    def test_breathwork_route(self):
        """Test breathwork page loads"""
        response = requests.get(f"{BASE_URL}/breathwork")
        assert response.status_code == 200
        print("✓ Breathwork route accessible")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
