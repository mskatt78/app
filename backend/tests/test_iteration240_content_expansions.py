"""
Iteration 240 - Content Expansions & Alchemy Hub Testing
Tests for:
1. Alchemy Hub routes (/alchemy-hub, /all-alchemy)
2. Backend content expansions with new IDs
3. Tiered endpoints (4 free / 10 premium = 14 total)
4. Sacred Tool Birthing multi-day pathway details
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

class TestAlchemyHubEndpoints:
    """Test Sacred Ally Alchemy and Angelic Alchemy endpoints for Alchemy Hub"""
    
    def test_sacred_ally_alchemy_returns_14_items(self):
        """Sacred Ally Alchemy should return 14 items (4 free + 10 premium)"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 14, f"Expected 14 items, got {len(data)}"
        print(f"PASS: Sacred Ally Alchemy returns {len(data)} items")
    
    def test_sacred_ally_alchemy_has_expanded_ids(self):
        """Sacred Ally Alchemy should include expanded supplement IDs"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        assert response.status_code == 200
        data = response.json()
        ids = [item.get("id") for item in data]
        assert "sacred-ally-supp-101" in ids, "Missing sacred-ally-supp-101"
        print(f"PASS: Found sacred-ally-supp-101 in response")
    
    def test_angelic_alchemy_returns_14_items(self):
        """Angelic Alchemy should return 14 items (4 free + 10 premium)"""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 14, f"Expected 14 items, got {len(data)}"
        print(f"PASS: Angelic Alchemy returns {len(data)} items")


class TestWaterPracticesExpansion:
    """Test Water Practices endpoint with expanded content"""
    
    def test_water_practices_returns_14_items(self):
        """Water Practices should return 14 items"""
        response = requests.get(f"{BASE_URL}/api/water-practices")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 14, f"Expected 14 items, got {len(data)}"
        print(f"PASS: Water Practices returns {len(data)} items")
    
    def test_water_practices_has_expanded_ids(self):
        """Water Practices should include water-practice-101 through 114"""
        response = requests.get(f"{BASE_URL}/api/water-practices")
        assert response.status_code == 200
        data = response.json()
        ids = [item.get("id") for item in data]
        assert "water-practice-101" in ids, "Missing water-practice-101"
        assert "water-practice-114" in ids, "Missing water-practice-114"
        print(f"PASS: Found water-practice-101 and water-practice-114")


class TestEnergyHealingExpansion:
    """Test Energy Healing endpoint with expanded content"""
    
    def test_energy_healing_returns_14_items(self):
        """Energy Healing should return 14 items"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 14, f"Expected 14 items, got {len(data)}"
        print(f"PASS: Energy Healing returns {len(data)} items")
    
    def test_energy_healing_has_expanded_ids(self):
        """Energy Healing should include energy-healing-supp-110 and other expanded IDs"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        data = response.json()
        ids = [item.get("id") for item in data]
        assert "energy-healing-supp-110" in ids, "Missing energy-healing-supp-110"
        print(f"PASS: Found energy-healing-supp-110")


class TestAncientWisdomExpansion:
    """Test Ancient Wisdom endpoint with expanded content"""
    
    def test_ancient_wisdom_returns_14_items(self):
        """Ancient Wisdom should return 14 items"""
        response = requests.get(f"{BASE_URL}/api/ancient-wisdom")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 14, f"Expected 14 items, got {len(data)}"
        print(f"PASS: Ancient Wisdom returns {len(data)} items")
    
    def test_ancient_wisdom_has_expanded_ids(self):
        """Ancient Wisdom should include ancient-wisdom-supp-101"""
        response = requests.get(f"{BASE_URL}/api/ancient-wisdom")
        assert response.status_code == 200
        data = response.json()
        ids = [item.get("id") for item in data]
        assert "ancient-wisdom-supp-101" in ids, "Missing ancient-wisdom-supp-101"
        print(f"PASS: Found ancient-wisdom-supp-101")


class TestSacredGuardiansExpansion:
    """Test Sacred Guardians endpoint with expanded content"""
    
    def test_sacred_guardians_returns_14_items(self):
        """Sacred Guardians should return 14 items"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 14, f"Expected 14 items, got {len(data)}"
        print(f"PASS: Sacred Guardians returns {len(data)} items")
    
    def test_sacred_guardians_has_expanded_ids(self):
        """Sacred Guardians should include sacred-guardian-supp-101"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians")
        assert response.status_code == 200
        data = response.json()
        ids = [item.get("id") for item in data]
        assert "sacred-guardian-supp-101" in ids, "Missing sacred-guardian-supp-101"
        print(f"PASS: Found sacred-guardian-supp-101")


class TestSacredToolBirthing:
    """Test Creative Processes sacred-tool-birthing category with multi-day pathways"""
    
    def test_sacred_tool_birthing_returns_14_items(self):
        """Sacred Tool Birthing should return 14 items"""
        response = requests.get(f"{BASE_URL}/api/creative-processes?category=sacred-tool-birthing")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 14, f"Expected 14 items, got {len(data)}"
        print(f"PASS: Sacred Tool Birthing returns {len(data)} items")
    
    def test_sacred_tool_birthing_has_multi_day_pathway(self):
        """Sacred Tool Birthing items should have multi_day_pathway field"""
        response = requests.get(f"{BASE_URL}/api/creative-processes?category=sacred-tool-birthing")
        assert response.status_code == 200
        data = response.json()
        
        # Check that at least one item has multi_day_pathway
        has_pathway = any("multi_day_pathway" in item for item in data)
        assert has_pathway, "No items have multi_day_pathway field"
        print(f"PASS: Sacred Tool Birthing items have multi_day_pathway field")
    
    def test_sacred_tool_birthing_has_process_steps(self):
        """Sacred Tool Birthing items should have process_steps field"""
        response = requests.get(f"{BASE_URL}/api/creative-processes?category=sacred-tool-birthing")
        assert response.status_code == 200
        data = response.json()
        
        # Check that at least one item has process_steps
        has_steps = any("process_steps" in item for item in data)
        assert has_steps, "No items have process_steps field"
        print(f"PASS: Sacred Tool Birthing items have process_steps field")


class TestGalacticStarLineages:
    """Test that galactic star lineages are present in Sacred Ally Alchemy"""
    
    def test_pleiadian_content_present(self):
        """Sacred Ally Alchemy should include Pleiadian content"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        assert response.status_code == 200
        data = response.json()
        
        pleiadian_items = [item for item in data if "pleiadian" in str(item).lower()]
        assert len(pleiadian_items) > 0, "No Pleiadian content found"
        print(f"PASS: Found {len(pleiadian_items)} Pleiadian items")
    
    def test_andromedan_content_present(self):
        """Sacred Ally Alchemy should include Andromedan content"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        assert response.status_code == 200
        data = response.json()
        
        andromedan_items = [item for item in data if "andromedan" in str(item).lower()]
        assert len(andromedan_items) > 0, "No Andromedan content found"
        print(f"PASS: Found {len(andromedan_items)} Andromedan items")
    
    def test_sirian_content_present(self):
        """Sacred Ally Alchemy should include Sirian content"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        assert response.status_code == 200
        data = response.json()
        
        sirian_items = [item for item in data if "sirian" in str(item).lower()]
        assert len(sirian_items) > 0, "No Sirian content found"
        print(f"PASS: Found {len(sirian_items)} Sirian items")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
