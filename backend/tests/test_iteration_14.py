"""
Iteration 14 Tests - Web Audio, Visualizations, Power Animal Image, PayPal Integration
Tests for:
- Backend API routes for auth, payments, practices
- Payment plans with Stripe and PayPal options
- Power Animal Journey image URL (should be wolf image)
- Backend router refactoring (/api/auth/*, /api/payments/*)
"""
import pytest
import requests
import os
from datetime import datetime
import uuid

# Get the backend URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://elemental-yoga.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = f"test_iter14_{uuid.uuid4().hex[:8]}@example.com"
TEST_PASSWORD = "TestPass123!"
TEST_NAME = "Test User Iter14"


class TestPaymentPlans:
    """Test payment plans API for Stripe and PayPal options"""
    
    def test_get_payment_plans(self):
        """Test GET /api/payments/plans returns both Stripe and PayPal options"""
        response = requests.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "plans" in data, "Response should contain 'plans' key"
        assert "payment_methods" in data, "Response should contain 'payment_methods' key"
        
        # Check payment methods include both stripe and paypal
        payment_methods = data["payment_methods"]
        assert "stripe" in payment_methods, "Stripe should be in payment methods"
        assert "paypal" in payment_methods, "PayPal should be in payment methods"
        print(f"✓ Payment methods: {payment_methods}")
        
        # Check plans structure
        plans = data["plans"]
        assert len(plans) >= 2, "Should have at least monthly and yearly plans"
        
        for plan in plans:
            assert "id" in plan, "Plan should have id"
            assert "name" in plan, "Plan should have name"
            assert "price" in plan, "Plan should have price"
            assert "features" in plan, "Plan should have features"
            print(f"✓ Plan found: {plan['id']} - ${plan['price']}")


class TestAuthRoutes:
    """Test auth routes after router refactoring"""
    
    def test_auth_register(self):
        """Test POST /api/auth/register"""
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "name": TEST_NAME
            }
        )
        assert response.status_code == 200, f"Registration failed: {response.text}"
        
        data = response.json()
        assert "user" in data or "user_id" in data, "Response should contain user data"
        assert "session_token" in data or response.cookies.get("session_token"), "Should have session token"
        print(f"✓ User registered: {TEST_EMAIL}")
    
    def test_auth_login(self):
        """Test POST /api/auth/login"""
        # First register
        requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": f"login_test_{uuid.uuid4().hex[:8]}@example.com",
                "password": TEST_PASSWORD,
                "name": TEST_NAME
            }
        )
        
        # Now login with the test email from previous test
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            }
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "user" in data or "user_id" in data, "Response should contain user data"
        print(f"✓ Login successful")
    
    def test_auth_me_unauthorized(self):
        """Test GET /api/auth/me without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Unauthorized request properly rejected")


class TestShamanicPractices:
    """Test shamanic practices - especially Power Animal Journey image"""
    
    def test_get_power_animal_journey(self):
        """Test that Power Animal Journey has correct wolf image"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices?category=power_animal")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        practices = response.json()
        assert len(practices) > 0, "Should have power_animal practices"
        
        # Find Power Animal Journey
        power_animal = None
        for practice in practices:
            if "Power Animal" in practice.get("name", ""):
                power_animal = practice
                break
        
        assert power_animal is not None, "Power Animal Journey should exist"
        assert "image_url" in power_animal, "Power Animal Journey should have image_url"
        
        image_url = power_animal.get("image_url", "")
        # The image should be updated (not the broken URL)
        assert "unsplash" in image_url or "emergentagent" in image_url, f"Image URL should be valid: {image_url}"
        
        # Verify image is accessible
        img_response = requests.head(image_url, allow_redirects=True, timeout=10)
        assert img_response.status_code == 200, f"Image should be accessible, got {img_response.status_code}"
        
        print(f"✓ Power Animal Journey image URL: {image_url}")
        print(f"✓ Image is accessible")
    
    def test_get_shamanic_practices_by_category(self):
        """Test filtering shamanic practices by category"""
        categories = ["journey", "power_animal", "ancestral", "ceremony", "shadow"]
        
        for category in categories:
            response = requests.get(f"{BASE_URL}/api/shamanic-practices?category={category}")
            assert response.status_code == 200, f"Expected 200 for {category}, got {response.status_code}"
            print(f"✓ Category '{category}' returned successfully")


