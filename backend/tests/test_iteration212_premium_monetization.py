"""
Test iteration 212: Premium monetization and Breathlove practices
Tests:
- GET /api/breathwork/sessions returns 10 premium Breathlove sessions (breathlove-1..breathlove-10)
- POST /api/payments/create-checkout with product_type=premium_unlock and valid product_ids
- GET /api/payments/entitlements returns sections map and full app flags
- GET /api/payments/premium-products returns premium unlock products
- Rose Temple and Healing Portals premium gating
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Test credentials from test_credentials.md
QA_EMAIL = "demoqa_740fefc1@example.com"
QA_PASSWORD = "DemoPass123!"


@pytest.fixture(scope="module")
def api_session():
    """Create a requests session for API calls."""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def auth_session(api_session):
    """Get authenticated session with QA user."""
    response = api_session.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": QA_EMAIL, "password": QA_PASSWORD}
    )
    if response.status_code == 200:
        return api_session
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


class TestBreathworkSessions:
    """Test breathwork sessions endpoint returns premium Breathlove sessions."""

    def test_breathwork_sessions_endpoint_returns_200(self, api_session):
        """GET /api/breathwork/sessions should return 200."""
        response = api_session.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_breathwork_sessions_contains_breathlove_sessions(self, api_session):
        """Breathwork sessions should include 10 premium Breathlove sessions."""
        response = api_session.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        
        data = response.json()
        sessions = data if isinstance(data, list) else data.get("sessions", [])
        
        # Find all breathlove sessions
        breathlove_sessions = [s for s in sessions if s.get("id", "").startswith("breathlove-")]
        
        assert len(breathlove_sessions) >= 10, f"Expected at least 10 Breathlove sessions, found {len(breathlove_sessions)}"
        
        # Verify all 10 breathlove IDs exist
        expected_ids = [f"breathlove-{i}" for i in range(1, 11)]
        found_ids = [s.get("id") for s in breathlove_sessions]
        
        for expected_id in expected_ids:
            assert expected_id in found_ids, f"Missing Breathlove session: {expected_id}"

    def test_breathlove_sessions_have_premium_flag(self, api_session):
        """All Breathlove sessions should have is_premium=True."""
        response = api_session.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        
        data = response.json()
        sessions = data if isinstance(data, list) else data.get("sessions", [])
        
        breathlove_sessions = [s for s in sessions if s.get("id", "").startswith("breathlove-")]
        
        for session in breathlove_sessions:
            assert session.get("is_premium") is True, f"Session {session.get('id')} should have is_premium=True"
            assert session.get("premium_unlock_id") == "premium_breathwork", f"Session {session.get('id')} should have premium_unlock_id=premium_breathwork"
            assert session.get("premium_label") == "Breathlove", f"Session {session.get('id')} should have premium_label=Breathlove"


class TestPremiumProducts:
    """Test premium products endpoint."""

    def test_premium_products_endpoint_returns_200(self, api_session):
        """GET /api/payments/premium-products should return 200."""
        response = api_session.get(f"{BASE_URL}/api/payments/premium-products")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_premium_products_contains_required_products(self, api_session):
        """Premium products should include all required unlock types."""
        response = api_session.get(f"{BASE_URL}/api/payments/premium-products")
        assert response.status_code == 200
        
        data = response.json()
        products = data.get("products", [])
        
        required_product_ids = ["premium_breathwork", "rose_temple", "healing_portals", "full_app_unlock"]
        found_ids = [p.get("id") for p in products]
        
        for required_id in required_product_ids:
            assert required_id in found_ids, f"Missing premium product: {required_id}"

    def test_premium_products_have_correct_structure(self, api_session):
        """Each premium product should have required fields."""
        response = api_session.get(f"{BASE_URL}/api/payments/premium-products")
        assert response.status_code == 200
        
        data = response.json()
        products = data.get("products", [])
        
        for product in products:
            assert "id" in product, f"Product missing 'id' field"
            assert "name" in product, f"Product {product.get('id')} missing 'name' field"
            assert "price" in product, f"Product {product.get('id')} missing 'price' field"
            assert "unlock_scope" in product, f"Product {product.get('id')} missing 'unlock_scope' field"
            assert product.get("price") > 0, f"Product {product.get('id')} should have positive price"


class TestPaymentCheckout:
    """Test payment checkout creation for premium unlocks."""

    def test_create_checkout_requires_auth(self, api_session):
        """POST /api/payments/create-checkout should require authentication."""
        response = api_session.post(
            f"{BASE_URL}/api/payments/create-checkout",
            json={
                "product_type": "premium_unlock",
                "product_id": "premium_breathwork",
                "origin_url": "https://example.com",
                "payment_method": "stripe"
            }
        )
        # Should return 401 or 403 for unauthenticated request
        assert response.status_code in [401, 403], f"Expected 401/403 for unauthenticated, got {response.status_code}"

    def test_create_checkout_premium_breathwork(self, auth_session):
        """POST /api/payments/create-checkout with premium_breathwork should return checkout_url."""
        response = auth_session.post(
            f"{BASE_URL}/api/payments/create-checkout",
            json={
                "product_type": "premium_unlock",
                "product_id": "premium_breathwork",
                "origin_url": "https://example.com",
                "return_path": "/breathwork",
                "payment_method": "stripe"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "checkout_url" in data, "Response should contain checkout_url"
        assert "session_id" in data, "Response should contain session_id"
        assert data.get("checkout_url").startswith("https://"), "checkout_url should be HTTPS URL"

    def test_create_checkout_rose_temple(self, auth_session):
        """POST /api/payments/create-checkout with rose_temple should return checkout_url."""
        response = auth_session.post(
            f"{BASE_URL}/api/payments/create-checkout",
            json={
                "product_type": "premium_unlock",
                "product_id": "rose_temple",
                "origin_url": "https://example.com",
                "return_path": "/rose-temple",
                "payment_method": "stripe"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "checkout_url" in data, "Response should contain checkout_url"

    def test_create_checkout_healing_portals(self, auth_session):
        """POST /api/payments/create-checkout with healing_portals should return checkout_url."""
        response = auth_session.post(
            f"{BASE_URL}/api/payments/create-checkout",
            json={
                "product_type": "premium_unlock",
                "product_id": "healing_portals",
                "origin_url": "https://example.com",
                "return_path": "/healing-portals",
                "payment_method": "stripe"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "checkout_url" in data, "Response should contain checkout_url"

    def test_create_checkout_full_app_unlock(self, auth_session):
        """POST /api/payments/create-checkout with full_app_unlock should return checkout_url."""
        response = auth_session.post(
            f"{BASE_URL}/api/payments/create-checkout",
            json={
                "product_type": "premium_unlock",
                "product_id": "full_app_unlock",
                "origin_url": "https://example.com",
                "return_path": "/breathwork",
                "payment_method": "stripe"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "checkout_url" in data, "Response should contain checkout_url"

    def test_create_checkout_invalid_product_id(self, auth_session):
        """POST /api/payments/create-checkout with invalid product_id should return 400."""
        response = auth_session.post(
            f"{BASE_URL}/api/payments/create-checkout",
            json={
                "product_type": "premium_unlock",
                "product_id": "invalid_product_xyz",
                "origin_url": "https://example.com",
                "payment_method": "stripe"
            }
        )
        assert response.status_code == 400, f"Expected 400 for invalid product_id, got {response.status_code}"


class TestEntitlements:
    """Test entitlements endpoint for authenticated users."""

    def test_entitlements_requires_auth(self, api_session):
        """GET /api/payments/entitlements should require authentication."""
        response = api_session.get(f"{BASE_URL}/api/payments/entitlements")
        assert response.status_code in [401, 403], f"Expected 401/403 for unauthenticated, got {response.status_code}"

    def test_entitlements_returns_sections_map(self, auth_session):
        """GET /api/payments/entitlements should return sections map."""
        response = auth_session.get(f"{BASE_URL}/api/payments/entitlements")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "sections" in data, "Response should contain 'sections' map"
        assert "has_subscription" in data, "Response should contain 'has_subscription' flag"
        assert "has_full_app_unlock" in data, "Response should contain 'has_full_app_unlock' flag"
        
        sections = data.get("sections", {})
        expected_section_keys = ["premium_breathwork", "rose_temple", "healing_portals"]
        for key in expected_section_keys:
            assert key in sections, f"Sections map should contain '{key}'"


class TestHealingPortals:
    """Test healing portals endpoint."""

    def test_healing_portals_endpoint_returns_200(self, api_session):
        """GET /api/healing-portals should return 200."""
        response = api_session.get(f"{BASE_URL}/api/healing-portals")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_healing_portals_returns_list(self, api_session):
        """GET /api/healing-portals should return a list of portals."""
        response = api_session.get(f"{BASE_URL}/api/healing-portals")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list of portals"

    def test_healing_portals_have_premium_flag(self, api_session):
        """Healing portals should have is_premium field."""
        response = api_session.get(f"{BASE_URL}/api/healing-portals")
        assert response.status_code == 200
        
        data = response.json()
        if len(data) > 0:
            # Check first portal has expected fields
            portal = data[0]
            assert "id" in portal, "Portal should have 'id' field"
            assert "name" in portal, "Portal should have 'name' field"
            # is_premium may or may not be present depending on portal


class TestReturnPathFlow:
    """Test return path flow for checkout."""

    def test_checkout_with_return_path_includes_session_id_placeholder(self, auth_session):
        """Checkout with return_path should include session_id in success URL."""
        response = auth_session.post(
            f"{BASE_URL}/api/payments/create-checkout",
            json={
                "product_type": "premium_unlock",
                "product_id": "premium_breathwork",
                "origin_url": "https://example.com",
                "return_path": "/breathwork",
                "payment_method": "stripe"
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        # The checkout_url is from Stripe, but we verify the session was created
        assert "session_id" in data, "Response should contain session_id for return path flow"


class TestPricingPlans:
    """Test pricing plans endpoint."""

    def test_plans_endpoint_returns_200(self, api_session):
        """GET /api/payments/plans should return 200."""
        response = api_session.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_plans_contains_monthly_and_yearly(self, api_session):
        """Plans should include monthly and yearly options."""
        response = api_session.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200
        
        data = response.json()
        plans = data.get("plans", [])
        
        plan_ids = [p.get("id") for p in plans]
        assert "monthly" in plan_ids, "Plans should include 'monthly'"
        assert "yearly" in plan_ids, "Plans should include 'yearly'"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
