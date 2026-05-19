"""
Test Light Codes API - Iteration 57
Tests for deep content fields: why_this_heals, ancient_traditions, extended_teachings, practice_guide, lineage, healing_lens
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestLightCodesAPI:
    """Test /api/light-codes endpoint returns deep content"""
    
    def test_light_codes_endpoint_returns_data(self):
        """Test that /api/light-codes returns data"""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print(f"Light codes categories: {list(data.keys())}")
    
    def test_light_codes_has_all_categories(self):
        """Test that all expected categories are present"""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        data = response.json()
        
        expected_categories = [
            "sacred_geometry",
            "ancient_alphabets", 
            "light_language_symbols",
            "galactic_codes",
            "chakra_codes"
        ]
        
        for category in expected_categories:
            assert category in data, f"Missing category: {category}"
            assert len(data[category]) > 0, f"Category {category} is empty"
            print(f"{category}: {len(data[category])} items")
    
    def test_sacred_geometry_has_deep_fields(self):
        """Test sacred geometry items have deep content fields"""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        data = response.json()
        
        sacred_geometry = data.get("sacred_geometry", [])
        assert len(sacred_geometry) > 0, "No sacred geometry items"
        
        # Check first item has all deep fields
        first_item = sacred_geometry[0]
        deep_fields = ["why_this_heals", "ancient_traditions", "extended_teachings", "practice_guide", "lineage", "healing_lens"]
        
        for field in deep_fields:
            assert field in first_item, f"Missing field: {field} in sacred_geometry"
            assert first_item[field], f"Empty field: {field} in sacred_geometry"
            print(f"sacred_geometry[0].{field}: {len(str(first_item[field]))} chars")
    
    def test_light_language_has_deep_fields(self):
        """Test light language items have deep content fields"""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        data = response.json()
        
        light_language = data.get("light_language_symbols", [])
        assert len(light_language) > 0, "No light language items"
        
        # Check first item has all deep fields
        first_item = light_language[0]
        deep_fields = ["why_this_heals", "ancient_traditions", "extended_teachings", "practice_guide", "lineage", "healing_lens"]
        
        for field in deep_fields:
            assert field in first_item, f"Missing field: {field} in light_language"
            assert first_item[field], f"Empty field: {field} in light_language"
            print(f"light_language[0].{field}: {len(str(first_item[field]))} chars")
    
    def test_dna_activation_helix_has_deep_content(self):
        """Test DNA Activation Helix specifically has deep content"""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        data = response.json()
        
        light_language = data.get("light_language_symbols", [])
        dna_items = [x for x in light_language if "DNA" in x.get("name", "")]
        
        assert len(dna_items) > 0, "DNA Activation Helix not found"
        dna = dna_items[0]
        
        # Verify deep content
        assert "why_this_heals" in dna
        assert len(dna["why_this_heals"]) > 100, "why_this_heals content too short"
        assert "reframes the body" in dna["why_this_heals"] or "heals" in dna["why_this_heals"].lower()
        
        assert "ancient_traditions" in dna
        assert len(dna["ancient_traditions"]) > 100, "ancient_traditions content too short"
        assert "caduceus" in dna["ancient_traditions"].lower() or "serpent" in dna["ancient_traditions"].lower()
        
        assert "practice_guide" in dna
        assert len(dna["practice_guide"]) > 50, "practice_guide content too short"
        
        print("DNA Activation Helix verified with deep content")
        print(f"  why_this_heals: {len(dna['why_this_heals'])} chars")
        print(f"  ancient_traditions: {len(dna['ancient_traditions'])} chars")
        print(f"  practice_guide: {len(dna['practice_guide'])} chars")
    
    def test_galactic_codes_has_deep_fields(self):
        """Test galactic codes items have deep content fields"""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        data = response.json()
        
        galactic_codes = data.get("galactic_codes", [])
        assert len(galactic_codes) > 0, "No galactic codes items"
        
        # Check first item has deep fields
        first_item = galactic_codes[0]
        deep_fields = ["why_this_heals", "ancient_traditions", "extended_teachings", "practice_guide", "lineage", "healing_lens"]
        
        for field in deep_fields:
            assert field in first_item, f"Missing field: {field} in galactic_codes"
            print(f"galactic_codes[0].{field}: {len(str(first_item.get(field, ''))) if first_item.get(field) else 'empty'} chars")
    
    def test_chakra_codes_has_deep_fields(self):
        """Test chakra codes items have deep content fields"""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        data = response.json()
        
        chakra_codes = data.get("chakra_codes", [])
        assert len(chakra_codes) > 0, "No chakra codes items"
        
        # Check first item has deep fields
        first_item = chakra_codes[0]
        deep_fields = ["why_this_heals", "ancient_traditions", "extended_teachings", "practice_guide", "lineage", "healing_lens"]
        
        for field in deep_fields:
            assert field in first_item, f"Missing field: {field} in chakra_codes"
            print(f"chakra_codes[0].{field}: {len(str(first_item.get(field, ''))) if first_item.get(field) else 'empty'} chars")
    
    def test_ancient_alphabets_has_deep_fields(self):
        """Test ancient alphabets items have deep content fields"""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        data = response.json()
        
        ancient_alphabets = data.get("ancient_alphabets", [])
        assert len(ancient_alphabets) > 0, "No ancient alphabets items"
        
        # Check first item has deep fields
        first_item = ancient_alphabets[0]
        deep_fields = ["why_this_heals", "ancient_traditions", "extended_teachings", "practice_guide", "lineage", "healing_lens"]
        
        for field in deep_fields:
            assert field in first_item, f"Missing field: {field} in ancient_alphabets"
            print(f"ancient_alphabets[0].{field}: {len(str(first_item.get(field, ''))) if first_item.get(field) else 'empty'} chars")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
