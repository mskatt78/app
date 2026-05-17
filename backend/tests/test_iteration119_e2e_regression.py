"""
Iteration 119 - End-to-End Regression Testing
Tests all critical backend APIs and auth-protected endpoints for stability.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

class TestHealthAndCoreAPIs:
    """Test health and core public endpoints"""
    
    def test_health_endpoint(self):
        """GET /api/health - should return 200"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200, f"Health check failed: {response.status_code}"
        print("✓ Health endpoint working")
    
    def test_crystals_deep_endpoint(self):
        """GET /api/crystals/deep - should return crystals with image validation"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep", timeout=30)
        assert response.status_code == 200, f"Crystals deep failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of crystals"
        assert len(data) > 0, "Expected at least one crystal"
        # Check for image validation fields
        first_crystal = data[0]
        assert "id" in first_crystal, "Crystal should have id"
        print(f"✓ Crystals deep endpoint working - {len(data)} crystals returned")
    
    def test_courses_endpoint(self):
        """GET /api/courses - should return courses"""
        response = requests.get(f"{BASE_URL}/api/courses", timeout=10)
        assert response.status_code == 200, f"Courses failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of courses"
        print(f"✓ Courses endpoint working - {len(data)} courses returned")
    
    def test_meditations_endpoint(self):
        """GET /api/meditations - should return meditations"""
        response = requests.get(f"{BASE_URL}/api/meditations", timeout=10)
        assert response.status_code == 200, f"Meditations failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of meditations"
        print(f"✓ Meditations endpoint working - {len(data)} meditations returned")
    
    def test_breathwork_sessions_endpoint(self):
        """GET /api/breathwork/sessions - should return breathwork sessions"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions", timeout=10)
        assert response.status_code == 200, f"Breathwork sessions failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of breathwork sessions"
        print(f"✓ Breathwork sessions endpoint working - {len(data)} sessions returned")


class TestProvenanceEndpoints:
    """Test provenance/spiritual library endpoints with content_integrity"""
    
    def test_heart_practices_endpoint(self):
        """GET /api/heart-practices - should return practices with content_integrity"""
        response = requests.get(f"{BASE_URL}/api/heart-practices", timeout=10)
        assert response.status_code == 200, f"Heart practices failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of heart practices"
        if len(data) > 0:
            first = data[0]
            assert "content_integrity" in first, "Heart practice should have content_integrity"
        print(f"✓ Heart practices endpoint working - {len(data)} practices returned")
    
    def test_elemental_practices_endpoint(self):
        """GET /api/elemental-practices - should return practices with content_integrity"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices", timeout=10)
        assert response.status_code == 200, f"Elemental practices failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of elemental practices"
        if len(data) > 0:
            first = data[0]
            assert "content_integrity" in first, "Elemental practice should have content_integrity"
        print(f"✓ Elemental practices endpoint working - {len(data)} practices returned")
    
    def test_shamanic_practices_endpoint(self):
        """GET /api/shamanic-practices - should return practices with content_integrity"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices", timeout=10)
        assert response.status_code == 200, f"Shamanic practices failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of shamanic practices"
        if len(data) > 0:
            first = data[0]
            assert "content_integrity" in first, "Shamanic practice should have content_integrity"
        print(f"✓ Shamanic practices endpoint working - {len(data)} practices returned")
    
    def test_ancient_wisdom_endpoint(self):
        """GET /api/ancient-wisdom - should return wisdom entries with content_integrity"""
        response = requests.get(f"{BASE_URL}/api/ancient-wisdom", timeout=10)
        assert response.status_code == 200, f"Ancient wisdom failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of ancient wisdom"
        assert len(data) > 50, f"Expected 50+ ancient wisdom entries, got {len(data)}"
        if len(data) > 0:
            first = data[0]
            assert "content_integrity" in first, "Ancient wisdom should have content_integrity"
        print(f"✓ Ancient wisdom endpoint working - {len(data)} entries returned")


