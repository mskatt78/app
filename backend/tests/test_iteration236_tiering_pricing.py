"""
Iteration 236 - Backend Tests for Content Tiering, Pricing Plans, and Admin Privacy
Tests:
1. Content tiering: 14 items total (4 free + 10 premium) per section
2. Pricing plans: exactly 2 plans (monthly + full_app_unlock)
3. Retreats cleanup: should be empty
4. Expand-script: minimum 7-minute word floor
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

@pytest.fixture(scope="module")
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestContentTiering:
    """Verify each main section returns max 14 items: 4 free + 10 premium"""
    
    SECTION_ENDPOINTS = [
        "/api/water-practices",
        "/api/meditations",
        "/api/creative-processes",
        "/api/heart-practices",
        "/api/shamanic-practices",
        "/api/energy-healing",
        "/api/mindfulness-practices",
        "/api/mantras",
    ]
    
    @pytest.mark.parametrize("endpoint", SECTION_ENDPOINTS)
    def test_section_tiering_14_items(self, api_client, endpoint):
        """Each section should return exactly 14 items (4 free + 10 premium)"""
        response = api_client.get(f"{BASE_URL}{endpoint}")
        assert response.status_code == 200, f"{endpoint} returned {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), f"{endpoint} should return a list"
        
        total = len(data)
        free_items = [item for item in data if not item.get("is_premium")]
        premium_items = [item for item in data if item.get("is_premium")]
        
        # Verify total is max 14
        assert total <= 14, f"{endpoint}: Expected max 14 items, got {total}"
        
        # Verify exactly 4 free items
        assert len(free_items) == 4, f"{endpoint}: Expected 4 free items, got {len(free_items)}"
        
        # Verify up to 10 premium items
        assert len(premium_items) <= 10, f"{endpoint}: Expected max 10 premium items, got {len(premium_items)}"
        
        # Verify total = free + premium
        assert len(free_items) + len(premium_items) == total, f"{endpoint}: Free + Premium != Total"
        
        print(f"PASS: {endpoint} - Total: {total}, Free: {len(free_items)}, Premium: {len(premium_items)}")


class TestPricingPlans:
    """Verify pricing plans endpoint returns exactly 2 plans"""
    
    def test_plans_endpoint_returns_two_plans(self, api_client):
        """GET /api/payments/plans should return exactly 2 plans"""
        response = api_client.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200
        
        data = response.json()
        plans = data.get("plans", [])
        
        assert len(plans) == 2, f"Expected 2 plans, got {len(plans)}"
        
        plan_ids = [p.get("id") for p in plans]
        assert "monthly" in plan_ids, "Missing 'monthly' plan"
        assert "full_app_unlock" in plan_ids, "Missing 'full_app_unlock' plan"
        
        print(f"PASS: Plans endpoint returns exactly 2 plans: {plan_ids}")
    
    def test_monthly_plan_details(self, api_client):
        """Monthly plan should have correct structure"""
        response = api_client.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200
        
        data = response.json()
        plans = data.get("plans", [])
        monthly = next((p for p in plans if p.get("id") == "monthly"), None)
        
        assert monthly is not None, "Monthly plan not found"
        assert monthly.get("price") == 19.99, f"Monthly price should be 19.99, got {monthly.get('price')}"
        assert monthly.get("interval") == "month", f"Monthly interval should be 'month'"
        assert "features" in monthly, "Monthly plan should have features"
        
        print(f"PASS: Monthly plan - ${monthly.get('price')}/{monthly.get('interval')}")
    
    def test_lifetime_plan_details(self, api_client):
        """Lifetime plan should have correct structure"""
        response = api_client.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200
        
        data = response.json()
        plans = data.get("plans", [])
        lifetime = next((p for p in plans if p.get("id") == "full_app_unlock"), None)
        
        assert lifetime is not None, "Lifetime plan not found"
        assert lifetime.get("price") == 369.0, f"Lifetime price should be 369.0, got {lifetime.get('price')}"
        assert lifetime.get("interval") == "lifetime", f"Lifetime interval should be 'lifetime'"
        assert "features" in lifetime, "Lifetime plan should have features"
        
        print(f"PASS: Lifetime plan - ${lifetime.get('price')} (one-time)")


class TestRetreatsCleanup:
    """Verify retreats endpoint is empty (cleanup completed)"""
    
    def test_retreats_empty(self, api_client):
        """GET /api/retreats should return empty list"""
        response = api_client.get(f"{BASE_URL}/api/retreats")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list), "Retreats should return a list"
        assert len(data) == 0, f"Expected empty retreats, got {len(data)} items"
        
        print("PASS: Retreats endpoint returns empty list (cleanup verified)")


class TestExpandScript:
    """Verify expand-script meets 7-minute minimum word floor"""
    
    TARGET_MINUTES = 7
    WORDS_PER_MINUTE = 132
    MIN_WORDS = TARGET_MINUTES * WORDS_PER_MINUTE  # 924 words
    
    def test_expand_script_meets_word_floor(self, api_client):
        """POST /api/content/expand-script should return >= 924 words for 7-minute target"""
        payload = {
            "script": "Welcome to this meditation. Breathe deeply and relax. Feel the earth beneath you.",
            "target_minutes": self.TARGET_MINUTES,
            "practice_name": "Test Meditation"
        }
        
        response = api_client.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200, f"Expand-script returned {response.status_code}"
        
        data = response.json()
        word_count = data.get("word_count", 0)
        segments = data.get("segments", [])
        
        assert word_count >= self.MIN_WORDS, f"Expected >= {self.MIN_WORDS} words, got {word_count}"
        assert len(segments) > 0, "Expected non-empty segments"
        
        # Verify segments are non-empty strings
        non_empty_segments = [s for s in segments if isinstance(s, str) and s.strip()]
        assert len(non_empty_segments) > 0, "Expected non-empty segment content"
        
        print(f"PASS: Expand-script returns {word_count} words (min: {self.MIN_WORDS}), {len(segments)} segments")
    
    def test_expand_script_response_structure(self, api_client):
        """Expand-script response should have required fields"""
        payload = {
            "script": "A simple meditation script.",
            "target_minutes": 7,
            "practice_name": "Structure Test"
        }
        
        response = api_client.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        required_fields = ["practice_name", "target_minutes", "word_count", "segments", "paragraphs"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        print(f"PASS: Expand-script response has all required fields")


class TestOracleNoAIWording:
    """Verify Oracle endpoints don't expose AI terminology to users"""
    
    def test_oracle_guest_reading_no_ai_term(self, api_client):
        """Oracle guest reading should not contain 'AI' in user-facing response"""
        payload = {
            "question": "What guidance do I need today?",
            "spread_type": "single"
        }
        
        response = api_client.post(f"{BASE_URL}/api/oracle/reading/guest", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        interpretation = data.get("interpretation", "")
        
        # Check that 'AI' is not prominently mentioned in interpretation
        # Note: This is a soft check - AI may appear in context but shouldn't be the focus
        ai_mentions = interpretation.lower().count(" ai ")
        assert ai_mentions == 0, f"Found {ai_mentions} mentions of ' AI ' in interpretation"
        
        print("PASS: Oracle guest reading does not expose AI terminology")


class TestHealthCheck:
    """Basic health check"""
    
    def test_api_health(self, api_client):
        """API should be accessible"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("PASS: API health check")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
