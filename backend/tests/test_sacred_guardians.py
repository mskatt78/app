"""
Backend tests for Sacred Guardians & Allies API
Tests: GET /api/sacred-guardians, category filtering, individual guardian, count verification
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSacredGuardiansAPI:
    """Sacred Guardians endpoint tests"""

    def test_get_all_guardians_returns_200(self):
        """GET /api/sacred-guardians should return 200"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_get_all_guardians_returns_37(self):
        """GET /api/sacred-guardians should return exactly 37 guardians"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 37, f"Expected 37 guardians, got {len(data)}"

    def test_get_all_guardians_have_required_fields(self):
        """All guardians must have id, name, category, description, message, image_url"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians")
        assert response.status_code == 200
        data = response.json()
        required_fields = ["id", "name", "category", "description", "message", "image_url"]
        for guardian in data:
            for field in required_fields:
                assert field in guardian, f"Guardian '{guardian.get('name', '?')}' missing field: {field}"
                assert guardian[field], f"Guardian '{guardian.get('name', '?')}' has empty field: {field}"

    def test_get_all_guardians_have_optional_fields(self):
        """Guardians should have symbolism, spiritual_gifts, how_to_connect, chakra"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians")
        assert response.status_code == 200
        data = response.json()
        optional_fields = ["symbolism", "spiritual_gifts", "how_to_connect", "chakra"]
        for guardian in data:
            for field in optional_fields:
                assert field in guardian, f"Guardian '{guardian.get('name', '?')}' missing optional field: {field}"

    def test_no_mongodb_id_in_response(self):
        """_id should not be exposed in API response"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians")
        assert response.status_code == 200
        data = response.json()
        for guardian in data:
            assert "_id" not in guardian, f"MongoDB _id leaked in guardian: {guardian.get('name', '?')}"

    # ---- Category Filter Tests ----

    def test_filter_by_power_animal(self):
        """GET /api/sacred-guardians?category=power_animal should return 8 power animals"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians?category=power_animal")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 8, f"Expected 8 power animals, got {len(data)}"
        for g in data:
            assert g["category"] == "power_animal", f"Wrong category: {g['category']}"

    def test_filter_by_spirit_animal(self):
        """GET /api/sacred-guardians?category=spirit_animal should return 6"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians?category=spirit_animal")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 6, f"Expected 6 spirit animals, got {len(data)}"

    def test_filter_by_dragon_energy_returns_6(self):
        """GET /api/sacred-guardians?category=dragon_energy should return 6 dragons"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians?category=dragon_energy")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 6, f"Expected 6 dragon energy entities, got {len(data)}"
        for g in data:
            assert g["category"] == "dragon_energy", f"Wrong category: {g['category']}"

    def test_filter_by_angel(self):
        """GET /api/sacred-guardians?category=angel should return 5 angels"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians?category=angel")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5, f"Expected 5 angels, got {len(data)}"

    def test_filter_by_familiar(self):
        """GET /api/sacred-guardians?category=familiar should return 6 familiars"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians?category=familiar")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 6, f"Expected 6 familiars, got {len(data)}"

    def test_filter_by_messenger(self):
        """GET /api/sacred-guardians?category=messenger should return 6 messengers"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians?category=messenger")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 6, f"Expected 6 messengers, got {len(data)}"

    def test_filter_by_unknown_category_returns_empty(self):
        """GET /api/sacred-guardians?category=unknown_cat should return empty list"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians?category=unknown_category")
        assert response.status_code == 200
        data = response.json()
        assert data == [], f"Expected empty list for unknown category, got {len(data)} items"

    # ---- Individual Guardian Tests ----

    def test_get_specific_guardian_wolf(self):
        """GET /api/sacred-guardians/pa-wolf should return Wolf guardian"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians/pa-wolf")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "pa-wolf"
        assert data["name"] == "Wolf"
        assert data["category"] == "power_animal"

    def test_get_specific_guardian_fire_dragon(self):
        """GET /api/sacred-guardians/de-fire should return Fire Dragon"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians/de-fire")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "de-fire"
        assert data["name"] == "Fire Dragon"
        assert data["category"] == "dragon_energy"

    def test_get_specific_guardian_not_found(self):
        """GET /api/sacred-guardians/non-existent should return 404"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians/non-existent-guardian")
        assert response.status_code == 404

    # ---- Data Integrity Tests ----

    def test_all_six_categories_present(self):
        """All 6 categories should be present: power_animal, spirit_animal, dragon_energy, angel, familiar, messenger"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians")
        assert response.status_code == 200
        data = response.json()
        categories = {g["category"] for g in data}
        expected = {"power_animal", "spirit_animal", "dragon_energy", "angel", "familiar", "messenger"}
        assert categories == expected, f"Missing categories: {expected - categories}"

    def test_guardian_images_are_https(self):
        """All guardian image_urls should be valid https URLs"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians")
        assert response.status_code == 200
        data = response.json()
        for guardian in data:
            url = guardian.get("image_url", "")
            assert url.startswith("https://"), f"Guardian '{guardian['name']}' has non-https image: {url}"

    def test_guardian_symbolism_is_list(self):
        """symbolism field should be a non-empty list for all guardians"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians")
        assert response.status_code == 200
        data = response.json()
        for guardian in data:
            assert isinstance(guardian["symbolism"], list), f"symbolism should be list for {guardian['name']}"
            assert len(guardian["symbolism"]) > 0, f"symbolism should not be empty for {guardian['name']}"

    def test_guardian_how_to_connect_is_list(self):
        """how_to_connect field should be a list with steps"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians")
        assert response.status_code == 200
        data = response.json()
        for guardian in data:
            assert isinstance(guardian["how_to_connect"], list), f"how_to_connect should be list for {guardian['name']}"
            assert len(guardian["how_to_connect"]) > 0, f"how_to_connect should not be empty for {guardian['name']}"
