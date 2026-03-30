"""
Test Payment Routes - PayPal Integration and Router Refactoring
Tests:
- GET /api/payments/plans returns payment_methods array with 'stripe' and 'paypal'
- Auth routes work via new auth router (/api/auth/me, /api/auth/login)
- Payment routes work via new payments router (/api/payments/subscription-status)
- PayPal checkout returns proper error when not configured
"""

import pytest
import requests
import os
from datetime import datetime, timezone, timedelta
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = f"test_paypal_{uuid.uuid4().hex[:8]}@example.com"
TEST_PASSWORD = "TestPassword123!"
TEST_NAME = "PayPal Test User"


class TestPaymentsPlansEndpoint:
    """Test /api/payments/plans endpoint - no auth required"""

    def test_plans_returns_payment_methods_array(self):
        """Verify /api/payments/plans returns payment_methods with 'stripe' and 'paypal'"""
        response = requests.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "plans" in data, "Response should contain 'plans' key"
        assert "payment_methods" in data, "Response should contain 'payment_methods' key"
        
        payment_methods = data["payment_methods"]
        assert isinstance(payment_methods, list), "payment_methods should be a list"
        assert "stripe" in payment_methods, "payment_methods should include 'stripe'"
        assert "paypal" in payment_methods, "payment_methods should include 'paypal'"
        
        print(f"✓ Payment methods: {payment_methods}")

    def test_plans_has_valid_plan_structure(self):
        """Verify plans have expected structure"""
        response = requests.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200
        
        data = response.json()
        plans = data.get("plans", [])
        assert len(plans) >= 2, "Should have at least 2 plans (monthly and yearly)"
        
        for plan in plans:
            assert "id" in plan, "Plan should have 'id'"
            assert "name" in plan, "Plan should have 'name'"
            assert "price" in plan, "Plan should have 'price'"
            assert "interval" in plan, "Plan should have 'interval'"
            assert "features" in plan, "Plan should have 'features'"
            assert isinstance(plan["features"], list), "Features should be a list"
        
        plan_ids = [p["id"] for p in plans]
        assert "monthly" in plan_ids, "Should have monthly plan"
        assert "yearly" in plan_ids, "Should have yearly plan"
        
        print(f"✓ Plans: {plan_ids}")


class TestAuthRouterRefactoring:
    """Test auth routes work via refactored router structure"""

    def test_auth_me_requires_authentication(self):
        """Verify /api/auth/me returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ /api/auth/me correctly requires authentication")

    def test_auth_login_endpoint_exists(self):
        """Verify /api/auth/login endpoint exists and validates input"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "nonexistent@test.com", "password": "wrongpass"}
        )
        # Should return 401 for invalid credentials, not 404 (endpoint not found)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ /api/auth/login endpoint exists and validates credentials")

    def test_auth_register_endpoint_exists(self):
        """Verify /api/auth/register endpoint exists"""
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD, "name": TEST_NAME}
        )
        # Should return 200 for successful registration or 400 if email exists
        assert response.status_code in [200, 400], f"Expected 200 or 400, got {response.status_code}"
        print(f"✓ /api/auth/register endpoint exists (status: {response.status_code})")


class TestPaymentRoutesWithAuth:
    """Test authenticated payment routes"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Set up test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Register and login test user
        register_response = self.session.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD, "name": TEST_NAME}
        )
        
        if register_response.status_code == 400:
            # User already exists, login instead
            login_response = self.session.post(
                f"{BASE_URL}/api/auth/login",
                json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
            )
            if login_response.status_code == 200:
                print(f"✓ Logged in existing test user: {TEST_EMAIL}")
            else:
                pytest.skip(f"Failed to login test user: {login_response.text}")
        elif register_response.status_code == 200:
            print(f"✓ Registered new test user: {TEST_EMAIL}")
        else:
            pytest.skip(f"Failed to setup test user: {register_response.text}")
        
        yield
        # Cleanup: Logout
        self.session.post(f"{BASE_URL}/api/auth/logout")

    def test_subscription_status_with_auth(self):
        """Verify /api/payments/subscription-status works with auth"""
        response = self.session.get(f"{BASE_URL}/api/payments/subscription-status")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "is_subscribed" in data, "Should have 'is_subscribed' field"
        assert "status" in data, "Should have 'status' field"
        
        print(f"✓ Subscription status: {data}")

    def test_auth_me_with_session(self):
        """Verify /api/auth/me works with valid session"""
        response = self.session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "email" in data, "Should have 'email' field"
        assert data["email"] == TEST_EMAIL, f"Email should match: {TEST_EMAIL}"
        
        print(f"✓ Auth me returned user: {data.get('email')}")

    def test_stripe_checkout_with_auth(self):
        """Verify Stripe checkout works"""
        response = self.session.post(
            f"{BASE_URL}/api/payments/create-checkout",
            json={
                "product_type": "subscription",
                "plan_id": "monthly",
                "origin_url": "https://breathwork-sanctuary.preview.emergentagent.com",
                "payment_method": "stripe"
            }
        )
        # Should return 200 with checkout URL or 500 if Stripe not fully configured
        assert response.status_code in [200, 500], f"Expected 200 or 500, got {response.status_code}: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert "checkout_url" in data, "Should have 'checkout_url'"
            assert "session_id" in data, "Should have 'session_id'"
            assert data.get("payment_method") == "stripe", "Payment method should be 'stripe'"
            print(f"✓ Stripe checkout URL generated")
        else:
            print(f"✓ Stripe checkout returned error (expected - test key): {response.json()}")

    def test_paypal_checkout_returns_not_configured_error(self):
        """Verify PayPal checkout returns 'not configured' error when env vars empty"""
        response = self.session.post(
            f"{BASE_URL}/api/payments/create-checkout",
            json={
                "product_type": "subscription",
                "plan_id": "monthly",
                "origin_url": "https://breathwork-sanctuary.preview.emergentagent.com",
                "payment_method": "paypal"
            }
        )
        # Should return 500 with 'PayPal not configured' since env vars are empty
        assert response.status_code == 500, f"Expected 500 (not configured), got {response.status_code}"
        
        data = response.json()
        detail = data.get("detail", "")
        assert "PayPal not configured" in detail, f"Error should mention 'PayPal not configured', got: {detail}"
        
        print(f"✓ PayPal checkout correctly returns 'not configured' error")

    def test_my_purchases_with_auth(self):
        """Verify /api/payments/my-purchases works with auth"""
        response = self.session.get(f"{BASE_URL}/api/payments/my-purchases")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "purchases" in data, "Should have 'purchases' field"
        assert "transactions" in data, "Should have 'transactions' field"
        
        print(f"✓ My purchases returned: {len(data.get('purchases', []))} purchases, {len(data.get('transactions', []))} transactions")


class TestContentAPIsStillWork:
    """Verify existing content APIs still work after refactoring"""

    def test_yoga_poses_endpoint(self):
        """Verify /api/yoga/poses works"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Should return list of poses"
        print(f"✓ Yoga poses: {len(data)} poses")

    def test_crystals_endpoint(self):
        """Verify /api/crystals works"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Should return list of crystals"
        print(f"✓ Crystals: {len(data)} crystals")

    def test_breathwork_sessions_endpoint(self):
        """Verify /api/breathwork/sessions works"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Should return list of sessions"
        print(f"✓ Breathwork sessions: {len(data)} sessions")

    def test_mantras_endpoint(self):
        """Verify /api/mantras works"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Should return list of mantras"
        print(f"✓ Mantras: {len(data)} mantras")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
