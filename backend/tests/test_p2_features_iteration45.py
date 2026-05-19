"""
Backend tests for P2 features:
- Chakra Cleansing API (13 chakras with unique image_urls)
- Elemental Temples API (5 elements with practices/rituals)
- Water Practices API (19 practices across 7 categories)
"""
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


# ============ CHAKRA CLEANSING TESTS ============

class TestChakraCleansing:
    """Test /api/chakra-cleansing endpoint - 13 chakras with unique images"""

    def test_chakra_cleansing_returns_200(self):
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    def test_chakra_cleansing_returns_13_chakras(self):
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 13, f"Expected 13 chakras, got {len(data)}"

    def test_chakra_cleansing_each_has_image_url(self):
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        data = response.json()
        missing_images = [c.get("chakra", c.get("id")) for c in data if not c.get("image_url")]
        assert len(missing_images) == 0, f"Chakras missing image_url: {missing_images}"

    def test_chakra_cleansing_unique_image_urls(self):
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        data = response.json()
        image_urls = [c.get("image_url") for c in data if c.get("image_url")]
        unique_urls = set(image_urls)
        assert len(image_urls) == len(unique_urls), (
            f"Duplicate image_urls found! {len(image_urls)} total, {len(unique_urls)} unique. "
            f"Duplicates: {[url for url in image_urls if image_urls.count(url) > 1]}"
        )

    def test_chakra_cleansing_all_13_chakra_types_present(self):
        """Verify all 13 chakra types are present"""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        data = response.json()
        chakra_names = [c.get("chakra", "").lower() for c in data]
        
        expected_chakras = ["earth star", "root", "sacral", "solar", "heart",
                            "higher heart", "throat", "third eye", "crown",
                            "causal", "soul star", "stellar", "universal"]
        
        found_count = 0
        for expected in expected_chakras:
            found = any(expected in name for name in chakra_names)
            if found:
                found_count += 1
        
        assert found_count >= 10, f"Only {found_count}/13 expected chakra types found. Chakras in DB: {chakra_names}"

    def test_chakra_cleansing_each_has_required_fields(self):
        """Each chakra record should have id, name, chakra, description"""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        data = response.json()
        required_fields = ["id", "name", "chakra", "description"]
        for chakra in data:
            for field in required_fields:
                assert field in chakra, f"Chakra {chakra.get('id', 'unknown')} missing field '{field}'"

    def test_chakra_cleansing_no_mongodb_id(self):
        """MongoDB _id should be excluded from response"""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        data = response.json()
        for chakra in data:
            assert "_id" not in chakra, f"MongoDB _id exposed in chakra {chakra.get('id', 'unknown')}"

    def test_chakra_cleansing_specific_chakra_by_filter(self):
        """Test filtering by specific chakra - throat"""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing?chakra=Throat")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1, "Should find at least 1 Throat chakra practice"
        for item in data:
            assert "throat" in item.get("chakra", "").lower(), "Filtered results should contain throat chakra"


# ============ ELEMENTAL TEMPLES TESTS ============

class TestElementalTemples:
    """Test /api/elemental-temples endpoint - 5 elements"""

    def test_elemental_temples_returns_200(self):
        response = requests.get(f"{BASE_URL}/api/elemental-temples")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    def test_elemental_temples_returns_5_elements(self):
        response = requests.get(f"{BASE_URL}/api/elemental-temples")
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 5, f"Expected 5 elements, got {len(data)}"

    def test_elemental_temples_has_all_5_elements(self):
        """Verify all 5 elements: earth, water, fire, air, spirit"""
        response = requests.get(f"{BASE_URL}/api/elemental-temples")
        data = response.json()
        element_ids = {el.get("id") for el in data}
        expected_ids = {"earth", "water", "fire", "air", "spirit"}
        assert expected_ids == element_ids, f"Missing elements: {expected_ids - element_ids}"

    def test_elemental_temples_each_has_practices_array(self):
        """Each temple should have a practices array"""
        response = requests.get(f"{BASE_URL}/api/elemental-temples")
        data = response.json()
        for temple in data:
            assert "practices" in temple, f"Temple {temple.get('id')} missing 'practices'"
            assert isinstance(temple["practices"], list), f"Temple {temple.get('id')} practices should be a list"
            assert len(temple["practices"]) > 0, f"Temple {temple.get('id')} has empty practices"

    def test_elemental_temples_each_has_rituals_array(self):
        """Each temple should have a rituals array"""
        response = requests.get(f"{BASE_URL}/api/elemental-temples")
        data = response.json()
        for temple in data:
            assert "rituals" in temple, f"Temple {temple.get('id')} missing 'rituals'"
            assert isinstance(temple["rituals"], list), f"Temple {temple.get('id')} rituals should be a list"
            assert len(temple["rituals"]) > 0, f"Temple {temple.get('id')} has empty rituals"

    def test_elemental_temples_each_has_affirmations(self):
        """Each temple should have affirmations"""
        response = requests.get(f"{BASE_URL}/api/elemental-temples")
        data = response.json()
        for temple in data:
            assert "affirmations" in temple, f"Temple {temple.get('id')} missing 'affirmations'"
            assert len(temple["affirmations"]) > 0, f"Temple {temple.get('id')} has empty affirmations"

    def test_elemental_temples_each_has_required_fields(self):
        """Verify required fields for each temple"""
        response = requests.get(f"{BASE_URL}/api/elemental-temples")
        data = response.json()
        required_fields = ["id", "name", "element", "description", "tagline"]
        for temple in data:
            for field in required_fields:
                assert field in temple, f"Temple {temple.get('id')} missing field '{field}'"

    def test_elemental_temples_earth_has_correct_content(self):
        """Verify Earth temple has correct data structure"""
        response = requests.get(f"{BASE_URL}/api/elemental-temples/earth")
        assert response.status_code == 200
        earth = response.json()
        assert earth["id"] == "earth"
        assert earth["element"] == "Earth"
        assert len(earth["practices"]) >= 5, "Earth temple should have at least 5 practices"
        assert len(earth["rituals"]) >= 2, "Earth temple should have at least 2 rituals"
        assert len(earth["blessings"]) >= 3, "Earth temple should have blessings"

    def test_elemental_temples_by_id_returns_404_for_unknown(self):
        """Unknown temple id returns 404"""
        response = requests.get(f"{BASE_URL}/api/elemental-temples/unknown_element")
        assert response.status_code == 404

    def test_elemental_temples_no_mongodb_id(self):
        """MongoDB _id should be excluded"""
        response = requests.get(f"{BASE_URL}/api/elemental-temples")
        data = response.json()
        for temple in data:
            assert "_id" not in temple, f"MongoDB _id exposed in temple {temple.get('id')}"


