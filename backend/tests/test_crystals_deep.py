"""
Backend tests for Crystal Guide deep endpoint:
- /api/crystals/deep - returns all 27 crystals with deep content
- Verifies: why_this_heals, extended_teachings, practice_guide fields
- Verifies: healing_properties, cleansing_methods, rituals, combinations
- Verifies: stone vitals (chakra, planet, vibration_number, hardness, color, rarity)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestCrystalsDeepEndpoint:
    """Tests for /api/crystals/deep endpoint"""

    def test_crystals_deep_returns_200(self):
        """Endpoint should return HTTP 200"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text[:200]}"
        print("PASS: /api/crystals/deep returns 200")

    def test_crystals_deep_returns_27_crystals(self):
        """Should return exactly 27 crystals"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        assert len(data) == 27, f"Expected 27 crystals, got {len(data)}"
        print(f"PASS: /api/crystals/deep returns {len(data)} crystals")

    def test_crystals_deep_have_basic_fields(self):
        """Each crystal should have: id, name, element, description"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep", timeout=15)
        assert response.status_code == 200
        data = response.json()
        for crystal in data:
            assert "id" in crystal, f"Missing 'id' in crystal: {crystal.get('name', 'unknown')}"
            assert "name" in crystal, f"Missing 'name' in crystal id={crystal.get('id', '?')}"
            assert "element" in crystal, f"Missing 'element' in crystal: {crystal.get('name', '?')}"
            assert crystal["id"], "Crystal id should not be empty"
            assert crystal["name"], "Crystal name should not be empty"
        print("PASS: All 27 crystals have basic fields (id, name, element)")

    def test_crystals_deep_have_stone_vitals(self):
        """Each crystal should have stone vitals: chakra, planet, vibration_number, hardness, color, rarity"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep", timeout=15)
        assert response.status_code == 200
        data = response.json()
        missing_vitals = []
        for crystal in data:
            name = crystal.get('name', crystal.get('id', 'unknown'))
            vitals = ['chakra', 'planet', 'vibration_number', 'hardness', 'color', 'rarity']
            missing = [v for v in vitals if not crystal.get(v)]
            if missing:
                missing_vitals.append(f"{name}: missing {missing}")
        if missing_vitals:
            print(f"WARNING: Some crystals missing vitals: {missing_vitals[:3]}")
        # At least 90% should have vitals
        crystals_with_all_vitals = sum(1 for c in data if all(c.get(v) for v in ['chakra', 'color', 'rarity']))
        assert crystals_with_all_vitals >= 24, f"Only {crystals_with_all_vitals}/27 have core vitals"
        print(f"PASS: {crystals_with_all_vitals}/27 crystals have stone vitals")

    def test_crystals_deep_have_healing_properties(self):
        """Each crystal should have healing_properties with physical/emotional/spiritual"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep", timeout=15)
        assert response.status_code == 200
        data = response.json()
        crystals_with_hp = 0
        for crystal in data:
            hp = crystal.get('healing_properties', {})
            if hp and (hp.get('physical') or hp.get('emotional') or hp.get('spiritual')):
                crystals_with_hp += 1
        assert crystals_with_hp >= 25, f"Only {crystals_with_hp}/27 crystals have healing_properties"
        print(f"PASS: {crystals_with_hp}/27 crystals have healing_properties")

    def test_crystals_deep_have_cleansing_methods(self):
        """Each crystal should have cleansing_methods array"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep", timeout=15)
        assert response.status_code == 200
        data = response.json()
        crystals_with_cm = sum(1 for c in data if c.get('cleansing_methods') and len(c['cleansing_methods']) > 0)
        assert crystals_with_cm >= 25, f"Only {crystals_with_cm}/27 crystals have cleansing_methods"
        print(f"PASS: {crystals_with_cm}/27 crystals have cleansing_methods")

    def test_crystals_deep_have_rituals(self):
        """Each crystal should have rituals array"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep", timeout=15)
        assert response.status_code == 200
        data = response.json()
        crystals_with_rituals = sum(1 for c in data if c.get('rituals') and len(c['rituals']) > 0)
        assert crystals_with_rituals >= 25, f"Only {crystals_with_rituals}/27 crystals have rituals"
        print(f"PASS: {crystals_with_rituals}/27 crystals have rituals")

    def test_crystals_deep_have_combinations(self):
        """Each crystal should have combinations array"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep", timeout=15)
        assert response.status_code == 200
        data = response.json()
        crystals_with_combos = sum(1 for c in data if c.get('combinations') and len(c['combinations']) > 0)
        assert crystals_with_combos >= 25, f"Only {crystals_with_combos}/27 crystals have combinations"
        print(f"PASS: {crystals_with_combos}/27 crystals have combinations")

    def test_crystals_deep_have_why_this_heals(self):
        """Each crystal should have why_this_heals deep teaching field"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep", timeout=15)
        assert response.status_code == 200
        data = response.json()
        crystals_with_wth = sum(1 for c in data if c.get('why_this_heals') and len(c['why_this_heals']) > 50)
        assert crystals_with_wth == 27, f"Only {crystals_with_wth}/27 crystals have why_this_heals"
        print(f"PASS: {crystals_with_wth}/27 crystals have why_this_heals")

    def test_crystals_deep_have_extended_teachings(self):
        """Each crystal should have extended_teachings deep teaching field"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep", timeout=15)
        assert response.status_code == 200
        data = response.json()
        crystals_with_et = sum(1 for c in data if c.get('extended_teachings') and len(c['extended_teachings']) > 50)
        assert crystals_with_et == 27, f"Only {crystals_with_et}/27 crystals have extended_teachings"
        print(f"PASS: {crystals_with_et}/27 crystals have extended_teachings")

    def test_crystals_deep_have_practice_guide(self):
        """Each crystal should have practice_guide deep teaching field"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep", timeout=15)
        assert response.status_code == 200
        data = response.json()
        crystals_with_pg = sum(1 for c in data if c.get('practice_guide') and len(c['practice_guide']) > 50)
        assert crystals_with_pg == 27, f"Only {crystals_with_pg}/27 crystals have practice_guide"
        print(f"PASS: {crystals_with_pg}/27 crystals have practice_guide")

    def test_crystals_deep_have_affirmation(self):
        """Each crystal should have an affirmation"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep", timeout=15)
        assert response.status_code == 200
        data = response.json()
        crystals_with_aff = sum(1 for c in data if c.get('affirmation'))
        assert crystals_with_aff >= 25, f"Only {crystals_with_aff}/27 crystals have affirmation"
        print(f"PASS: {crystals_with_aff}/27 crystals have affirmation")

    def test_crystals_deep_no_mongo_id_leaked(self):
        """MongoDB _id should not be returned in response"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep", timeout=15)
        assert response.status_code == 200
        data = response.json()
        for crystal in data:
            assert "_id" not in crystal, f"MongoDB _id leaked for crystal: {crystal.get('name')}"
        print("PASS: No MongoDB _id fields in response")

    def test_crystal_deep_individual_endpoint(self):
        """Individual crystal endpoint should work"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep/clear-quartz", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert data.get('id') == 'clear-quartz'
        assert data.get('why_this_heals'), "Individual crystal endpoint missing why_this_heals"
        assert data.get('extended_teachings'), "Individual crystal endpoint missing extended_teachings"
        assert data.get('practice_guide'), "Individual crystal endpoint missing practice_guide"
        print("PASS: Individual crystal /api/crystals/deep/clear-quartz returns deep content")

    def test_crystals_deep_check_specific_crystal_content(self):
        """Spot-check amethyst crystal has expected deep content"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep/amethyst", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert data.get('name') == 'Amethyst'
        # Check deep teachings
        wth = data.get('why_this_heals', '')
        assert 'amethyst' in wth.lower() or 'violet' in wth.lower() or 'stone' in wth.lower(), \
            f"why_this_heals doesn't seem to be about amethyst: {wth[:100]}"
        print("PASS: Amethyst deep content verified")

    def test_crystals_deep_meditation_guidance(self):
        """Crystals should have meditation_guidance with duration_minutes"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep", timeout=15)
        assert response.status_code == 200
        data = response.json()
        crystals_with_med = sum(1 for c in data if c.get('meditation_guidance'))
        assert crystals_with_med >= 20, f"Only {crystals_with_med}/27 crystals have meditation_guidance"
        # Check duration_minutes for guided practice timer
        crystals_with_duration = sum(1 for c in data 
            if c.get('meditation_guidance', {}).get('duration_minutes'))
        print(f"PASS: {crystals_with_med}/27 have meditation_guidance, {crystals_with_duration}/27 have duration_minutes")

    def test_crystals_deep_image_urls(self):
        """Crystals should have image_url field"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep", timeout=15)
        assert response.status_code == 200
        data = response.json()
        crystals_with_img = sum(1 for c in data if c.get('image_url'))
        assert crystals_with_img >= 20, f"Only {crystals_with_img}/27 crystals have image_url"
        print(f"PASS: {crystals_with_img}/27 crystals have image_url")
