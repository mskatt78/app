"""
Iteration 131 - P0/P1 Refactor Regression Tests
Tests for:
- P1 backend payments endpoints (plans, bundles)
- P1 backend numerology/astrology current month endpoint
- Guided narration 7-minute floor check
- Retreats cleanup check
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestPaymentsEndpoints:
    """P1 backend complexity refactor regression: payments endpoints"""

    def test_payments_plans_endpoint(self):
        """GET /api/payments/plans should return valid plans without 500"""
        response = requests.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "plans" in data, "Response should contain 'plans' key"
        assert "payment_methods" in data, "Response should contain 'payment_methods' key"
        
        plans = data["plans"]
        assert len(plans) >= 2, "Should have at least 2 plans (monthly, yearly)"
        
        # Verify plan structure
        for plan in plans:
            assert "id" in plan, "Plan should have 'id'"
            assert "name" in plan, "Plan should have 'name'"
            assert "price" in plan, "Plan should have 'price'"
            assert "interval" in plan, "Plan should have 'interval'"
            assert "features" in plan, "Plan should have 'features'"
        
        # Verify payment methods
        payment_methods = data["payment_methods"]
        assert "stripe" in payment_methods, "Should support stripe"
        assert "paypal" in payment_methods, "Should support paypal"

    def test_payments_bundles_endpoint(self):
        """GET /api/payments/bundles should return valid bundles without 500"""
        response = requests.get(f"{BASE_URL}/api/payments/bundles")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 1, "Should have at least 1 bundle"
        
        # Verify bundle structure
        for bundle in data:
            assert "id" in bundle, "Bundle should have 'id'"
            assert "name" in bundle, "Bundle should have 'name'"
            assert "price" in bundle, "Bundle should have 'price'"
            assert "courses" in bundle, "Bundle should have 'courses'"
            assert "savings" in bundle, "Bundle should have 'savings'"


class TestNumerologyAstrologyEndpoints:
    """P1 backend regression: numerology current month endpoint"""

    def test_astrology_current_endpoint(self):
        """GET /api/astrology/current should return valid current month object"""
        response = requests.get(f"{BASE_URL}/api/astrology/current")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "id" in data, "Response should have 'id'"
        assert "month_number" in data, "Response should have 'month_number'"
        assert "name" in data, "Response should have 'name'"
        assert "symbol" in data, "Response should have 'symbol'"
        assert "element" in data, "Response should have 'element'"
        assert "dates" in data, "Response should have 'dates'"
        assert "description" in data, "Response should have 'description'"
        assert "themes" in data, "Response should have 'themes'"
        
        # Verify month_number is valid (1-13)
        assert 1 <= data["month_number"] <= 13, f"Month number should be 1-13, got {data['month_number']}"

    def test_astrology_months_endpoint(self):
        """GET /api/astrology/months should return all 13 lunar months"""
        response = requests.get(f"{BASE_URL}/api/astrology/months")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 13, f"Should have exactly 13 months, got {len(data)}"


class TestGuidedNarrationFloor:
    """Guided narration floor check: POST /api/content/expand-script"""

    def test_expand_script_7_minute_floor(self):
        """POST /api/content/expand-script should return word_count >= 840 for 7-minute floor"""
        payload = {
            "practice_name": "Earth Grounding Meditation",
            "element": "earth",
            "duration_minutes": 7,
            "steps": ["Sit comfortably", "Close your eyes", "Feel your breath"],
            "source_texts": ["Connect with the earth element"],
            "use_ai": False
        }
        
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "target_word_count" in data, "Response should have 'target_word_count'"
        assert "word_count" in data, "Response should have 'word_count'"
        assert "target_minutes" in data, "Response should have 'target_minutes'"
        assert "paragraphs" in data, "Response should have 'paragraphs'"
        assert "segments" in data, "Response should have 'segments'"
        
        # Verify 7-minute floor (120 words/min * 7 min = 840 words)
        assert data["target_word_count"] >= 840, f"Target word count should be >= 840, got {data['target_word_count']}"
        assert data["word_count"] >= 840, f"Word count should be >= 840 for 7-minute floor, got {data['word_count']}"
        assert data["target_minutes"] >= 7, f"Target minutes should be >= 7, got {data['target_minutes']}"

    def test_expand_script_with_different_elements(self):
        """Test expand-script works with all elements"""
        elements = ["earth", "water", "fire", "air", "spirit"]
        
        for element in elements:
            payload = {
                "practice_name": f"{element.title()} Practice",
                "element": element,
                "duration_minutes": 7,
                "steps": ["Begin", "Continue", "Complete"],
                "source_texts": [f"Connect with {element}"],
                "use_ai": False
            }
            
            response = requests.post(
                f"{BASE_URL}/api/content/expand-script",
                json=payload
            )
            assert response.status_code == 200, f"Expected 200 for {element}, got {response.status_code}"
            
            data = response.json()
            assert data["word_count"] >= 840, f"Word count for {element} should be >= 840, got {data['word_count']}"


class TestRetreatsCleanup:
    """Retreats cleanup check: GET /api/retreats should return empty or non-placeholder records"""

    def test_retreats_endpoint_no_placeholders(self):
        """GET /api/retreats should return empty or non-placeholder authored records"""
        response = requests.get(f"{BASE_URL}/api/retreats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # If there are retreats, verify they are not test placeholders
        for retreat in data:
            # Check for common placeholder patterns
            name = retreat.get("name", "").lower()
            title = retreat.get("title", "").lower()
            description = retreat.get("description", "").lower()
            
            placeholder_patterns = ["test", "placeholder", "sample", "demo", "lorem ipsum"]
            
            for pattern in placeholder_patterns:
                assert pattern not in name, f"Retreat name should not contain '{pattern}': {name}"
                assert pattern not in title, f"Retreat title should not contain '{pattern}': {title}"
                # Description can have some flexibility, but check for obvious placeholders
                if "lorem ipsum" in description:
                    pytest.fail(f"Retreat description contains placeholder text: {description[:100]}")


class TestFrontendRefactorComponents:
    """Verify frontend component endpoints still work after refactor"""

    def test_elemental_practices_endpoint(self):
        """GET /api/elemental-practices should return practices"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 1, "Should have at least 1 elemental practice"

    def test_elemental_practices_filter(self):
        """GET /api/elemental-practices?element=earth should filter by element"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices?element=earth")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # All returned practices should be earth element
        for practice in data:
            assert practice.get("element", "").lower() == "earth", f"Practice should be earth element: {practice.get('element')}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