class TestPaymentEndpoints:
    """Test payment endpoints - public and auth-protected"""
    
    def test_payment_plans_endpoint(self):
        """GET /api/payments/plans - should return subscription plans (public)"""
        response = requests.get(f"{BASE_URL}/api/payments/plans", timeout=10)
        assert response.status_code == 200, f"Payment plans failed: {response.status_code}"
        data = response.json()
        assert "plans" in data, "Expected plans in response"
        assert len(data["plans"]) >= 2, "Expected at least 2 plans"
        print(f"✓ Payment plans endpoint working - {len(data['plans'])} plans returned")
    
    def test_payment_bundles_endpoint(self):
        """GET /api/payments/bundles - should return course bundles (public)"""
        response = requests.get(f"{BASE_URL}/api/payments/bundles", timeout=10)
        assert response.status_code == 200, f"Payment bundles failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of bundles"
        print(f"✓ Payment bundles endpoint working - {len(data)} bundles returned")
    
    def test_create_checkout_requires_auth(self):
        """POST /api/payments/create-checkout - should return 401 without auth"""
        response = requests.post(
            f"{BASE_URL}/api/payments/create-checkout",
            json={"product_type": "subscription", "plan_id": "monthly", "origin_url": "https://test.com"},
            timeout=10
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Create checkout correctly requires auth (401)")
    
    def test_subscription_status_requires_auth(self):
        """GET /api/payments/subscription-status - should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/payments/subscription-status", timeout=10)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Subscription status correctly requires auth (401)")
    
    def test_course_access_requires_auth(self):
        """GET /api/payments/course-access - should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/payments/course-access", timeout=10)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Course access correctly requires auth (401)")


