"""
Iteration 118 - Code Review Refactor Regression Tests

Tests for:
1. Backend /api/content/expand-script after helper extraction
2. Backend payments/gifts endpoints after service-layer extraction
3. Provenance endpoints: /api/ancient-wisdom, /api/shamanic-practices, /api/elemental-practices, /api/heart-practices
4. Route guards and hook stability (via API behavior)
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

class TestExpandScriptEndpoint:
    """Test /api/content/expand-script after helper extraction refactor."""
    
    def test_expand_script_basic_request(self):
        """Verify expand-script endpoint still works after helper extraction."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Test Meditation",
                "element": "water",
                "duration_minutes": 10,
                "steps": ["Breathe deeply", "Relax your body", "Focus on stillness"],
                "source_texts": ["This is a calming practice for inner peace."],
                "use_ai": False
            },
            timeout=30
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "practice_name" in data
        assert "target_minutes" in data
        assert "target_word_count" in data
        assert "word_count" in data
        assert "used_ai" in data
        assert "paragraphs" in data
        assert "segments" in data
        
        # Verify content
        assert data["practice_name"] == "Test Meditation"
        assert data["target_minutes"] >= 7  # MIN_NARRATION_MINUTES
        assert data["word_count"] > 0
        assert len(data["paragraphs"]) > 0
        assert len(data["segments"]) > 0
        print(f"PASS: expand-script returned {data['word_count']} words in {len(data['segments'])} segments")
    
    def test_expand_script_minimal_request(self):
        """Test expand-script with minimal required fields."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Simple Practice"
            },
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        assert data["practice_name"] == "Simple Practice"
        assert data["word_count"] > 0
        print(f"PASS: minimal expand-script returned {data['word_count']} words")
    
    def test_expand_script_anti_repetition_modes(self):
        """Test both anti-repetition modes work."""
        for mode in ["strict", "balanced"]:
            response = requests.post(
                f"{BASE_URL}/api/content/expand-script",
                json={
                    "practice_name": f"Test {mode.title()} Mode",
                    "duration_minutes": 8,
                    "anti_repetition_mode": mode
                },
                timeout=30
            )
            assert response.status_code == 200, f"Mode {mode} failed: {response.text}"
            data = response.json()
            assert data["word_count"] > 0
            print(f"PASS: anti_repetition_mode={mode} returned {data['word_count']} words")


class TestPaymentsEndpoints:
    """Test payments endpoints after service-layer extraction."""
    
    def test_get_subscription_plans(self):
        """Verify /api/payments/plans returns plan data."""
        response = requests.get(f"{BASE_URL}/api/payments/plans", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "plans" in data
        assert len(data["plans"]) >= 2  # monthly and yearly
        assert "payment_methods" in data
        print(f"PASS: /api/payments/plans returned {len(data['plans'])} plans")
    
    def test_get_bundles(self):
        """Verify /api/payments/bundles returns bundle data."""
        response = requests.get(f"{BASE_URL}/api/payments/bundles", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            bundle = data[0]
            assert "id" in bundle
            assert "name" in bundle
            assert "price" in bundle
        print(f"PASS: /api/payments/bundles returned {len(data)} bundles")
    
    def test_create_checkout_requires_auth(self):
        """Verify /api/payments/create-checkout requires authentication."""
        response = requests.post(
            f"{BASE_URL}/api/payments/create-checkout",
            json={
                "product_type": "subscription",
                "plan_id": "monthly",
                "origin_url": "https://example.com",
                "payment_method": "stripe"
            },
            timeout=10
        )
        # Should return 401 without auth
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: create-checkout correctly requires authentication")
    
    def test_subscription_status_requires_auth(self):
        """Verify /api/payments/subscription-status requires authentication."""
        response = requests.get(f"{BASE_URL}/api/payments/subscription-status", timeout=10)
        assert response.status_code == 401
        print("PASS: subscription-status correctly requires authentication")
    
    def test_course_access_requires_auth(self):
        """Verify /api/payments/course-access requires authentication."""
        response = requests.get(f"{BASE_URL}/api/payments/course-access", timeout=10)
        assert response.status_code == 401
        print("PASS: course-access correctly requires authentication")


class TestGiftsEndpoints:
    """Test gifts endpoints after service-layer extraction."""
    
    def test_create_gift_validation(self):
        """Verify /api/gifts/create validates input."""
        response = requests.post(
            f"{BASE_URL}/api/gifts/create",
            json={},
            timeout=10
        )
        # Should return 422 for missing required fields
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("PASS: gifts/create correctly validates input")
    
    def test_get_gift_not_found(self):
        """Verify /api/gifts/{code} returns 404 for non-existent gift."""
        response = requests.get(f"{BASE_URL}/api/gifts/NONEXISTENT-CODE", timeout=10)
        assert response.status_code == 404
        print("PASS: gifts/{code} correctly returns 404 for non-existent gift")
    
    def test_pay_gift_requires_auth(self):
        """Verify /api/gifts/pay requires authentication."""
        response = requests.post(
            f"{BASE_URL}/api/gifts/pay",
            json={
                "gift_code": "TEST-CODE",
                "origin_url": "https://example.com",
                "payment_method": "stripe"
            },
            timeout=10
        )
        assert response.status_code == 401
        print("PASS: gifts/pay correctly requires authentication")
    
    def test_redeem_gift_requires_auth(self):
        """Verify /api/gifts/redeem requires authentication."""
        response = requests.post(
            f"{BASE_URL}/api/gifts/redeem",
            json={"gift_code": "TEST-CODE"},
            timeout=10
        )
        assert response.status_code == 401
        print("PASS: gifts/redeem correctly requires authentication")
    
    def test_my_sent_gifts_requires_auth(self):
        """Verify /api/gifts/my/sent requires authentication."""
        response = requests.get(f"{BASE_URL}/api/gifts/my/sent", timeout=10)
        assert response.status_code == 401
        print("PASS: gifts/my/sent correctly requires authentication")
    
    def test_my_received_gifts_requires_auth(self):
        """Verify /api/gifts/my/received requires authentication."""
        response = requests.get(f"{BASE_URL}/api/gifts/my/received", timeout=10)
        assert response.status_code == 401
        print("PASS: gifts/my/received correctly requires authentication")


class TestProvenanceEndpoints:
    """Test provenance endpoints still return content_integrity metadata."""
    
    def test_ancient_wisdom_content_integrity(self):
        """Verify /api/ancient-wisdom returns content_integrity."""
        response = requests.get(f"{BASE_URL}/api/ancient-wisdom", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Expected ancient wisdom entries"
        
        # Check first item has content_integrity
        item = data[0]
        assert "content_integrity" in item, "Missing content_integrity field"
        integrity = item["content_integrity"]
        assert "source_type" in integrity
        assert "verified" in integrity
        assert "references_count" in integrity
        print(f"PASS: /api/ancient-wisdom returned {len(data)} entries with content_integrity")
    
    def test_shamanic_practices_content_integrity(self):
        """Verify /api/shamanic-practices returns content_integrity."""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Expected shamanic practices"
        
        item = data[0]
        assert "content_integrity" in item
        print(f"PASS: /api/shamanic-practices returned {len(data)} entries with content_integrity")
    
    def test_elemental_practices_content_integrity(self):
        """Verify /api/elemental-practices returns content_integrity."""
        response = requests.get(f"{BASE_URL}/api/elemental-practices", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Expected elemental practices"
        
        item = data[0]
        assert "content_integrity" in item
        print(f"PASS: /api/elemental-practices returned {len(data)} entries with content_integrity")
    
    def test_heart_practices_content_integrity(self):
        """Verify /api/heart-practices returns content_integrity."""
        response = requests.get(f"{BASE_URL}/api/heart-practices", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Expected heart practices"
        
        item = data[0]
        assert "content_integrity" in item
        print(f"PASS: /api/heart-practices returned {len(data)} entries with content_integrity")


class TestAdminEndpoints:
    """Test admin endpoints after complexity refactors."""
    
    def test_admin_collections_requires_auth(self):
        """Verify /api/admin/collections requires admin auth."""
        response = requests.get(f"{BASE_URL}/api/admin/collections", timeout=10)
        assert response.status_code == 401
        print("PASS: admin/collections correctly requires authentication")
    
    def test_admin_seed_status_requires_auth(self):
        """Verify /api/admin/seed-status requires admin auth."""
        response = requests.get(f"{BASE_URL}/api/admin/seed-status", timeout=10)
        assert response.status_code == 401
        print("PASS: admin/seed-status correctly requires authentication")
    
    def test_admin_login_validation(self):
        """Verify /api/admin/login validates password."""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "wrong-password"},
            timeout=10
        )
        assert response.status_code == 401
        print("PASS: admin/login correctly rejects wrong password")


class TestContentEndpoints:
    """Test content endpoints still work after refactors."""
    
    def test_yoga_poses(self):
        """Verify /api/yoga/poses returns data."""
        response = requests.get(f"{BASE_URL}/api/yoga/poses", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: /api/yoga/poses returned {len(data)} poses")
    
    def test_breathwork_sessions(self):
        """Verify /api/breathwork/sessions returns data."""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: /api/breathwork/sessions returned {len(data)} sessions")
    
    def test_crystals(self):
        """Verify /api/crystals returns data."""
        response = requests.get(f"{BASE_URL}/api/crystals", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: /api/crystals returned {len(data)} crystals")
    
    def test_mantras(self):
        """Verify /api/mantras returns data with content_integrity."""
        response = requests.get(f"{BASE_URL}/api/mantras", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert "content_integrity" in data[0]
        print(f"PASS: /api/mantras returned {len(data)} mantras")
    
    def test_meditations(self):
        """Verify /api/meditations returns data with content_integrity."""
        response = requests.get(f"{BASE_URL}/api/meditations", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert "content_integrity" in data[0]
        print(f"PASS: /api/meditations returned {len(data)} meditations")
    
    def test_daily_practice(self):
        """Verify /api/daily-practice returns data."""
        response = requests.get(f"{BASE_URL}/api/daily-practice", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert "day_of_week" in data
        assert "moon_phase" in data
        print(f"PASS: /api/daily-practice returned data for {data.get('day_of_week')}")
    
    def test_chakra_cleansing(self):
        """Verify /api/chakra-cleansing returns data."""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: /api/chakra-cleansing returned {len(data)} practices")
    
    def test_earth_altars(self):
        """Verify /api/earth-altars returns data."""
        response = requests.get(f"{BASE_URL}/api/earth-altars", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: /api/earth-altars returned {len(data)} altars")
    
    def test_creative_processes(self):
        """Verify /api/creative-processes returns data."""
        response = requests.get(f"{BASE_URL}/api/creative-processes", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: /api/creative-processes returned {len(data)} processes")
    
    def test_water_practices(self):
        """Verify /api/water-practices returns data."""
        response = requests.get(f"{BASE_URL}/api/water-practices", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: /api/water-practices returned {len(data)} practices")
    
    def test_astrology_months(self):
        """Verify /api/astrology/months returns data."""
        response = requests.get(f"{BASE_URL}/api/astrology/months", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: /api/astrology/months returned {len(data)} months")
    
    def test_dashboard_daily_requires_auth(self):
        """Verify /api/dashboard/daily requires authentication."""
        response = requests.get(f"{BASE_URL}/api/dashboard/daily", timeout=15)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: /api/dashboard/daily correctly requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
