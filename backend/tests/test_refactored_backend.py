"""
Comprehensive Backend Tests for Refactored Routers
Tests all 9 routers after server.py modularization:
- auth, payments, birth_chart, content, oracle, numerology, user, admin, gifts
"""
import pytest
import requests
import os
import uuid
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://shamanic-soul-temple-3.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "testuser123@example.com"
TEST_PASSWORD = "test123456"


class TestHealthCheck:
    """Test health check endpoint."""
    
    def test_health_endpoint(self):
        """Health check should return healthy status."""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["app"] == "Shamanic Elements Temple Of The Soul"
        assert data["version"] == "2.0.0"
        print(f"✓ Health check passed: {data}")


class TestAuthRouter:
    """Test auth endpoints - /api/auth/*"""
    
    def test_login_success(self):
        """Test successful email/password login."""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        assert "session_token" in data
        assert data["user"]["email"] == TEST_EMAIL
        print(f"✓ Login successful: {data['user']['email']}")
        return data
    
    def test_login_invalid_credentials(self):
        """Test login with wrong password."""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials rejected correctly")
    
    def test_register_existing_email(self):
        """Test registration with already existing email."""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_EMAIL,
            "password": "test123456",
            "name": "Test User"
        })
        assert response.status_code == 400
        data = response.json()
        assert "already registered" in data.get("detail", "").lower()
        print("✓ Duplicate email registration rejected correctly")


class TestContentRouter:
    """Test content endpoints - yoga, breathwork, crystals, mantras, etc."""
    
    def test_yoga_poses(self):
        """Get yoga poses list."""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Yoga poses: {len(data)} poses returned")
    
    def test_yoga_poses_filter_by_element(self):
        """Get yoga poses filtered by element."""
        response = requests.get(f"{BASE_URL}/api/yoga/poses?element=Fire")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Yoga poses (Fire element): {len(data)} poses")
    
    def test_breathwork_sessions(self):
        """Get breathwork sessions."""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Breathwork sessions: {len(data)} sessions returned")
    
    def test_crystals(self):
        """Get crystals list."""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Crystals: {len(data)} crystals returned")
    
    def test_mantras(self):
        """Get mantras list."""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Mantras: {len(data)} mantras returned")
    
    def test_mudras(self):
        """Get mudras list."""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Mudras: {len(data)} mudras returned")
    
    def test_meditations(self):
        """Get guided meditations."""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Meditations: {len(data)} meditations returned")
    
    def test_mindfulness(self):
        """Get mindfulness practices."""
        response = requests.get(f"{BASE_URL}/api/mindfulness")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Mindfulness practices: {len(data)} practices returned")
    
    def test_grounding(self):
        """Get grounding exercises."""
        response = requests.get(f"{BASE_URL}/api/grounding")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Grounding exercises: {len(data)} exercises returned")
    
    def test_somatic(self):
        """Get somatic practices."""
        response = requests.get(f"{BASE_URL}/api/somatic")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Somatic practices: {len(data)} practices returned")
    
    def test_preset_rituals(self):
        """Get preset rituals."""
        response = requests.get(f"{BASE_URL}/api/preset-rituals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Preset rituals: {len(data)} rituals returned")
    
    def test_heart_practices(self):
        """Get heart practices."""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Heart practices: {len(data)} practices returned")
    
    def test_shamanic_practices(self):
        """Get shamanic practices."""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Shamanic practices: {len(data)} practices returned")
    
    def test_elemental_practices(self):
        """Get elemental practices."""
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Elemental practices: {len(data)} practices returned")
    
    def test_creative_processes(self):
        """Get creative processes."""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Creative processes: {len(data)} processes returned")
    
    def test_earth_altars(self):
        """Get earth altars."""
        response = requests.get(f"{BASE_URL}/api/earth-altars")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Earth altars: {len(data)} altars returned")


class TestNumerologyRouter:
    """Test numerology endpoints."""
    
    def test_numerology_calculate(self):
        """Test numerology calculation."""
        response = requests.post(f"{BASE_URL}/api/numerology/calculate", json={
            "birth_date": "1985-07-15",
            "full_name": "John Michael Smith"
        })
        assert response.status_code == 200
        data = response.json()
        assert "life_path_number" in data
        assert "life_path_info" in data
        assert data["birth_date"] == "1985-07-15"
        print(f"✓ Numerology calculate: Life path {data['life_path_number']}")
    
    def test_numerology_life_paths(self):
        """Get all life path meanings."""
        response = requests.get(f"{BASE_URL}/api/numerology/life-paths")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert "1" in data or 1 in data
        print(f"✓ Life paths: {len(data)} paths returned")