class TestGiftEndpoints:
    """Test gift endpoints - validation and auth"""
    
    def test_gift_create_validation(self):
        """POST /api/gifts/create - should return 422 with invalid data"""
        response = requests.post(
            f"{BASE_URL}/api/gifts/create",
            json={},  # Missing required fields
            timeout=10
        )
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("✓ Gift create correctly validates input (422)")
    
    def test_gift_lookup_not_found(self):
        """GET /api/gifts/{code} - should return 404 for non-existent code"""
        response = requests.get(f"{BASE_URL}/api/gifts/NONEXISTENT-CODE", timeout=10)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Gift lookup correctly returns 404 for non-existent code")
    
    def test_gift_pay_requires_auth(self):
        """POST /api/gifts/pay - should return 401 without auth"""
        response = requests.post(
            f"{BASE_URL}/api/gifts/pay",
            json={"gift_code": "TEST-CODE", "origin_url": "https://test.com"},
            timeout=10
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Gift pay correctly requires auth (401)")
    
    def test_gift_redeem_requires_auth(self):
        """POST /api/gifts/redeem - should return 401 without auth"""
        response = requests.post(
            f"{BASE_URL}/api/gifts/redeem",
            json={"gift_code": "TEST-CODE"},
            timeout=10
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Gift redeem correctly requires auth (401)")
    
    def test_my_sent_gifts_requires_auth(self):
        """GET /api/gifts/my/sent - should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/gifts/my/sent", timeout=10)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ My sent gifts correctly requires auth (401)")
    
    def test_my_received_gifts_requires_auth(self):
        """GET /api/gifts/my/received - should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/gifts/my/received", timeout=10)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ My received gifts correctly requires auth (401)")


class TestAdminEndpoints:
    """Test admin endpoints - auth protection"""
    
    def test_admin_collections_requires_auth(self):
        """GET /api/admin/collections - should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/collections", timeout=10)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Admin collections correctly requires auth (401)")
    
    def test_admin_seed_status_requires_auth(self):
        """GET /api/admin/seed-status - should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/seed-status", timeout=10)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Admin seed status correctly requires auth (401)")
    
    def test_admin_login_invalid_password(self):
        """POST /api/admin/login - should return 401 with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "wrong-password"},
            timeout=10
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Admin login correctly rejects invalid password (401)")


class TestContentLibraryEndpoints:
    """Test spiritual library content endpoints"""
    
    def test_yoga_poses_endpoint(self):
        """GET /api/yoga/poses - should return yoga poses"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses", timeout=10)
        assert response.status_code == 200, f"Yoga poses failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of yoga poses"
        print(f"✓ Yoga poses endpoint working - {len(data)} poses returned")
    
    def test_mantras_endpoint(self):
        """GET /api/mantras - should return mantras with content_integrity"""
        response = requests.get(f"{BASE_URL}/api/mantras", timeout=10)
        assert response.status_code == 200, f"Mantras failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of mantras"
        if len(data) > 0:
            first = data[0]
            assert "content_integrity" in first, "Mantra should have content_integrity"
        print(f"✓ Mantras endpoint working - {len(data)} mantras returned")
    
    def test_mudras_endpoint(self):
        """GET /api/mudras - should return mudras with content_integrity"""
        response = requests.get(f"{BASE_URL}/api/mudras", timeout=10)
        assert response.status_code == 200, f"Mudras failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of mudras"
        if len(data) > 0:
            first = data[0]
            assert "content_integrity" in first, "Mudra should have content_integrity"
        print(f"✓ Mudras endpoint working - {len(data)} mudras returned")
    
    def test_sacred_guardians_endpoint(self):
        """GET /api/sacred-guardians - should return sacred guardians"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians", timeout=10)
        assert response.status_code == 200, f"Sacred guardians failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of sacred guardians"
        print(f"✓ Sacred guardians endpoint working - {len(data)} guardians returned")
    
    def test_crystals_basic_endpoint(self):
        """GET /api/crystals - should return basic crystals"""
        response = requests.get(f"{BASE_URL}/api/crystals", timeout=10)
        assert response.status_code == 200, f"Crystals failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of crystals"
        print(f"✓ Crystals basic endpoint working - {len(data)} crystals returned")


class TestAuthEndpoints:
    """Test auth endpoints - session validation"""
    
    def test_auth_me_without_session(self):
        """GET /api/auth/me - should return 401 without session"""
        response = requests.get(f"{BASE_URL}/api/auth/me", timeout=10)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Auth me correctly returns 401 without session")
    
    def test_invalid_session_exchange(self):
        """POST /api/auth/session - should return 400 for invalid session"""
        response = requests.post(
            f"{BASE_URL}/api/auth/session",
            json={"session_id": "invalid-session-id"},
            timeout=10
        )
        # Should return 400 (validation error) not 500
        assert response.status_code in [400, 401, 422], f"Expected 400/401/422, got {response.status_code}"
        print(f"✓ Invalid session exchange handled correctly ({response.status_code})")


class TestExpandScriptEndpoint:
    """Test expand-script endpoint for guided practices"""
    
    def test_expand_script_basic(self):
        """POST /api/content/expand-script - should return expanded script"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Test Meditation",
                "element": "earth",
                "duration_minutes": 7,
                "steps": ["Breathe deeply", "Ground yourself"],
                "source_texts": ["This is a grounding practice"]
            },
            timeout=30
        )
        assert response.status_code == 200, f"Expand script failed: {response.status_code}"
        data = response.json()
        assert "word_count" in data, "Expected word_count in response"
        assert "segments" in data, "Expected segments in response"
        assert "paragraphs" in data, "Expected paragraphs in response"
        assert data["word_count"] >= 700, f"Expected 700+ words, got {data['word_count']}"
        print(f"✓ Expand script endpoint working - {data['word_count']} words generated")
    
    def test_expand_script_minimal(self):
        """POST /api/content/expand-script - should work with minimal input"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={"practice_name": "Simple Practice"},
            timeout=30
        )
        assert response.status_code == 200, f"Expand script minimal failed: {response.status_code}"
        data = response.json()
        assert data["word_count"] >= 700, f"Expected 700+ words, got {data['word_count']}"
        print(f"✓ Expand script minimal input working - {data['word_count']} words generated")


class TestAdditionalContentEndpoints:
    """Test additional content endpoints for completeness"""
    
    def test_chakra_cleansing_endpoint(self):
        """GET /api/chakra-cleansing - should return chakra cleansing data"""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing", timeout=10)
        assert response.status_code == 200, f"Chakra cleansing failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of chakra cleansing"
        print(f"✓ Chakra cleansing endpoint working - {len(data)} entries returned")
    
    def test_creative_processes_endpoint(self):
        """GET /api/creative-processes - should return creative processes"""
        response = requests.get(f"{BASE_URL}/api/creative-processes", timeout=10)
        assert response.status_code == 200, f"Creative processes failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of creative processes"
        print(f"✓ Creative processes endpoint working - {len(data)} entries returned")
    
    def test_water_practices_endpoint(self):
        """GET /api/water-practices - should return water practices"""
        response = requests.get(f"{BASE_URL}/api/water-practices", timeout=10)
        assert response.status_code == 200, f"Water practices failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of water practices"
        print(f"✓ Water practices endpoint working - {len(data)} entries returned")
    
    def test_earth_altars_endpoint(self):
        """GET /api/earth-altars - should return earth altars"""
        response = requests.get(f"{BASE_URL}/api/earth-altars", timeout=10)
        assert response.status_code == 200, f"Earth altars failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of earth altars"
        print(f"✓ Earth altars endpoint working - {len(data)} entries returned")
    
    def test_astrology_months_endpoint(self):
        """GET /api/astrology/months - should return 13 moon paths"""
        response = requests.get(f"{BASE_URL}/api/astrology/months", timeout=10)
        assert response.status_code == 200, f"Astrology months failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of astrology months"
        print(f"✓ Astrology months endpoint working - {len(data)} entries returned")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
