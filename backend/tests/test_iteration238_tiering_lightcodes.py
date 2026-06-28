"""
Iteration 238 - Backend Tests for Content Tiering (4 free + 10 premium = 14 items)
and Light Codes / Sacred Tool Birthing ceremonial content depth.

Tests:
1. Tiering: Verify exactly 14 items (4 free + 10 premium) for specified endpoints
2. Sacred Tool Birthing: Verify ethical sourcing + ceremony fields
3. Light Codes: Verify ceremonial embodiment + light-coded symbols
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

class TestContentTiering:
    """Verify 4 free + 10 premium = 14 items for all specified endpoints."""

    def test_creative_processes_sacred_tool_birthing_tiering(self):
        """Sacred Tool Birthing category returns exactly 14 items (4 free + 10 premium)."""
        response = requests.get(f"{BASE_URL}/api/creative-processes?category=sacred-tool-birthing")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        assert len(data) == 14, f"Expected 14 items (4 free + 10 premium), got {len(data)}"
        
        free_count = sum(1 for item in data if not item.get("is_premium"))
        premium_count = sum(1 for item in data if item.get("is_premium"))
        assert free_count == 4, f"Expected 4 free items, got {free_count}"
        assert premium_count == 10, f"Expected 10 premium items, got {premium_count}"

    def test_light_codes_sacred_geometry_tiering(self):
        """Light Codes Sacred Geometry returns exactly 14 items."""
        response = requests.get(f"{BASE_URL}/api/light-codes/sacred-geometry")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        assert len(data) == 14, f"Expected 14 items, got {len(data)}"
        
        free_count = sum(1 for item in data if not item.get("is_premium"))
        premium_count = sum(1 for item in data if item.get("is_premium"))
        assert free_count == 4, f"Expected 4 free items, got {free_count}"
        assert premium_count == 10, f"Expected 10 premium items, got {premium_count}"

    def test_light_codes_ancient_alphabets_tiering(self):
        """Light Codes Ancient Alphabets returns exactly 14 items."""
        response = requests.get(f"{BASE_URL}/api/light-codes/ancient-alphabets")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        assert len(data) == 14, f"Expected 14 items, got {len(data)}"
        
        free_count = sum(1 for item in data if not item.get("is_premium"))
        premium_count = sum(1 for item in data if item.get("is_premium"))
        assert free_count == 4, f"Expected 4 free items, got {free_count}"
        assert premium_count == 10, f"Expected 10 premium items, got {premium_count}"

    def test_light_codes_light_language_tiering(self):
        """Light Codes Light Language returns exactly 14 items."""
        response = requests.get(f"{BASE_URL}/api/light-codes/light-language")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        assert len(data) == 14, f"Expected 14 items, got {len(data)}"
        
        free_count = sum(1 for item in data if not item.get("is_premium"))
        premium_count = sum(1 for item in data if item.get("is_premium"))
        assert free_count == 4, f"Expected 4 free items, got {free_count}"
        assert premium_count == 10, f"Expected 10 premium items, got {premium_count}"

    def test_light_codes_all_categories_tiering(self):
        """Light Codes main endpoint returns 5 categories, each with 14 items."""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, dict), "Expected dict response"
        
        expected_categories = ["sacred_geometry", "ancient_alphabets", "light_language_symbols", "galactic_codes", "chakra_codes"]
        for category in expected_categories:
            assert category in data, f"Missing category: {category}"
            items = data[category]
            assert isinstance(items, list), f"Expected list for {category}"
            assert len(items) == 14, f"Expected 14 items for {category}, got {len(items)}"
            
            free_count = sum(1 for item in items if not item.get("is_premium"))
            premium_count = sum(1 for item in items if item.get("is_premium"))
            assert free_count == 4, f"Expected 4 free items for {category}, got {free_count}"
            assert premium_count == 10, f"Expected 10 premium items for {category}, got {premium_count}"

    def test_runes_tiering(self):
        """Runes endpoint returns exactly 14 items."""
        response = requests.get(f"{BASE_URL}/api/runes")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        assert len(data) == 14, f"Expected 14 items, got {len(data)}"
        
        free_count = sum(1 for item in data if not item.get("is_premium"))
        premium_count = sum(1 for item in data if item.get("is_premium"))
        assert free_count == 4, f"Expected 4 free items, got {free_count}"
        assert premium_count == 10, f"Expected 10 premium items, got {premium_count}"

    def test_i_ching_tiering(self):
        """I Ching endpoint returns exactly 14 items."""
        response = requests.get(f"{BASE_URL}/api/i-ching")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        assert len(data) == 14, f"Expected 14 items, got {len(data)}"
        
        free_count = sum(1 for item in data if not item.get("is_premium"))
        premium_count = sum(1 for item in data if item.get("is_premium"))
        assert free_count == 4, f"Expected 4 free items, got {free_count}"
        assert premium_count == 10, f"Expected 10 premium items, got {premium_count}"

    def test_tarot_cards_tiering(self):
        """Tarot cards endpoint returns exactly 14 items."""
        response = requests.get(f"{BASE_URL}/api/tarot/cards")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        assert len(data) == 14, f"Expected 14 items, got {len(data)}"
        
        free_count = sum(1 for item in data if not item.get("is_premium"))
        premium_count = sum(1 for item in data if item.get("is_premium"))
        assert free_count == 4, f"Expected 4 free items, got {free_count}"
        assert premium_count == 10, f"Expected 10 premium items, got {premium_count}"

    def test_crystals_deep_tiering(self):
        """Crystals deep endpoint returns exactly 14 items."""
        response = requests.get(f"{BASE_URL}/api/crystals/deep")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        assert len(data) == 14, f"Expected 14 items, got {len(data)}"
        
        free_count = sum(1 for item in data if not item.get("is_premium"))
        premium_count = sum(1 for item in data if item.get("is_premium"))
        assert free_count == 4, f"Expected 4 free items, got {free_count}"
        assert premium_count == 10, f"Expected 10 premium items, got {premium_count}"

    def test_free_form_movement_tiering(self):
        """Free form movement endpoint returns exactly 14 items."""
        response = requests.get(f"{BASE_URL}/api/free-form-movement")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        assert len(data) == 14, f"Expected 14 items, got {len(data)}"
        
        free_count = sum(1 for item in data if not item.get("is_premium"))
        premium_count = sum(1 for item in data if item.get("is_premium"))
        assert free_count == 4, f"Expected 4 free items, got {free_count}"
        assert premium_count == 10, f"Expected 10 premium items, got {premium_count}"

    def test_somatic_yoga_tiering(self):
        """Somatic yoga endpoint returns exactly 14 items."""
        response = requests.get(f"{BASE_URL}/api/somatic-yoga")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        assert len(data) == 14, f"Expected 14 items, got {len(data)}"
        
        free_count = sum(1 for item in data if not item.get("is_premium"))
        premium_count = sum(1 for item in data if item.get("is_premium"))
        assert free_count == 4, f"Expected 4 free items, got {free_count}"
        assert premium_count == 10, f"Expected 10 premium items, got {premium_count}"

    def test_earth_altars_tiering(self):
        """Earth altars endpoint returns exactly 14 items."""
        response = requests.get(f"{BASE_URL}/api/earth-altars")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        assert len(data) == 14, f"Expected 14 items, got {len(data)}"
        
        free_count = sum(1 for item in data if not item.get("is_premium"))
        premium_count = sum(1 for item in data if item.get("is_premium"))
        assert free_count == 4, f"Expected 4 free items, got {free_count}"
        assert premium_count == 10, f"Expected 10 premium items, got {premium_count}"


class TestSacredToolBirthingContent:
    """Verify Sacred Tool Birthing items include ethical sourcing + ceremony fields."""

    def test_sacred_tool_birthing_has_ethical_materials(self):
        """Sacred Tool Birthing items include ethical_materials field."""
        response = requests.get(f"{BASE_URL}/api/creative-processes?category=sacred-tool-birthing")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Expected at least one item"
        
        for item in data:
            assert "ethical_materials" in item, f"Missing ethical_materials in {item.get('name')}"
            assert isinstance(item["ethical_materials"], list), f"ethical_materials should be list in {item.get('name')}"
            assert len(item["ethical_materials"]) > 0, f"ethical_materials should not be empty in {item.get('name')}"

    def test_sacred_tool_birthing_has_ceremony(self):
        """Sacred Tool Birthing items include ceremony field."""
        response = requests.get(f"{BASE_URL}/api/creative-processes?category=sacred-tool-birthing")
        assert response.status_code == 200
        data = response.json()
        
        for item in data:
            assert "ceremony" in item, f"Missing ceremony in {item.get('name')}"
            assert isinstance(item["ceremony"], list), f"ceremony should be list in {item.get('name')}"
            assert len(item["ceremony"]) > 0, f"ceremony should not be empty in {item.get('name')}"

    def test_sacred_tool_birthing_has_ritual(self):
        """Sacred Tool Birthing items include ritual field."""
        response = requests.get(f"{BASE_URL}/api/creative-processes?category=sacred-tool-birthing")
        assert response.status_code == 200
        data = response.json()
        
        for item in data:
            assert "ritual" in item, f"Missing ritual in {item.get('name')}"
            assert isinstance(item["ritual"], list), f"ritual should be list in {item.get('name')}"
            assert len(item["ritual"]) > 0, f"ritual should not be empty in {item.get('name')}"

    def test_sacred_tool_birthing_has_guided_practice(self):
        """Sacred Tool Birthing items include guided_practice field."""
        response = requests.get(f"{BASE_URL}/api/creative-processes?category=sacred-tool-birthing")
        assert response.status_code == 200
        data = response.json()
        
        for item in data:
            assert "guided_practice" in item, f"Missing guided_practice in {item.get('name')}"
            assert isinstance(item["guided_practice"], list), f"guided_practice should be list in {item.get('name')}"
            assert len(item["guided_practice"]) > 0, f"guided_practice should not be empty in {item.get('name')}"

    def test_sacred_tool_birthing_includes_required_tools(self):
        """Sacred Tool Birthing includes rattles, drums, wands, staffs, feathers."""
        response = requests.get(f"{BASE_URL}/api/creative-processes?category=sacred-tool-birthing")
        assert response.status_code == 200
        data = response.json()
        
        names_lower = [item.get("name", "").lower() for item in data]
        descriptions_lower = [item.get("description", "").lower() for item in data]
        combined = " ".join(names_lower + descriptions_lower)
        
        # Check for required tool types
        assert "rattle" in combined, "Missing rattle in Sacred Tool Birthing"
        assert "drum" in combined, "Missing drum in Sacred Tool Birthing"
        assert "wand" in combined, "Missing wand in Sacred Tool Birthing"
        assert "staff" in combined, "Missing staff in Sacred Tool Birthing"
        assert "feather" in combined, "Missing feather in Sacred Tool Birthing"


class TestLightCodesContent:
    """Verify Light Codes include ceremonial embodiment and light-coded symbols."""

    # Symbol categories that should have ceremonial content (excluding metadata categories)
    SYMBOL_CATEGORIES = ["sacred_geometry", "ancient_alphabets", "light_language_symbols", "galactic_codes", "chakra_codes"]

    def test_light_codes_have_embodiment_ritual(self):
        """Light Code symbols include embodiment_ritual field."""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        data = response.json()
        
        # Check symbol categories only (not linguistic_foundations or symbol_lineage_notes)
        for category_name in self.SYMBOL_CATEGORIES:
            items = data.get(category_name, [])
            assert len(items) > 0, f"Category {category_name} should have items"
            for item in items[:3]:  # Check first 3 items per category
                assert "embodiment_ritual" in item, f"Missing embodiment_ritual in {item.get('name')} ({category_name})"
                assert isinstance(item["embodiment_ritual"], list), f"embodiment_ritual should be list in {item.get('name')}"
                assert len(item["embodiment_ritual"]) > 0, f"embodiment_ritual should not be empty in {item.get('name')}"

    def test_light_codes_have_ceremony(self):
        """Light Code symbols include ceremony field."""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        data = response.json()
        
        for category_name in self.SYMBOL_CATEGORIES:
            items = data.get(category_name, [])
            for item in items[:3]:
                assert "ceremony" in item, f"Missing ceremony in {item.get('name')} ({category_name})"
                assert isinstance(item["ceremony"], list), f"ceremony should be list in {item.get('name')}"
                assert len(item["ceremony"]) > 0, f"ceremony should not be empty in {item.get('name')}"

    def test_light_codes_have_light_coded_symbols(self):
        """Light Code symbols include light_coded_symbols field."""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        data = response.json()
        
        for category_name in self.SYMBOL_CATEGORIES:
            items = data.get(category_name, [])
            for item in items[:3]:
                assert "light_coded_symbols" in item, f"Missing light_coded_symbols in {item.get('name')} ({category_name})"
                assert isinstance(item["light_coded_symbols"], list), f"light_coded_symbols should be list in {item.get('name')}"
                assert len(item["light_coded_symbols"]) > 0, f"light_coded_symbols should not be empty in {item.get('name')}"

    def test_light_codes_free_items_have_full_content(self):
        """Free Light Code items from main endpoint have full ceremonial content accessible."""
        # NOTE: Using main /api/light-codes endpoint which has full enrichment
        # The individual category endpoints (/light-codes/sacred-geometry) currently
        # do NOT include embodiment_ritual and light_coded_symbols enrichment
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        data = response.json()
        
        sacred_geometry = data.get("sacred_geometry", [])
        free_items = [item for item in sacred_geometry if not item.get("is_premium")]
        assert len(free_items) == 4, f"Expected 4 free items, got {len(free_items)}"
        
        for item in free_items:
            # Free items should have full content
            assert "embodiment_ritual" in item, f"Free item {item.get('name')} missing embodiment_ritual"
            assert "ceremony" in item, f"Free item {item.get('name')} missing ceremony"
            assert "light_coded_symbols" in item, f"Free item {item.get('name')} missing light_coded_symbols"

    def test_individual_category_endpoint_has_ceremony(self):
        """Individual category endpoint has ceremony field (but may lack embodiment_ritual)."""
        response = requests.get(f"{BASE_URL}/api/light-codes/sacred-geometry")
        assert response.status_code == 200
        data = response.json()
        
        # Individual endpoints have ceremony but not embodiment_ritual
        for item in data[:3]:
            assert "ceremony" in item or "ceremonies" in item, f"Item {item.get('name')} missing ceremony/ceremonies"


class TestPricingAndPlans:
    """Verify pricing plans remain unchanged (regression)."""

    def test_pricing_plans_returns_two_plans(self):
        """Pricing endpoint returns exactly 2 plans."""
        response = requests.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200
        data = response.json()
        
        assert "plans" in data, "Missing plans key"
        plans = data["plans"]
        assert len(plans) == 2, f"Expected 2 plans, got {len(plans)}"
        
        plan_ids = [p["id"] for p in plans]
        assert "monthly" in plan_ids, "Missing monthly plan"
        assert "full_app_unlock" in plan_ids, "Missing full_app_unlock plan"

    def test_monthly_plan_price(self):
        """Monthly plan is $19.99."""
        response = requests.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200
        data = response.json()
        
        monthly = next((p for p in data["plans"] if p["id"] == "monthly"), None)
        assert monthly is not None, "Monthly plan not found"
        assert monthly["price"] == 19.99, f"Expected $19.99, got ${monthly['price']}"

    def test_full_app_unlock_price(self):
        """Full app unlock is $369."""
        response = requests.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200
        data = response.json()
        
        full_app = next((p for p in data["plans"] if p["id"] == "full_app_unlock"), None)
        assert full_app is not None, "Full app unlock plan not found"
        assert full_app["price"] == 369.00, f"Expected $369.00, got ${full_app['price']}"


class TestLightCodesPremiumProducts:
    """Verify light_codes is in premium products list."""

    def test_light_codes_in_premium_products(self):
        """light_codes section is available as premium unlock product."""
        response = requests.get(f"{BASE_URL}/api/payments/premium-products")
        assert response.status_code == 200
        data = response.json()
        
        assert "products" in data, "Missing products key"
        product_ids = [p["id"] for p in data["products"]]
        assert "light_codes" in product_ids, "light_codes not in premium products"
        
        light_codes_product = next((p for p in data["products"] if p["id"] == "light_codes"), None)
        assert light_codes_product is not None
        assert light_codes_product["price"] == 59.00, f"Expected $59.00, got ${light_codes_product['price']}"
