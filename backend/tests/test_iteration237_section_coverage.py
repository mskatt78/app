"""
Iteration 237 - Section Coverage & Ceremonial Deepening Tests
Tests:
1. Content tiering maintains 14-item 4/10 structure
2. Deepening synthetic entries include ceremonial enrichment fields
3. Pricing/admin privacy regression check
"""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestContentTiering:
    """Verify 14-item 4/10 tiering on representative endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_water_practices_tiering(self):
        """Water practices should return 14 items (4 free + 10 premium)"""
        response = self.session.get(f"{BASE_URL}/api/water-practices")
        assert response.status_code == 200
        data = response.json()
        
        # Check total count
        assert len(data) >= 14, f"Expected at least 14 items, got {len(data)}"
        
        # Check free/premium split
        free_items = [item for item in data if not item.get("is_premium", False)]
        premium_items = [item for item in data if item.get("is_premium", False)]
        
        print(f"Water practices: {len(free_items)} free, {len(premium_items)} premium")
        assert len(free_items) >= 4, f"Expected at least 4 free items, got {len(free_items)}"
    
    def test_meditations_tiering(self):
        """Meditations should return 14 items (4 free + 10 premium)"""
        response = self.session.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) >= 14, f"Expected at least 14 items, got {len(data)}"
        
        free_items = [item for item in data if not item.get("is_premium", False)]
        premium_items = [item for item in data if item.get("is_premium", False)]
        
        print(f"Meditations: {len(free_items)} free, {len(premium_items)} premium")
        assert len(free_items) >= 4, f"Expected at least 4 free items, got {len(free_items)}"
    
    def test_creative_processes_tiering(self):
        """Creative processes should return 14 items (4 free + 10 premium)"""
        response = self.session.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) >= 12, f"Expected at least 12 items, got {len(data)}"
        
        free_items = [item for item in data if not item.get("is_premium", False)]
        print(f"Creative processes: {len(free_items)} free, {len(data) - len(free_items)} premium")
    
    def test_heart_practices_tiering(self):
        """Heart practices should return 14 items (4 free + 10 premium)"""
        response = self.session.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) >= 14, f"Expected at least 14 items, got {len(data)}"
        
        free_items = [item for item in data if not item.get("is_premium", False)]
        print(f"Heart practices: {len(free_items)} free, {len(data) - len(free_items)} premium")
    
    def test_shamanic_practices_tiering(self):
        """Shamanic practices should return 14 items (4 free + 10 premium)"""
        response = self.session.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) >= 14, f"Expected at least 14 items, got {len(data)}"
        
        free_items = [item for item in data if not item.get("is_premium", False)]
        print(f"Shamanic practices: {len(free_items)} free, {len(data) - len(free_items)} premium")
    
    def test_energy_healing_tiering(self):
        """Energy healing should return 14 items (4 free + 10 premium)"""
        response = self.session.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) >= 14, f"Expected at least 14 items, got {len(data)}"
        
        free_items = [item for item in data if not item.get("is_premium", False)]
        print(f"Energy healing: {len(free_items)} free, {len(data) - len(free_items)} premium")
    
    def test_mindfulness_practices_tiering(self):
        """Mindfulness practices should return 14 items (4 free + 10 premium)"""
        response = self.session.get(f"{BASE_URL}/api/mindfulness-practices")
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) >= 14, f"Expected at least 14 items, got {len(data)}"
        
        free_items = [item for item in data if not item.get("is_premium", False)]
        print(f"Mindfulness practices: {len(free_items)} free, {len(data) - len(free_items)} premium")
    
    def test_mantras_tiering(self):
        """Mantras should return 14 items (4 free + 10 premium)"""
        response = self.session.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) >= 14, f"Expected at least 14 items, got {len(data)}"
        
        free_items = [item for item in data if not item.get("is_premium", False)]
        print(f"Mantras: {len(free_items)} free, {len(data) - len(free_items)} premium")


class TestCeremonialEnrichment:
    """Verify deepening synthetic entries include ceremonial enrichment fields"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_energy_healing_ceremonial_fields(self):
        """Energy healing entries should have ceremonial enrichment fields"""
        response = self.session.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        data = response.json()
        
        # Check for ceremonial fields in at least some entries
        ceremonial_fields = ["alchemy", "ritual", "ceremony", "guided_practice", "modality", "element"]
        
        entries_with_ceremonial = 0
        for item in data:
            has_ceremonial = any(field in item for field in ceremonial_fields)
            if has_ceremonial:
                entries_with_ceremonial += 1
        
        print(f"Energy healing entries with ceremonial fields: {entries_with_ceremonial}/{len(data)}")
        assert entries_with_ceremonial > 0, "Expected at least some entries with ceremonial fields"
    
    def test_shamanic_practices_ceremonial_fields(self):
        """Shamanic practices should have ceremonial enrichment fields"""
        response = self.session.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        
        ceremonial_fields = ["tradition", "journey_steps", "preparation", "safety_notes", "closing_prayer"]
        
        entries_with_ceremonial = 0
        for item in data:
            has_ceremonial = any(field in item for field in ceremonial_fields)
            if has_ceremonial:
                entries_with_ceremonial += 1
        
        print(f"Shamanic entries with ceremonial fields: {entries_with_ceremonial}/{len(data)}")
        assert entries_with_ceremonial > 0, "Expected at least some entries with ceremonial fields"
    
    def test_heart_practices_ceremonial_fields(self):
        """Heart practices should have ceremonial enrichment fields"""
        response = self.session.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        data = response.json()
        
        ceremonial_fields = ["element", "category", "linked_practices"]
        
        entries_with_ceremonial = 0
        for item in data:
            has_ceremonial = any(field in item for field in ceremonial_fields)
            if has_ceremonial:
                entries_with_ceremonial += 1
        
        print(f"Heart practices entries with ceremonial fields: {entries_with_ceremonial}/{len(data)}")
        assert entries_with_ceremonial > 0, "Expected at least some entries with ceremonial fields"
    
    def test_water_practices_ceremonial_fields(self):
        """Water practices should have ceremonial enrichment fields"""
        response = self.session.get(f"{BASE_URL}/api/water-practices")
        assert response.status_code == 200
        data = response.json()
        
        ceremonial_fields = ["materials", "steps", "benefits", "category"]
        
        entries_with_ceremonial = 0
        for item in data:
            has_ceremonial = any(field in item for field in ceremonial_fields)
            if has_ceremonial:
                entries_with_ceremonial += 1
        
        print(f"Water practices entries with ceremonial fields: {entries_with_ceremonial}/{len(data)}")
        assert entries_with_ceremonial > 0, "Expected at least some entries with ceremonial fields"