class TestBirthChartRouter:
    """Test birth chart endpoints."""
    
    def test_zodiac_signs(self):
        """Get all zodiac signs."""
        response = requests.get(f"{BASE_URL}/api/birth-chart/zodiac-signs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert "Aries" in data
        assert "Pisces" in data
        print(f"✓ Zodiac signs: {len(data)} signs returned")
    
    def test_planet_meanings(self):
        """Get planet meanings."""
        response = requests.get(f"{BASE_URL}/api/birth-chart/planet-meanings")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert "Sun" in data
        assert "Moon" in data
        print(f"✓ Planet meanings: {len(data)} planets returned")
    
    def test_house_meanings(self):
        """Get house meanings."""
        response = requests.get(f"{BASE_URL}/api/birth-chart/house-meanings")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert 1 in data or "1" in data
        print(f"✓ House meanings: {len(data)} houses returned")
    
    def test_birth_chart_calculate(self):
        """Test birth chart calculation."""
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json={
            "birth_date": "1985-07-15",
            "birth_time": "14:30",
            "birth_city": "New York",
            "birth_country": "USA"
        })
        assert response.status_code == 200
        data = response.json()
        assert "sun_sign" in data
        assert "moon_sign" in data
        assert "rising_sign" in data
        assert "planets" in data
        assert "houses" in data
        print(f"✓ Birth chart: Sun in {data['sun_sign']}, Moon in {data['moon_sign']}, Rising {data['rising_sign']}")


class TestOracleRouter:
    """Test oracle endpoints."""
    
    def test_oracle_cards(self):
        """Get oracle cards."""
        response = requests.get(f"{BASE_URL}/api/oracle/cards")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ Oracle cards: {len(data)} cards returned")
    
    def test_oracle_cards_filter_by_element(self):
        """Get oracle cards filtered by element."""
        response = requests.get(f"{BASE_URL}/api/oracle/cards?element=Fire")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Oracle cards (Fire): {len(data)} cards returned")


class TestPaymentsRouter:
    """Test payments endpoints."""
    
    def test_subscription_plans(self):
        """Get subscription plans."""
        response = requests.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200
        data = response.json()
        assert "plans" in data
        assert len(data["plans"]) >= 2  # Monthly and yearly
        assert "payment_methods" in data
        print(f"✓ Subscription plans: {len(data['plans'])} plans returned")
        
        # Check plan structure
        for plan in data["plans"]:
            assert "id" in plan
            assert "price" in plan
            assert "features" in plan
        print(f"✓ Plan structure validated")


class TestGiftsRouter:
    """Test gifts endpoints."""
    
    def test_create_gift_pending(self):
        """Test creating a gift (returns pending status)."""
        response = requests.post(f"{BASE_URL}/api/gifts/create", json={
            "recipient_email": "recipient@test.com",
            "recipient_name": "Test Recipient",
            "gift_type": "subscription",
            "plan_id": "monthly",
            "message": "Test gift message",
            "sender_name": "Test Sender"
        })
        assert response.status_code == 200
        data = response.json()
        assert "gift_code" in data
        assert data["gift"]["status"] == "pending"
        print(f"✓ Gift created: {data['gift_code']}")
        return data["gift_code"]
    
    def test_get_gift_not_found(self):
        """Test getting non-existent gift."""
        response = requests.get(f"{BASE_URL}/api/gifts/INVALID-CODE")
        assert response.status_code == 404
        print("✓ Non-existent gift returns 404")


class TestAdminPublicEndpoints:
    """Test admin public endpoints - retreats, books, live sessions."""
    
    def test_get_retreats(self):
        """Get all retreats."""
        response = requests.get(f"{BASE_URL}/api/admin/retreats")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Retreats: {len(data)} retreats returned")
    
    def test_get_books(self):
        """Get all books."""
        response = requests.get(f"{BASE_URL}/api/admin/books")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Books: {len(data)} books returned")
    
    def test_get_live_sessions(self):
        """Get live sessions."""
        response = requests.get(f"{BASE_URL}/api/admin/live-sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Live sessions: {len(data)} sessions returned")
    
    def test_get_custom_oracle_cards(self):
        """Get custom oracle cards."""
        response = requests.get(f"{BASE_URL}/api/admin/custom-oracle-cards")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Custom oracle cards: {len(data)} cards returned")