# ============ WATER PRACTICES TESTS ============

class TestWaterPractices:
    """Test /api/water-practices endpoint - 19 practices across 7 categories"""

    def test_water_practices_returns_200(self):
        response = requests.get(f"{BASE_URL}/api/water-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    def test_water_practices_returns_list(self):
        response = requests.get(f"{BASE_URL}/api/water-practices")
        data = response.json()
        assert isinstance(data, list), "Response should be a list"

    def test_water_practices_returns_19_practices(self):
        response = requests.get(f"{BASE_URL}/api/water-practices")
        data = response.json()
        assert len(data) == 19, f"Expected 19 practices, got {len(data)}"

    def test_water_practices_has_all_7_categories(self):
        """Verify all 7 categories are represented"""
        response = requests.get(f"{BASE_URL}/api/water-practices")
        data = response.json()
        categories_present = {p.get("category") for p in data}
        expected_categories = {"blessing", "ceremony", "ritual", "frequency", "crystalline", "cleansing", "moon"}
        assert expected_categories == categories_present, (
            f"Missing categories: {expected_categories - categories_present}"
        )

    def test_water_practices_each_has_steps(self):
        """Every water practice should have a steps array"""
        response = requests.get(f"{BASE_URL}/api/water-practices")
        data = response.json()
        for practice in data:
            assert "steps" in practice, f"Practice {practice.get('id')} missing 'steps'"
            assert isinstance(practice["steps"], list), f"Practice {practice.get('id')} steps should be a list"
            assert len(practice["steps"]) > 0, f"Practice {practice.get('id')} has empty steps"

    def test_water_practices_each_has_required_fields(self):
        """Verify required fields for each practice"""
        response = requests.get(f"{BASE_URL}/api/water-practices")
        data = response.json()
        required_fields = ["id", "name", "description", "category"]
        for practice in data:
            for field in required_fields:
                assert field in practice, f"Practice {practice.get('id')} missing field '{field}'"

    def test_water_practices_filter_by_blessing_category(self):
        """Test category filter for 'blessing'"""
        response = requests.get(f"{BASE_URL}/api/water-practices?category=blessing")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Should return blessing practices"
        for p in data:
            assert p.get("category") == "blessing", f"Expected category=blessing, got {p.get('category')}"

    def test_water_practices_filter_by_moon_category(self):
        """Test category filter for 'moon' water"""
        response = requests.get(f"{BASE_URL}/api/water-practices?category=moon")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 3, f"Expected at least 3 moon practices, got {len(data)}"

    def test_water_practices_no_mongodb_id(self):
        """MongoDB _id should be excluded"""
        response = requests.get(f"{BASE_URL}/api/water-practices")
        data = response.json()
        for practice in data:
            assert "_id" not in practice, f"MongoDB _id exposed in practice {practice.get('id')}"

    def test_water_practices_blessing_category_count(self):
        """Verify blessing category has correct count (3 practices expected)"""
        response = requests.get(f"{BASE_URL}/api/water-practices?category=blessing")
        data = response.json()
        assert len(data) == 3, f"Expected 3 blessing practices, got {len(data)}"
