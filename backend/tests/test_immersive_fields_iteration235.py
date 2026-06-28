"""
Test immersive fields (voice_script, precision_description, nervous_system_cues, 
integration_actions, embodiment_prompts) are present on key content routes.
Iteration 235 - Synchronized immersive metadata testing.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Immersive fields that should be present on enriched content
IMMERSIVE_FIELDS = [
    "voice_script",
    "precision_description", 
    "nervous_system_cues",
    "integration_actions",
    "embodiment_prompts"
]

class TestImmersiveFieldsPresence:
    """Test that immersive fields are present on key content routes"""
    
    def test_creative_processes_has_immersive_fields(self):
        """Creative processes should return items with immersive fields"""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert len(data) > 0, "Expected at least one creative process"
        
        # Check first item for immersive fields
        first_item = data[0]
        missing_fields = []
        for field in IMMERSIVE_FIELDS:
            if field not in first_item or not first_item[field]:
                missing_fields.append(field)
        
        # Allow some flexibility - at least 3 of 5 fields should be present
        assert len(missing_fields) <= 2, f"Creative process missing too many immersive fields: {missing_fields}"
        print(f"Creative processes: {len(data)} items, first item has fields: {[f for f in IMMERSIVE_FIELDS if f in first_item]}")
    
    def test_energy_healing_has_immersive_fields(self):
        """Energy healing should return items with immersive fields"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert len(data) > 0, "Expected at least one energy healing practice"
        
        first_item = data[0]
        missing_fields = []
        for field in IMMERSIVE_FIELDS:
            if field not in first_item or not first_item[field]:
                missing_fields.append(field)
        
        assert len(missing_fields) <= 2, f"Energy healing missing too many immersive fields: {missing_fields}"
        print(f"Energy healing: {len(data)} items, first item has fields: {[f for f in IMMERSIVE_FIELDS if f in first_item]}")
    
    def test_water_practices_has_immersive_fields(self):
        """Water practices should return items with immersive fields"""
        response = requests.get(f"{BASE_URL}/api/water-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert len(data) > 0, "Expected at least one water practice"
        
        first_item = data[0]
        missing_fields = []
        for field in IMMERSIVE_FIELDS:
            if field not in first_item or not first_item[field]:
                missing_fields.append(field)
        
        assert len(missing_fields) <= 2, f"Water practices missing too many immersive fields: {missing_fields}"
        print(f"Water practices: {len(data)} items, first item has fields: {[f for f in IMMERSIVE_FIELDS if f in first_item]}")
    
    def test_heart_practices_has_immersive_fields(self):
        """Heart practices should return items with immersive fields"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert len(data) > 0, "Expected at least one heart practice"
        
        first_item = data[0]
        missing_fields = []
        for field in IMMERSIVE_FIELDS:
            if field not in first_item or not first_item[field]:
                missing_fields.append(field)
        
        assert len(missing_fields) <= 2, f"Heart practices missing too many immersive fields: {missing_fields}"
        print(f"Heart practices: {len(data)} items, first item has fields: {[f for f in IMMERSIVE_FIELDS if f in first_item]}")
    
    def test_sound_frequencies_has_immersive_fields(self):
        """Sound frequencies should return items with immersive fields"""
        response = requests.get(f"{BASE_URL}/api/sound-frequencies")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert len(data) > 0, "Expected at least one sound frequency"
        
        first_item = data[0]
        missing_fields = []
        for field in IMMERSIVE_FIELDS:
            if field not in first_item or not first_item[field]:
                missing_fields.append(field)
        
        assert len(missing_fields) <= 2, f"Sound frequencies missing too many immersive fields: {missing_fields}"
        print(f"Sound frequencies: {len(data)} items, first item has fields: {[f for f in IMMERSIVE_FIELDS if f in first_item]}")
    
    def test_elemental_temples_has_immersive_fields(self):
        """Elemental temples should return items with immersive fields"""
        response = requests.get(f"{BASE_URL}/api/elemental-temples")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert len(data) > 0, "Expected at least one elemental temple"
        
        first_item = data[0]
        missing_fields = []
        for field in IMMERSIVE_FIELDS:
            if field not in first_item or not first_item[field]:
                missing_fields.append(field)
        
        assert len(missing_fields) <= 2, f"Elemental temples missing too many immersive fields: {missing_fields}"
        print(f"Elemental temples: {len(data)} items, first item has fields: {[f for f in IMMERSIVE_FIELDS if f in first_item]}")
    
    def test_masculine_embodiment_has_immersive_fields(self):
        """Masculine embodiment should return items with immersive fields"""
        response = requests.get(f"{BASE_URL}/api/masculine-embodiment")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert len(data) > 0, "Expected at least one masculine embodiment practice"
        
        first_item = data[0]
        missing_fields = []
        for field in IMMERSIVE_FIELDS:
            if field not in first_item or not first_item[field]:
                missing_fields.append(field)
        
        assert len(missing_fields) <= 2, f"Masculine embodiment missing too many immersive fields: {missing_fields}"
        print(f"Masculine embodiment: {len(data)} items, first item has fields: {[f for f in IMMERSIVE_FIELDS if f in first_item]}")
    
    def test_light_codes_sacred_geometry_has_immersive_fields(self):
        """Light codes sacred geometry should return items with immersive fields"""
        response = requests.get(f"{BASE_URL}/api/light-codes/sacred-geometry")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert len(data) > 0, "Expected at least one sacred geometry item"
        
        first_item = data[0]
        missing_fields = []
        for field in IMMERSIVE_FIELDS:
            if field not in first_item or not first_item[field]:
                missing_fields.append(field)
        
        assert len(missing_fields) <= 2, f"Light codes sacred geometry missing too many immersive fields: {missing_fields}"
        print(f"Light codes sacred geometry: {len(data)} items, first item has fields: {[f for f in IMMERSIVE_FIELDS if f in first_item]}")


class TestEnergyHealingModalityTabs:
    """Test energy healing modality tabs functionality"""
    
    def test_energy_healing_has_multiple_modalities(self):
        """Energy healing should have multiple modalities for tabs"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        
        data = response.json()
        modalities = set()
        for item in data:
            if item.get("modality"):
                modalities.add(item["modality"])
        
        assert len(modalities) >= 5, f"Expected at least 5 modalities, got {len(modalities)}: {modalities}"
        print(f"Energy healing modalities: {modalities}")
    
    def test_energy_healing_no_empty_modality(self):
        """No energy healing item should have empty modality"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        
        data = response.json()
        empty_modality_count = sum(1 for item in data if not item.get("modality"))
        
        assert empty_modality_count == 0, f"Found {empty_modality_count} items with empty modality"


class TestPremiumBehavior:
    """Test premium/free behavior for energy healing"""
    
    def test_energy_healing_has_free_items(self):
        """Energy healing should have some free items"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        
        data = response.json()
        free_items = [item for item in data if not item.get("is_premium", False)]
        
        assert len(free_items) >= 4, f"Expected at least 4 free items, got {len(free_items)}"
        print(f"Energy healing: {len(free_items)} free, {len(data) - len(free_items)} premium")
    
    def test_energy_healing_has_premium_items(self):
        """Energy healing should have premium items"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        
        data = response.json()
        premium_items = [item for item in data if item.get("is_premium", False)]
        
        assert len(premium_items) > 0, "Expected some premium items"
        print(f"Energy healing premium items: {len(premium_items)}")


class TestRegressionSmoke:
    """Smoke tests for pages that should still load after backend field additions"""
    
    def test_water_practices_loads(self):
        """Water practices page should load without errors"""
        response = requests.get(f"{BASE_URL}/api/water-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Water practices: {len(data)} items")
    
    def test_heart_practices_loads(self):
        """Heart practices page should load without errors"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Heart practices: {len(data)} items")
    
    def test_sound_frequencies_loads(self):
        """Sound frequencies page should load without errors"""
        response = requests.get(f"{BASE_URL}/api/sound-frequencies")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Sound frequencies: {len(data)} items")
    
    def test_creative_processes_loads(self):
        """Creative processes page should load without errors"""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Creative processes: {len(data)} items")


class TestDeepContentFields:
    """Test that deep content fields (alchemy, ritual, ceremony) are present"""
    
    def test_energy_healing_has_deep_fields(self):
        """Energy healing should have alchemy, ritual, ceremony fields"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        
        data = response.json()
        first_item = data[0]
        
        deep_fields = ["alchemy", "ritual", "ceremony", "guided_practice"]
        present_fields = [f for f in deep_fields if f in first_item and first_item[f]]
        
        assert len(present_fields) >= 3, f"Expected at least 3 deep fields, got: {present_fields}"
        print(f"Energy healing deep fields present: {present_fields}")
    
    def test_creative_processes_has_deep_fields(self):
        """Creative processes should have deep content fields"""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200
        
        data = response.json()
        first_item = data[0]
        
        deep_fields = ["alchemy", "ritual", "ceremony", "guided_practice", "process_steps"]
        present_fields = [f for f in deep_fields if f in first_item and first_item[f]]
        
        assert len(present_fields) >= 2, f"Expected at least 2 deep fields, got: {present_fields}"
        print(f"Creative processes deep fields present: {present_fields}")
