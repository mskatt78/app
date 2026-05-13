"""
Iteration 96 - Module 3 Maintainability Sprint Tests
Tests for:
- seed_healing_modalities.py refactor (seed_all helper, _stamp_healing_dataset, _healing_existing_ids, _seed_healing_collection)
- divination_content.py helpers (_compose_light_code_practice, _enrich_light_code_entry)
- crystals_deep.py helper (get_crystal_by_id)
- archangel_oracle.py helpers (get_archangel_reading, get_archangel_by_id)
- Core app routes still load with no regressions
"""
import pytest
import requests
import os
import sys

# Add backend to path for direct imports
sys.path.insert(0, "/app/backend")

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestSeedHealingModalitiesRefactor:
    """Test seed_healing_modalities.py refactored helper functions"""

    def test_energy_healing_endpoint_returns_data(self):
        """Verify energy healing data is accessible after seed_all refactor"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of energy healing modalities"
        if len(data) > 0:
            # Verify structure of energy healing item
            item = data[0]
            assert "id" in item, "Energy healing item should have 'id'"
            assert "name" in item, "Energy healing item should have 'name'"
            print(f"✓ Energy healing endpoint returns {len(data)} modalities")

    def test_free_form_movement_endpoint_returns_data(self):
        """Verify free form movement data is accessible after seed_all refactor"""
        response = requests.get(f"{BASE_URL}/api/free-form-movement")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of free form movement practices"
        if len(data) > 0:
            item = data[0]
            assert "id" in item, "Free form movement item should have 'id'"
            assert "name" in item, "Free form movement item should have 'name'"
            print(f"✓ Free form movement endpoint returns {len(data)} practices")

    def test_chakra_cleansing_endpoint_returns_data(self):
        """Verify chakra cleansing data is accessible after seed_all refactor"""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of chakra cleansing practices"
        if len(data) > 0:
            item = data[0]
            assert "id" in item, "Chakra cleansing item should have 'id'"
            assert "chakra" in item, "Chakra cleansing item should have 'chakra'"
            print(f"✓ Chakra cleansing endpoint returns {len(data)} practices")


class TestDivinationContentHelpers:
    """Test divination_content.py helper functions and data loading"""

    def test_runes_endpoint_returns_data(self):
        """Verify Elder Futhark runes data loads correctly"""
        response = requests.get(f"{BASE_URL}/api/runes")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of runes"
        assert len(data) >= 24, f"Expected at least 24 runes, got {len(data)}"
        # Verify rune structure
        rune = data[0]
        assert "id" in rune, "Rune should have 'id'"
        assert "name" in rune, "Rune should have 'name'"
        assert "symbol" in rune, "Rune should have 'symbol'"
        assert "meaning" in rune, "Rune should have 'meaning'"
        print(f"✓ Runes endpoint returns {len(data)} runes with correct structure")

    def test_light_codes_endpoint_returns_data(self):
        """Verify light codes data loads correctly with enrichment"""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        # Light codes should have sacred_geometry, ancient_alphabets, light_language_symbols
        assert "sacred_geometry" in data or isinstance(data, list), "Light codes should have categories"
        print(f"✓ Light codes endpoint returns data successfully")

    def test_i_ching_endpoint_returns_data(self):
        """Verify I Ching hexagrams data loads correctly"""
        response = requests.get(f"{BASE_URL}/api/i-ching")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of hexagrams"
        if len(data) > 0:
            hexagram = data[0]
            assert "id" in hexagram, "Hexagram should have 'id'"
            assert "name" in hexagram, "Hexagram should have 'name'"
            print(f"✓ I Ching endpoint returns {len(data)} hexagrams")


class TestCrystalsDeepHelper:
    """Test crystals_deep.py helper function get_crystal_by_id"""

    def test_crystals_deep_endpoint_returns_data(self):
        """Verify crystals deep data loads correctly"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of crystals"
        assert len(data) >= 5, f"Expected at least 5 crystals, got {len(data)}"
        # Verify crystal structure
        crystal = data[0]
        assert "id" in crystal, "Crystal should have 'id'"
        assert "name" in crystal, "Crystal should have 'name'"
        assert "healing_properties" in crystal, "Crystal should have 'healing_properties'"
        print(f"✓ Crystals deep endpoint returns {len(data)} crystals with correct structure")

    def test_crystals_deep_by_id_endpoint(self):
        """Verify get_crystal_by_id helper works via API"""
        # First get list to find a valid ID
        response = requests.get(f"{BASE_URL}/api/crystals/deep")
        assert response.status_code == 200
        data = response.json()
        if len(data) > 0:
            crystal_id = data[0].get("id")
            # Now fetch by ID
            response = requests.get(f"{BASE_URL}/api/crystals/deep/{crystal_id}")
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            crystal = response.json()
            assert crystal.get("id") == crystal_id, "Crystal ID should match"
            assert "name" in crystal, "Crystal should have 'name'"
            print(f"✓ Crystals deep by ID endpoint returns crystal '{crystal.get('name')}'")