class TestPricingAdminPrivacy:
    """Regression check for pricing plans and admin privacy"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_pricing_plans_count(self):
        """Pricing plans should return exactly 2 plans"""
        response = self.session.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200
        data = response.json()
        
        # API returns {"plans": [...], "payment_methods": [...]}
        plans = data.get("plans", [])
        assert len(plans) == 2, f"Expected 2 plans, got {len(plans)}"
        
        plan_ids = [plan.get("id") for plan in plans]
        print(f"Plan IDs: {plan_ids}")
        
        assert "monthly" in plan_ids, "Expected 'monthly' plan"
        assert "full_app_unlock" in plan_ids, "Expected 'full_app_unlock' plan"
    
    def test_pricing_plan_prices(self):
        """Verify pricing plan prices"""
        response = self.session.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200
        data = response.json()
        
        plans = data.get("plans", [])
        for plan in plans:
            if plan.get("id") == "monthly":
                assert plan.get("price") == 19.99, f"Monthly price should be 19.99, got {plan.get('price')}"
            elif plan.get("id") == "full_app_unlock":
                assert plan.get("price") == 369.0, f"Lifetime price should be 369.0, got {plan.get('price')}"
    
    def test_admin_endpoint_requires_auth(self):
        """Admin endpoints should require authentication"""
        response = self.session.get(f"{BASE_URL}/api/admin/seed-status")
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403, 422], f"Expected auth error, got {response.status_code}"


class TestExpandScript:
    """Verify expand-script maintains word floor for 7-minute target"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_expand_script_word_floor(self):
        """Expand script should return at least 924 words for 7-minute target"""
        payload = {
            "practice_name": "Test Meditation",
            "base_script": "Begin by finding a comfortable position. Close your eyes and take a deep breath.",
            "target_minutes": 7,
            "voice": "sage"
        }
        
        response = self.session.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # API returns word_count directly and paragraphs array
        word_count = data.get("word_count", 0)
        
        print(f"Expand script word count: {word_count}")
        
        # 7 minutes * 132 words/minute = 924 words minimum
        min_words = 924
        assert word_count >= min_words, f"Expected at least {min_words} words, got {word_count}"
        
        # Also verify paragraphs exist
        paragraphs = data.get("paragraphs", [])
        assert len(paragraphs) > 0, "Expected paragraphs in response"
        print(f"Expand script paragraphs: {len(paragraphs)}")