class TestAstrologyEndpoints:
    """Test 13-month astrology endpoints from numerology router."""
    
    def test_astrology_months(self):
        """Get 13-month astrology calendar."""
        response = requests.get(f"{BASE_URL}/api/astrology/months")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Astrology months: {len(data)} months returned")
    
    def test_astrology_current(self):
        """Get current lunar month."""
        response = requests.get(f"{BASE_URL}/api/astrology/current")
        assert response.status_code == 200
        # May return None if no data seeded
        print("✓ Current astrology month endpoint accessible")


class TestAuthenticatedEndpoints:
    """Test endpoints that require authentication."""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session token."""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            self.session_token = response.json().get("session_token")
            self.user_id = response.json().get("user", {}).get("user_id")
            self.cookies = {"session_token": self.session_token}
        else:
            pytest.skip("Login failed, skipping authenticated tests")
    
    def test_get_favorites(self):
        """Get user favorites."""
        response = requests.get(
            f"{BASE_URL}/api/favorites",
            cookies=self.cookies
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Favorites: {len(data)} favorites returned")
    
    def test_get_subscription_status(self):
        """Get subscription status."""
        response = requests.get(
            f"{BASE_URL}/api/payments/subscription-status",
            cookies=self.cookies
        )
        assert response.status_code == 200
        data = response.json()
        assert "is_subscribed" in data
        assert "status" in data
        print(f"✓ Subscription status: {data['status']}")
    
    def test_get_my_purchases(self):
        """Get user purchases."""
        response = requests.get(
            f"{BASE_URL}/api/payments/my-purchases",
            cookies=self.cookies
        )
        assert response.status_code == 200
        data = response.json()
        assert "purchases" in data
        assert "transactions" in data
        print(f"✓ Purchases retrieved: {len(data['purchases'])} purchases")
    
    def test_get_rituals(self):
        """Get user rituals."""
        response = requests.get(
            f"{BASE_URL}/api/rituals",
            cookies=self.cookies
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Rituals: {len(data)} rituals returned")
    
    def test_get_practice_history(self):
        """Get practice history."""
        response = requests.get(
            f"{BASE_URL}/api/practice-history",
            cookies=self.cookies
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Practice history: {len(data)} entries returned")
    
    def test_get_practice_stats(self):
        """Get practice statistics."""
        response = requests.get(
            f"{BASE_URL}/api/practice-history/stats",
            cookies=self.cookies
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_sessions" in data
        assert "total_minutes" in data
        print(f"✓ Practice stats: {data['total_sessions']} sessions, {data['total_minutes']} minutes")
    
    def test_get_journal(self):
        """Get journal entries."""
        response = requests.get(
            f"{BASE_URL}/api/journal",
            cookies=self.cookies
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Journal entries: {len(data)} entries returned")
    
    def test_get_achievements(self):
        """Get user achievements."""
        response = requests.get(
            f"{BASE_URL}/api/achievements",
            cookies=self.cookies
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Achievements: {len(data)} achievements returned")
    
    def test_get_reminder_settings(self):
        """Get reminder settings."""
        response = requests.get(
            f"{BASE_URL}/api/settings/reminders",
            cookies=self.cookies
        )
        assert response.status_code == 200
        data = response.json()
        assert "enabled" in data
        print(f"✓ Reminder settings: enabled={data['enabled']}")
    
    def test_oracle_reading_requires_auth(self):
        """Oracle reading creation requires auth."""
        response = requests.post(
            f"{BASE_URL}/api/oracle/reading",
            json={"question": "Test question", "spread_type": "single"},
            cookies=self.cookies
        )
        # Should work with auth
        assert response.status_code == 200
        data = response.json()
        assert "cards" in data
        assert "interpretation" in data
        print(f"✓ Oracle reading created with {len(data['cards'])} cards")
    
    def test_oracle_readings_history(self):
        """Get oracle reading history."""
        response = requests.get(
            f"{BASE_URL}/api/oracle/readings",
            cookies=self.cookies
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Oracle readings history: {len(data)} readings")
    
    def test_daily_guidance(self):
        """Get daily dashboard guidance."""
        response = requests.get(
            f"{BASE_URL}/api/dashboard/daily",
            cookies=self.cookies
        )
        assert response.status_code == 200
        data = response.json()
        assert "greeting" in data
        print(f"✓ Daily guidance: {data.get('greeting', 'Retrieved')}")


# Run summary
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