class TestArchangelOracleHelpers:
    """Test archangel_oracle.py helper functions"""

    def test_archangel_oracle_endpoint_returns_data(self):
        """Verify archangel oracle data loads correctly"""
        response = requests.get(f"{BASE_URL}/api/oracle/archangels")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of archangels"
        assert len(data) >= 10, f"Expected at least 10 archangels, got {len(data)}"
        # Verify archangel structure
        archangel = data[0]
        assert "id" in archangel, "Archangel should have 'id'"
        assert "name" in archangel, "Archangel should have 'name'"
        assert "message" in archangel, "Archangel should have 'message'"
        print(f"✓ Archangel oracle endpoint returns {len(data)} archangels with correct structure")

    def test_archangel_oracle_by_id_endpoint(self):
        """Verify get_archangel_by_id helper works via API"""
        # First get list to find a valid ID
        response = requests.get(f"{BASE_URL}/api/oracle/archangels")
        assert response.status_code == 200
        data = response.json()
        if len(data) > 0:
            archangel_id = data[0].get("id")
            # Now fetch by ID
            response = requests.get(f"{BASE_URL}/api/oracle/archangels/{archangel_id}")
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            archangel = response.json()
            assert archangel.get("id") == archangel_id, "Archangel ID should match"
            assert "name" in archangel, "Archangel should have 'name'"
            print(f"✓ Archangel oracle by ID endpoint returns '{archangel.get('name')}'")

    def test_archangel_reading_endpoint(self):
        """Verify get_archangel_reading helper works via random reading API"""
        response = requests.post(
            f"{BASE_URL}/api/oracle/archangels/reading/guest",
            json={"question": "What guidance do I need?", "spread_type": "single"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        reading = response.json()
        # Reading returns cards array and interpretation
        assert "cards" in reading, "Reading should have 'cards'"
        assert len(reading["cards"]) >= 1, "Reading should have at least 1 card"
        print(f"✓ Archangel reading endpoint returns reading with {len(reading['cards'])} card(s)")


class TestCoreAppRoutesNoRegression:
    """Verify core app routes still work after backend changes"""

    def test_health_endpoint(self):
        """Verify health endpoint works"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Health endpoint working")

    def test_meditations_endpoint(self):
        """Verify meditations endpoint works"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of meditations"
        print(f"✓ Meditations endpoint returns {len(data)} meditations")

    def test_breathwork_endpoint(self):
        """Verify breathwork endpoint works"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of breathwork sessions"
        print(f"✓ Breathwork endpoint returns {len(data)} sessions")

    def test_yoga_poses_endpoint(self):
        """Verify yoga poses endpoint works"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of yoga poses"
        print(f"✓ Yoga poses endpoint returns {len(data)} poses")

    def test_crystals_endpoint(self):
        """Verify crystals endpoint works"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of crystals"
        print(f"✓ Crystals endpoint returns {len(data)} crystals")


class TestDataHelperFunctionsDirectly:
    """Test helper functions directly by importing them"""

    def test_archangel_get_by_id_function(self):
        """Test get_archangel_by_id function directly"""
        from data.archangel_oracle import get_archangel_by_id, ARCHANGEL_ORACLE
        
        # Test with valid ID
        archangel = get_archangel_by_id("archangel-michael")
        assert archangel is not None, "Should find Archangel Michael"
        assert archangel["name"] == "Archangel Michael"
        
        # Test with invalid ID
        archangel = get_archangel_by_id("invalid-id")
        assert archangel is None, "Should return None for invalid ID"
        
        print("✓ get_archangel_by_id function works correctly")

    def test_archangel_get_reading_function(self):
        """Test get_archangel_reading function directly"""
        from data.archangel_oracle import get_archangel_reading, ARCHANGEL_ORACLE
        
        reading = get_archangel_reading()
        assert reading is not None, "Should return a reading"
        assert "id" in reading, "Reading should have 'id'"
        assert "name" in reading, "Reading should have 'name'"
        assert reading in ARCHANGEL_ORACLE, "Reading should be from ARCHANGEL_ORACLE list"
        
        print("✓ get_archangel_reading function works correctly")

    def test_crystals_deep_get_by_id_function(self):
        """Test get_crystal_by_id function directly"""
        from data.crystals_deep import get_crystal_by_id, CRYSTALS_DEEP
        
        # Test with valid ID
        crystal = get_crystal_by_id("clear-quartz")
        assert crystal is not None, "Should find Clear Quartz"
        assert crystal["name"] == "Clear Quartz"
        
        # Test with invalid ID
        crystal = get_crystal_by_id("invalid-crystal")
        assert crystal is None, "Should return None for invalid ID"
        
        print("✓ get_crystal_by_id function works correctly")

    def test_divination_light_code_enrichment(self):
        """Test _enrich_light_code_entry function directly"""
        from data.divination_content import _enrich_light_code_entry, LIGHT_CODES
        
        # Test enrichment of a sacred geometry entry
        if "sacred_geometry" in LIGHT_CODES and len(LIGHT_CODES["sacred_geometry"]) > 0:
            entry = LIGHT_CODES["sacred_geometry"][0]
            # The enrichment adds lineage, healing_lens, why_this_heals, ancient_traditions, extended_teachings, practice_guide
            assert "lineage" in entry, "Enriched entry should have 'lineage'"
            assert "healing_lens" in entry, "Enriched entry should have 'healing_lens'"
            assert "why_this_heals" in entry, "Enriched entry should have 'why_this_heals'"
            assert "ancient_traditions" in entry, "Enriched entry should have 'ancient_traditions'"
            assert "extended_teachings" in entry, "Enriched entry should have 'extended_teachings'"
            print("✓ _enrich_light_code_entry function works correctly - entries have enriched fields")
        else:
            print("⚠ Skipped: No sacred_geometry entries to test")

    def test_seed_healing_modalities_data_structure(self):
        """Test seed_healing_modalities data structures are valid"""
        from data.seed_healing_modalities import (
            ENERGY_HEALING_DATA,
            FREE_FORM_MOVEMENT_DATA,
            CHAKRA_CLEANSING_DATA,
            _stamp_healing_dataset
        )
        
        # Verify data structures
        assert len(ENERGY_HEALING_DATA) >= 3, "Should have at least 3 energy healing modalities"
        assert len(FREE_FORM_MOVEMENT_DATA) >= 2, "Should have at least 2 free form movement practices"
        assert len(CHAKRA_CLEANSING_DATA) >= 7, "Should have at least 7 chakra cleansing practices"
        
        # Test _stamp_healing_dataset function
        test_data = [{"id": "test-1"}, {"id": "test-2"}]
        _stamp_healing_dataset(test_data, "2026-01-01T00:00:00Z")
        assert test_data[0]["created_at"] == "2026-01-01T00:00:00Z"
        assert test_data[0]["updated_at"] == "2026-01-01T00:00:00Z"
        
        print("✓ seed_healing_modalities data structures and _stamp_healing_dataset work correctly")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
