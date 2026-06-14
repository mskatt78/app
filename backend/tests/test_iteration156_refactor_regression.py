"""
Iteration 156 - Backend Refactor Regression Tests
Tests for admin, user, payments, and gifts routers after code quality refactor.
Focus: admin list endpoint, yoga verification filtering, audio_files path,
daily guidance auth, Stripe checkout, PayPal gift order flow.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")


class TestHealthAndBasicEndpoints:
    """Basic health and public endpoint tests"""

    def test_health_endpoint(self):
        """Health endpoint should return 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("PASS: Health endpoint returns 200")

    def test_yoga_poses_endpoint(self):
        """Yoga poses endpoint should return poses"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"PASS: Yoga poses endpoint returns {len(data)} poses")

    def test_mantras_endpoint(self):
        """Mantras endpoint should return mantras"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"PASS: Mantras endpoint returns {len(data)} mantras")

    def test_chakra_cleansing_endpoint(self):
        """Chakra cleansing endpoint should return practices"""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Chakra cleansing endpoint returns {len(data)} practices")


class TestAdminRouterRefactor:
    """Tests for admin.py router refactor - list endpoint, yoga verification, audio_files"""

    @pytest.fixture(scope="class")
    def admin_session(self):
        """Get admin session via password login"""
        if not ADMIN_PASSWORD:
            pytest.skip("ADMIN_PASSWORD not set in environment")
        
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip(f"Admin login failed: {response.status_code}")
        return session

    def test_admin_collections_list(self, admin_session):
        """Admin collections endpoint should return collection metadata"""
        response = admin_session.get(f"{BASE_URL}/api/admin/collections")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Check for expected collections
        collection_ids = [c.get("id") for c in data]
        assert "yoga_poses" in collection_ids
        assert "mantras" in collection_ids
        assert "audio_files" in collection_ids
        print(f"PASS: Admin collections returns {len(data)} collections")

    def test_admin_yoga_poses_list(self, admin_session):
        """Admin yoga poses list should work with verification filtering"""
        response = admin_session.get(f"{BASE_URL}/api/admin/yoga_poses/items")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "verification_summary" in data
        
        summary = data["verification_summary"]
        assert "verified" in summary
        assert "pending" in summary
        print(f"PASS: Admin yoga poses list returns {data['total']} items, {summary['verified']} verified, {summary['pending']} pending")

    def test_admin_yoga_verification_filter_pending(self, admin_session):
        """Admin yoga poses should filter by verification_status=pending"""
        response = admin_session.get(
            f"{BASE_URL}/api/admin/yoga_poses/items",
            params={"verification_status": "pending"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        
        # All items should be pending verification
        for item in data["items"]:
            assert item.get("image_source") == "pending_verification"
        print(f"PASS: Yoga verification filter (pending) returns {len(data['items'])} items")

    def test_admin_yoga_verification_filter_verified(self, admin_session):
        """Admin yoga poses should filter by verification_status=verified"""
        response = admin_session.get(
            f"{BASE_URL}/api/admin/yoga_poses/items",
            params={"verification_status": "verified"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        
        # All items should be verified
        for item in data["items"]:
            assert item.get("image_source") == "wikimedia_commons_verified"
        print(f"PASS: Yoga verification filter (verified) returns {len(data['items'])} items")

    def test_admin_yoga_priority_filter(self, admin_session):
        """Admin yoga poses should filter by verification_priority"""
        response = admin_session.get(
            f"{BASE_URL}/api/admin/yoga_poses/items",
            params={"verification_status": "pending", "verification_priority": "high"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        
        # All items should have high priority
        for item in data["items"]:
            priority = item.get("image_validation", {}).get("priority", "")
            assert priority == "high"
        print(f"PASS: Yoga priority filter (high) returns {len(data['items'])} items")

    def test_admin_audio_files_list(self, admin_session):
        """Admin audio_files list endpoint should work"""
        response = admin_session.get(f"{BASE_URL}/api/admin/audio_files/items")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        print(f"PASS: Admin audio_files list returns {data['total']} items")

    def test_admin_mantras_list(self, admin_session):
        """Admin mantras list should work for normal collections"""
        response = admin_session.get(f"{BASE_URL}/api/admin/mantras/items")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert data["total"] > 0
        print(f"PASS: Admin mantras list returns {data['total']} items")

    def test_admin_meditations_list(self, admin_session):
        """Admin meditations list should work for normal collections"""
        response = admin_session.get(f"{BASE_URL}/api/admin/meditations/items")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        print(f"PASS: Admin meditations list returns {data['total']} items")


class TestUserRouterRefactor:
    """Tests for user.py router refactor - daily guidance endpoint"""

    def test_daily_guidance_requires_auth(self):
        """Daily guidance endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/dashboard/daily")
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403]
        print("PASS: Daily guidance requires authentication")

    def test_favorites_requires_auth(self):
        """Favorites endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/favorites")
        assert response.status_code in [401, 403]
        print("PASS: Favorites requires authentication")

    def test_practice_history_requires_auth(self):
        """Practice history endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/practice-history")
        assert response.status_code in [401, 403]
        print("PASS: Practice history requires authentication")

    def test_achievements_requires_auth(self):
        """Achievements endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/achievements")
        assert response.status_code in [401, 403]
        print("PASS: Achievements requires authentication")


class TestPaymentsRouterRefactor:
    """Tests for payments.py router refactor - Stripe checkout, subscription status"""

    def test_subscription_plans_public(self):
        """Subscription plans endpoint should be public"""
        response = requests.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200
        data = response.json()
        assert "plans" in data
        assert len(data["plans"]) >= 2  # monthly and yearly
        
        plan_ids = [p["id"] for p in data["plans"]]
        assert "monthly" in plan_ids
        assert "yearly" in plan_ids
        print(f"PASS: Subscription plans returns {len(data['plans'])} plans")

    def test_bundles_public(self):
        """Course bundles endpoint should be public"""
        response = requests.get(f"{BASE_URL}/api/payments/bundles")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Course bundles returns {len(data)} bundles")

    def test_create_checkout_requires_auth(self):
        """Create checkout endpoint should require authentication"""
        response = requests.post(
            f"{BASE_URL}/api/payments/create-checkout",
            json={
                "product_type": "subscription",
                "plan_id": "monthly",
                "origin_url": "https://example.com",
                "payment_method": "stripe"
            }
        )
        assert response.status_code in [401, 403]
        print("PASS: Create checkout requires authentication")

    def test_subscription_status_requires_auth(self):
        """Subscription status endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/payments/subscription-status")
        assert response.status_code in [401, 403]
        print("PASS: Subscription status requires authentication")

    def test_my_purchases_requires_auth(self):
        """My purchases endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/payments/my-purchases")
        assert response.status_code in [401, 403]
        print("PASS: My purchases requires authentication")


class TestGiftsRouterRefactor:
    """Tests for gifts.py router refactor - gift creation, payment flow"""

    def test_create_gift_public(self):
        """Create gift endpoint should be public (payment comes later)"""
        response = requests.post(
            f"{BASE_URL}/api/gifts/create",
            json={
                "recipient_email": "test@example.com",
                "recipient_name": "Test Recipient",
                "gift_type": "subscription",
                "plan_id": "monthly",
                "message": "Test gift message",
                "sender_name": "Test Sender"
            }
        )
        # Should succeed and return gift code
        assert response.status_code == 200
        data = response.json()
        assert "gift_code" in data
        assert data["gift_code"].startswith("GIFT-")
        print(f"PASS: Create gift returns gift code: {data['gift_code']}")

    def test_get_gift_by_code(self):
        """Get gift by code should work for valid codes"""
        # First create a gift
        create_response = requests.post(
            f"{BASE_URL}/api/gifts/create",
            json={
                "recipient_email": "test2@example.com",
                "recipient_name": "Test Recipient 2",
                "gift_type": "subscription",
                "plan_id": "yearly",
                "message": "Another test gift",
                "sender_name": "Test Sender 2"
            }
        )
        assert create_response.status_code == 200
        gift_code = create_response.json()["gift_code"]
        
        # Then retrieve it
        get_response = requests.get(f"{BASE_URL}/api/gifts/{gift_code}")
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["gift_code"] == gift_code
        assert data["recipient_email"] == "test2@example.com"
        assert data["status"] == "pending"
        print("PASS: Get gift by code returns correct data")

    def test_get_gift_invalid_code(self):
        """Get gift with invalid code should return 404"""
        response = requests.get(f"{BASE_URL}/api/gifts/GIFT-INVALID123")
        assert response.status_code == 404
        print("PASS: Get gift with invalid code returns 404")

    def test_pay_for_gift_requires_auth(self):
        """Pay for gift endpoint should require authentication"""
        response = requests.post(
            f"{BASE_URL}/api/gifts/pay",
            json={
                "gift_code": "GIFT-TEST123",
                "origin_url": "https://example.com",
                "payment_method": "stripe"
            }
        )
        assert response.status_code in [401, 403]
        print("PASS: Pay for gift requires authentication")

    def test_redeem_gift_requires_auth(self):
        """Redeem gift endpoint should require authentication"""
        response = requests.post(
            f"{BASE_URL}/api/gifts/redeem",
            json={"gift_code": "GIFT-TEST123"}
        )
        assert response.status_code in [401, 403]
        print("PASS: Redeem gift requires authentication")


class TestContentEndpointsStability:
    """Tests for content endpoints stability after refactor"""

    def test_crystals_endpoint(self):
        """Crystals endpoint should return data"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Crystals endpoint returns {len(data)} items")

    def test_breathwork_endpoint(self):
        """Breathwork endpoint should return data"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Breathwork endpoint returns {len(data)} items")

    def test_meditations_endpoint(self):
        """Meditations endpoint should return data"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Meditations endpoint returns {len(data)} items")

    def test_shamanic_practices_endpoint(self):
        """Shamanic practices endpoint should return data"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Shamanic practices endpoint returns {len(data)} items")

    def test_sound_frequencies_endpoint(self):
        """Sound frequencies endpoint should return data"""
        response = requests.get(f"{BASE_URL}/api/sound-frequencies")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Sound frequencies endpoint returns {len(data)} items")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
