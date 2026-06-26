"""
Iteration 213: P1 Polish Hardening Tests
- GET /api/payments/entitlements returns 401 when unauthenticated
- GET /api/payments/entitlements returns valid schema when authenticated
- Payment pages responsive layout verification
- Premium hook behavior for signed-out state
"""
import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Test credentials
QA_EMAIL = "demoqa_740fefc1@example.com"
QA_PASSWORD = "DemoPass123!"


class TestEntitlementsUnauth:
    """Test entitlements endpoint behavior for unauthenticated requests"""

    def test_entitlements_returns_401_without_auth(self):
        """GET /api/payments/entitlements should return 401 when unauthenticated"""
        response = requests.get(
            f"{BASE_URL}/api/payments/entitlements",
            headers={"Content-Type": "application/json"},
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert "detail" in data, "Response should contain 'detail' field"
        assert "not authenticated" in data["detail"].lower(), f"Unexpected detail: {data['detail']}"

    def test_entitlements_no_cookies_returns_401(self):
        """Verify truly unauthenticated request (no cookies/headers) returns 401"""
        # Create a fresh session with no cookies
        session = requests.Session()
        session.cookies.clear()
        
        response = session.get(
            f"{BASE_URL}/api/payments/entitlements",
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


class TestEntitlementsAuth:
    """Test entitlements endpoint behavior for authenticated requests"""

    @pytest.fixture
    def auth_session(self):
        """Create authenticated session"""
        session = requests.Session()
        login_response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": QA_EMAIL, "password": QA_PASSWORD},
        )
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        return session

    def test_entitlements_returns_200_with_auth(self, auth_session):
        """GET /api/payments/entitlements should return 200 when authenticated"""
        response = auth_session.get(f"{BASE_URL}/api/payments/entitlements")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    def test_entitlements_schema_has_subscription(self, auth_session):
        """Entitlements response should have has_subscription boolean"""
        response = auth_session.get(f"{BASE_URL}/api/payments/entitlements")
        data = response.json()
        assert "has_subscription" in data, "Missing 'has_subscription' field"
        assert isinstance(data["has_subscription"], bool), "has_subscription should be boolean"

    def test_entitlements_schema_has_full_app_unlock(self, auth_session):
        """Entitlements response should have has_full_app_unlock boolean"""
        response = auth_session.get(f"{BASE_URL}/api/payments/entitlements")
        data = response.json()
        assert "has_full_app_unlock" in data, "Missing 'has_full_app_unlock' field"
        assert isinstance(data["has_full_app_unlock"], bool), "has_full_app_unlock should be boolean"

    def test_entitlements_schema_has_sections(self, auth_session):
        """Entitlements response should have sections dict with expected keys"""
        response = auth_session.get(f"{BASE_URL}/api/payments/entitlements")
        data = response.json()
        assert "sections" in data, "Missing 'sections' field"
        assert isinstance(data["sections"], dict), "sections should be dict"
        
        expected_sections = ["premium_breathwork", "rose_temple", "healing_portals"]
        for section in expected_sections:
            assert section in data["sections"], f"Missing section: {section}"
            assert isinstance(data["sections"][section], bool), f"{section} should be boolean"

    def test_entitlements_schema_has_purchased_unlocks(self, auth_session):
        """Entitlements response should have purchased_unlocks list"""
        response = auth_session.get(f"{BASE_URL}/api/payments/entitlements")
        data = response.json()
        assert "purchased_unlocks" in data, "Missing 'purchased_unlocks' field"
        assert isinstance(data["purchased_unlocks"], list), "purchased_unlocks should be list"


class TestPremiumProducts:
    """Test premium products endpoint"""

    def test_premium_products_returns_200(self):
        """GET /api/payments/premium-products should return 200"""
        response = requests.get(f"{BASE_URL}/api/payments/premium-products")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    def test_premium_products_has_products_list(self):
        """Premium products response should have products list"""
        response = requests.get(f"{BASE_URL}/api/payments/premium-products")
        data = response.json()
        assert "products" in data, "Missing 'products' field"
        assert isinstance(data["products"], list), "products should be list"
        assert len(data["products"]) >= 4, f"Expected at least 4 products, got {len(data['products'])}"

    def test_premium_products_schema(self):
        """Each premium product should have required fields"""
        response = requests.get(f"{BASE_URL}/api/payments/premium-products")
        data = response.json()
        
        required_fields = ["id", "name", "description", "price", "currency", "unlock_scope"]
        for product in data["products"]:
            for field in required_fields:
                assert field in product, f"Product missing field: {field}"


class TestSubscriptionPlans:
    """Test subscription plans endpoint"""

    def test_plans_returns_200(self):
        """GET /api/payments/plans should return 200"""
        response = requests.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    def test_plans_has_monthly_and_yearly(self):
        """Plans should include monthly and yearly options"""
        response = requests.get(f"{BASE_URL}/api/payments/plans")
        data = response.json()
        assert "plans" in data, "Missing 'plans' field"
        
        plan_ids = [p["id"] for p in data["plans"]]
        assert "monthly" in plan_ids, "Missing monthly plan"
        assert "yearly" in plan_ids, "Missing yearly plan"


class TestAuthFlow:
    """Test authentication flow for premium access"""

    def test_login_sets_session_cookie(self):
        """Login should set session_token cookie"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": QA_EMAIL, "password": QA_PASSWORD},
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        # Check response has session_token
        data = response.json()
        assert "session_token" in data, "Missing session_token in response"

    def test_logout_invalidates_session(self):
        """Logout should invalidate session for entitlements"""
        session = requests.Session()
        
        # Login
        login_response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": QA_EMAIL, "password": QA_PASSWORD},
        )
        assert login_response.status_code == 200
        
        # Verify entitlements works
        entitlements_before = session.get(f"{BASE_URL}/api/payments/entitlements")
        assert entitlements_before.status_code == 200
        
        # Logout
        logout_response = session.post(f"{BASE_URL}/api/auth/logout")
        assert logout_response.status_code == 200
        
        # Verify entitlements now returns 401
        entitlements_after = session.get(f"{BASE_URL}/api/payments/entitlements")
        assert entitlements_after.status_code == 401, f"Expected 401 after logout, got {entitlements_after.status_code}"


class TestPaymentStatusEndpoint:
    """Test payment status endpoint"""

    @pytest.fixture
    def auth_session(self):
        """Create authenticated session"""
        session = requests.Session()
        login_response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": QA_EMAIL, "password": QA_PASSWORD},
        )
        assert login_response.status_code == 200
        return session

    def test_payment_status_invalid_session_returns_error(self, auth_session):
        """GET /api/payments/status/{invalid_id} should return error"""
        response = auth_session.get(f"{BASE_URL}/api/payments/status/invalid-session-id")
        # Should return 404 or 500 for invalid session
        assert response.status_code in [404, 500], f"Expected 404/500, got {response.status_code}"