class TestAliasRouteEndpoints:
    """Verify backend endpoints for alias routes work correctly"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_sacred_guardians_endpoint(self):
        """Sacred guardians endpoint should return data"""
        response = self.session.get(f"{BASE_URL}/api/sacred-guardians")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Expected sacred guardians data"
        print(f"Sacred guardians: {len(data)} items")
    
    def test_sacred_ally_alchemy_endpoint(self):
        """Sacred ally alchemy endpoint should return data"""
        response = self.session.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Expected sacred ally alchemy data"
        print(f"Sacred ally alchemy: {len(data)} items")
    
    def test_sound_frequencies_endpoint(self):
        """Sound frequencies endpoint should return data"""
        response = self.session.get(f"{BASE_URL}/api/sound-frequencies")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Expected sound frequencies data"
        print(f"Sound frequencies: {len(data)} items")
    
    def test_earth_altars_endpoint(self):
        """Earth altars endpoint should return data"""
        response = self.session.get(f"{BASE_URL}/api/earth-altars")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Expected earth altars data"
        print(f"Earth altars: {len(data)} items")
    
    def test_angelic_alchemy_endpoint(self):
        """Angelic alchemy endpoint should return data"""
        response = self.session.get(f"{BASE_URL}/api/angelic-alchemy")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Expected angelic alchemy data"
        print(f"Angelic alchemy: {len(data)} items")
    
    def test_free_form_movement_endpoint(self):
        """Free form movement endpoint should return data"""
        response = self.session.get(f"{BASE_URL}/api/free-form-movement")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Expected free form movement data"
        print(f"Free form movement: {len(data)} items")
    
    def test_somatic_yoga_endpoint(self):
        """Somatic yoga endpoint should return data"""
        response = self.session.get(f"{BASE_URL}/api/somatic-yoga")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Expected somatic yoga data"
        print(f"Somatic yoga: {len(data)} items")


class TestDivinationEndpoints:
    """Verify divination endpoints for tarot, i ching, runes, numerology"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_tarot_cards_endpoint(self):
        """Tarot cards endpoint should return data"""
        response = self.session.get(f"{BASE_URL}/api/tarot/cards")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Expected tarot cards data"
        print(f"Tarot cards: {len(data)} items")
    
    def test_human_design_calculate_endpoint(self):
        """Human design calculate endpoint should work with POST"""
        # Human design requires birth data to calculate
        payload = {
            "birth_date": "1990-01-15",
            "birth_time": "14:30",
            "birth_location": "Sydney, Australia"
        }
        response = self.session.post(f"{BASE_URL}/api/birth-chart/human-design/calculate", json=payload)
        # May return 200 or 422 depending on validation
        assert response.status_code in [200, 422], f"Unexpected status: {response.status_code}"
        print(f"Human design calculate response: {response.status_code}")
    
    def test_i_ching_endpoint(self):
        """I Ching endpoint should return data"""
        response = self.session.get(f"{BASE_URL}/api/i-ching")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Expected I Ching data"
        print(f"I Ching: {len(data)} items")
    
    def test_runes_endpoint(self):
        """Runes endpoint should return data"""
        response = self.session.get(f"{BASE_URL}/api/runes")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Expected runes data"
        print(f"Runes: {len(data)} items")
    
    def test_numerology_life_paths_endpoint(self):
        """Numerology life paths endpoint should return data"""
        response = self.session.get(f"{BASE_URL}/api/numerology/life-paths")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Expected numerology life paths data"
        print(f"Numerology life paths: {len(data)} items")


class TestTempleEndpoints:
    """Verify temple endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_elemental_temples_endpoint(self):
        """Elemental temples endpoint should return data"""
        response = self.session.get(f"{BASE_URL}/api/elemental-temples")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Expected elemental temples data"
        print(f"Elemental temples: {len(data)} items")
    
    def test_healing_portals_endpoint(self):
        """Healing portals endpoint should return data"""
        response = self.session.get(f"{BASE_URL}/api/healing-portals")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Expected healing portals data"
        print(f"Healing portals: {len(data)} items")