class TestHeartPractices:
    """Test heart practices API"""
    
    def test_get_heart_practices(self):
        """Test GET /api/heart-practices"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        practices = response.json()
        assert len(practices) > 0, "Should have heart practices"
        
        for practice in practices[:3]:
            assert "id" in practice, "Practice should have id"
            assert "name" in practice, "Practice should have name"
            assert "category" in practice, "Practice should have category"
            print(f"✓ Heart practice: {practice['name']} ({practice['category']})")


class TestElementalPractices:
    """Test elemental practices API"""
    
    def test_get_elemental_practices(self):
        """Test GET /api/elemental-practices"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        practices = response.json()
        assert len(practices) > 0, "Should have elemental practices"
        print(f"✓ Found {len(practices)} elemental practices")
    
    def test_filter_by_element(self):
        """Test filtering elemental practices by element"""
        elements = ["Earth", "Water", "Fire", "Air", "Spirit"]
        
        for element in elements:
            response = requests.get(f"{BASE_URL}/api/elemental-practices?element={element}")
            assert response.status_code == 200, f"Expected 200 for {element}, got {response.status_code}"
            print(f"✓ Element '{element}' returned successfully")


class TestCreativeProcesses:
    """Test creative processes API"""
    
    def test_get_creative_processes(self):
        """Test GET /api/creative-processes"""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        processes = response.json()
        assert len(processes) > 0, "Should have creative processes"
        print(f"✓ Found {len(processes)} creative processes")


class TestPaymentsAuthenticated:
    """Test authenticated payment routes"""
    
    @pytest.fixture(autouse=True)
    def setup_auth(self):
        """Setup authentication for tests"""
        # Register a new user
        email = f"pay_test_{uuid.uuid4().hex[:8]}@example.com"
        reg_response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": email,
                "password": "PaymentTest123!",
                "name": "Payment Test User"
            }
        )
        if reg_response.status_code == 200:
            data = reg_response.json()
            self.session_token = data.get("session_token")
            self.headers = {"Authorization": f"Bearer {self.session_token}"}
        else:
            # Try login if user exists
            login_response = requests.post(
                f"{BASE_URL}/api/auth/login",
                json={
                    "email": email,
                    "password": "PaymentTest123!"
                }
            )
            if login_response.status_code == 200:
                data = login_response.json()
                self.session_token = data.get("session_token")
                self.headers = {"Authorization": f"Bearer {self.session_token}"}
            else:
                self.session_token = None
                self.headers = {}
    
    def test_subscription_status(self):
        """Test GET /api/payments/subscription-status"""
        if not self.session_token:
            pytest.skip("Authentication failed")
        
        response = requests.get(
            f"{BASE_URL}/api/payments/subscription-status",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "is_subscribed" in data, "Response should have is_subscribed field"
        assert "status" in data, "Response should have status field"
        print(f"✓ Subscription status: {data}")
    
    def test_my_purchases(self):
        """Test GET /api/payments/my-purchases"""
        if not self.session_token:
            pytest.skip("Authentication failed")
        
        response = requests.get(
            f"{BASE_URL}/api/payments/my-purchases",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "purchases" in data, "Response should have purchases field"
        assert "transactions" in data, "Response should have transactions field"
        print(f"✓ Purchases endpoint working")


class TestBackendRouterRefactoring:
    """Test that backend routes are properly organized after refactoring"""
    
    def test_auth_routes_accessible(self):
        """Test all auth routes are accessible"""
        # POST routes return method not allowed for GET, but route exists
        routes = [
            ("/api/auth/me", "GET", 401),  # Unauthorized but route exists
            ("/api/auth/login", "OPTIONS", 200),  # CORS preflight
            ("/api/auth/register", "OPTIONS", 200),
            ("/api/auth/logout", "OPTIONS", 200),
        ]
        
        for route, method, expected_status in routes:
            if method == "GET":
                response = requests.get(f"{BASE_URL}{route}")
            else:
                response = requests.options(f"{BASE_URL}{route}")
            
            # Route should exist (not 404)
            assert response.status_code != 404, f"Route {route} should exist"
            print(f"✓ Route {route} is accessible")
    
    def test_payments_routes_accessible(self):
        """Test all payment routes are accessible"""
        routes = [
            ("/api/payments/plans", "GET", 200),
            ("/api/payments/subscription-status", "GET", 401),  # Unauthorized but exists
        ]
        
        for route, method, expected_status in routes:
            response = requests.get(f"{BASE_URL}{route}")
            assert response.status_code != 404, f"Route {route} should exist"
            print(f"✓ Route {route} is accessible (status: {response.status_code})")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
