"""
Final Comprehensive Test - Iteration 15
Tests public access, all content APIs, and core functionality
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPublicAccessAPIs:
    """Test that content APIs work without authentication"""
    
    def test_yoga_poses_public(self):
        """Yoga poses should load without auth"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✅ Yoga poses: {len(data)} poses loaded")
    
    def test_crystals_public(self):
        """Crystals should load without auth"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✅ Crystals: {len(data)} crystals loaded")
    
    def test_mantras_public(self):
        """Mantras should load without auth"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✅ Mantras: {len(data)} mantras loaded")
    
    def test_mudras_public(self):
        """Mudras should load without auth"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✅ Mudras: {len(data)} mudras loaded")
    
    def test_breathwork_public(self):
        """Breathwork should load without auth"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✅ Breathwork: {len(data)} techniques loaded")
    
    def test_grounding_practices_public(self):
        """Grounding practices should load without auth"""
        response = requests.get(f"{BASE_URL}/api/grounding")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Grounding practices: {len(data)} practices loaded")
    
    def test_mindfulness_public(self):
        """Mindfulness practices should load without auth"""
        response = requests.get(f"{BASE_URL}/api/mindfulness")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Mindfulness: {len(data)} practices loaded")
    
    def test_meditations_public(self):
        """Meditations should load without auth"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Meditations: {len(data)} meditations loaded")
    
    def test_shamanic_practices_public(self):
        """Shamanic practices should load without auth"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Shamanic practices: {len(data)} practices loaded")
    
    def test_heart_practices_public(self):
        """Heart practices should load without auth"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Heart practices: {len(data)} practices loaded")
    
    def test_elemental_practices_public(self):
        """Elemental practices should load without auth"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Elemental practices: {len(data)} practices loaded")
    
    def test_creative_processes_public(self):
        """Creative processes should load without auth"""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Creative processes: {len(data)} processes loaded")
    
    def test_earth_altars_public(self):
        """Earth altars should load without auth"""
        response = requests.get(f"{BASE_URL}/api/earth-altars")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Earth altars: {len(data)} altars loaded")


class TestNewContentAPIs:
    """Test new content pages APIs"""
    
    def test_live_sessions_public(self):
        """Live sessions should load without auth"""
        response = requests.get(f"{BASE_URL}/api/live-sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Live sessions: {len(data)} sessions loaded")
    
    def test_retreats_public(self):
        """Retreats should load without auth"""
        response = requests.get(f"{BASE_URL}/api/retreats")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Retreats: {len(data)} retreats loaded")
    
    def test_books_public(self):
        """Books should load without auth"""
        response = requests.get(f"{BASE_URL}/api/books")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Books: {len(data)} books loaded")


class TestPaymentAPIs:
    """Test payment-related APIs"""
    
    def test_payment_plans_public(self):
        """Payment plans should load without auth"""
        response = requests.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200
        data = response.json()
        assert "plans" in data
        assert len(data["plans"]) >= 2  # Monthly and yearly
        print(f"✅ Payment plans: {len(data['plans'])} plans loaded")
    
    def test_payment_methods(self):
        """Payment methods should include Stripe and PayPal"""
        response = requests.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200
        data = response.json()
        assert "payment_methods" in data
        assert "stripe" in data["payment_methods"]
        assert "paypal" in data["payment_methods"]
        print("✅ Payment methods: Stripe and PayPal available")


class TestNumerologyAPIs:
    """Test numerology APIs"""
    
    def test_life_paths_public(self):
        """Life paths should load without auth"""
        response = requests.get(f"{BASE_URL}/api/numerology/life-paths")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert len(data) >= 9  # At least 9 life paths
        print(f"✅ Life paths: {len(data)} paths loaded")
    
    def test_numerology_reading_requires_auth(self):
        """Numerology reading POST should require auth"""
        response = requests.post(
            f"{BASE_URL}/api/numerology/reading",
            json={"birth_date": "1990-07-15"}
        )
        # Should return 401 Not authenticated
        assert response.status_code == 401
        print("✅ Numerology reading correctly requires authentication")


class TestHealthAndBasics:
    """Test basic health endpoints"""
    
    def test_health_check(self):
        """Health endpoint should work"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("✅ Health check passed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
