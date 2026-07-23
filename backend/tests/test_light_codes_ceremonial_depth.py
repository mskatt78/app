"""
Test Light Codes API for ceremonial depth rewrite with stronger geometry symbols and light-coded articulation.
Tests for iteration 264 - verifying deeper ceremonial payloads.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestLightCodesAPI:
    """Test /api/light-codes endpoint for deeper ceremonial payloads."""

    def test_light_codes_endpoint_returns_200(self):
        """Test that /api/light-codes returns 200 status."""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: /api/light-codes returns 200")

    def test_light_codes_has_linguistic_foundations(self):
        """Test that linguistic_foundations is present with Light-Coded Articulation entry."""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        data = response.json()
        
        assert "linguistic_foundations" in data, "Missing linguistic_foundations field"
        linguistic_foundations = data["linguistic_foundations"]
        assert isinstance(linguistic_foundations, list), "linguistic_foundations should be a list"
        assert len(linguistic_foundations) >= 1, "linguistic_foundations should have at least 1 entry"
        
        # Check for Light-Coded Articulation entry
        articulation_entry = None
        for item in linguistic_foundations:
            if item.get("id") == "light-code-articulation" or "Light-Coded Articulation" in item.get("title", ""):
                articulation_entry = item
                break
        
        assert articulation_entry is not None, "Missing 'Light-Coded Articulation' entry in linguistic_foundations"
        assert "description" in articulation_entry, "Light-Coded Articulation entry missing description"
        print(f"PASS: linguistic_foundations contains Light-Coded Articulation entry: {articulation_entry.get('title')}")

    def test_light_codes_has_symbol_lineage_notes(self):
        """Test that symbol_lineage_notes is present."""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        data = response.json()
        
        assert "symbol_lineage_notes" in data, "Missing symbol_lineage_notes field"
        notes = data["symbol_lineage_notes"]
        assert isinstance(notes, list), "symbol_lineage_notes should be a list"
        assert len(notes) >= 3, f"symbol_lineage_notes should have at least 3 entries, got {len(notes)}"
        print(f"PASS: symbol_lineage_notes has {len(notes)} entries")

    def test_sacred_geometry_symbols_have_deep_ceremonial_fields(self):
        """Test that sacred_geometry symbols have embodiment_ritual, ceremony, guided_practice with >=5 entries."""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        data = response.json()
        
        sacred_geometry = data.get("sacred_geometry", [])
        assert len(sacred_geometry) > 0, "sacred_geometry should have at least 1 symbol"
        
        # Test first symbol for depth
        symbol = sacred_geometry[0]
        symbol_name = symbol.get("name", "Unknown")
        
        # Check embodiment_ritual depth
        embodiment_ritual = symbol.get("embodiment_ritual", [])
        assert isinstance(embodiment_ritual, list), f"{symbol_name}: embodiment_ritual should be a list"
        assert len(embodiment_ritual) >= 5, f"{symbol_name}: embodiment_ritual should have >=5 entries, got {len(embodiment_ritual)}"
        print(f"PASS: {symbol_name} has {len(embodiment_ritual)} embodiment_ritual entries")
        
        # Check ceremony depth
        ceremony = symbol.get("ceremony", [])
        assert isinstance(ceremony, list), f"{symbol_name}: ceremony should be a list"
        assert len(ceremony) >= 5, f"{symbol_name}: ceremony should have >=5 entries, got {len(ceremony)}"
        print(f"PASS: {symbol_name} has {len(ceremony)} ceremony entries")
        
        # Check guided_practice depth
        guided_practice = symbol.get("guided_practice", [])
        assert isinstance(guided_practice, list), f"{symbol_name}: guided_practice should be a list"
        assert len(guided_practice) >= 5, f"{symbol_name}: guided_practice should have >=5 entries, got {len(guided_practice)}"
        print(f"PASS: {symbol_name} has {len(guided_practice)} guided_practice entries")

    def test_light_coded_symbols_expanded(self):
        """Test that light_coded_symbols array is expanded with geometry symbols."""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        data = response.json()
        
        sacred_geometry = data.get("sacred_geometry", [])
        assert len(sacred_geometry) > 0, "sacred_geometry should have at least 1 symbol"
        
        symbol = sacred_geometry[0]
        symbol_name = symbol.get("name", "Unknown")
        
        light_coded_symbols = symbol.get("light_coded_symbols", [])
        assert isinstance(light_coded_symbols, list), f"{symbol_name}: light_coded_symbols should be a list"
        assert len(light_coded_symbols) >= 3, f"{symbol_name}: light_coded_symbols should have >=3 entries, got {len(light_coded_symbols)}"
        print(f"PASS: {symbol_name} has {len(light_coded_symbols)} light_coded_symbols: {light_coded_symbols[:3]}")

    def test_ancient_alphabets_have_ceremonial_depth(self):
        """Test that ancient_alphabets symbols also have deep ceremonial fields."""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        data = response.json()
        
        ancient_alphabets = data.get("ancient_alphabets", [])
        if len(ancient_alphabets) == 0:
            pytest.skip("No ancient_alphabets data available")
        
        symbol = ancient_alphabets[0]
        symbol_name = symbol.get("name", "Unknown")
        
        # Check for ceremonial fields
        assert "embodiment_ritual" in symbol, f"{symbol_name}: missing embodiment_ritual"
        assert "ceremony" in symbol, f"{symbol_name}: missing ceremony"
        assert "guided_practice" in symbol, f"{symbol_name}: missing guided_practice"
        
        assert len(symbol.get("embodiment_ritual", [])) >= 5, f"{symbol_name}: embodiment_ritual depth < 5"
        assert len(symbol.get("ceremony", [])) >= 5, f"{symbol_name}: ceremony depth < 5"
        assert len(symbol.get("guided_practice", [])) >= 5, f"{symbol_name}: guided_practice depth < 5"
        print(f"PASS: ancient_alphabets symbol '{symbol_name}' has deep ceremonial fields")

    def test_light_language_symbols_have_ceremonial_depth(self):
        """Test that light_language_symbols also have deep ceremonial fields."""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        data = response.json()
        
        light_language = data.get("light_language_symbols", [])
        if len(light_language) == 0:
            pytest.skip("No light_language_symbols data available")
        
        symbol = light_language[0]
        symbol_name = symbol.get("name", "Unknown")
        
        # Check for ceremonial fields
        assert "embodiment_ritual" in symbol, f"{symbol_name}: missing embodiment_ritual"
        assert "ceremony" in symbol, f"{symbol_name}: missing ceremony"
        assert "guided_practice" in symbol, f"{symbol_name}: missing guided_practice"
        
        assert len(symbol.get("embodiment_ritual", [])) >= 5, f"{symbol_name}: embodiment_ritual depth < 5"
        assert len(symbol.get("ceremony", [])) >= 5, f"{symbol_name}: ceremony depth < 5"
        assert len(symbol.get("guided_practice", [])) >= 5, f"{symbol_name}: guided_practice depth < 5"
        print(f"PASS: light_language_symbols symbol '{symbol_name}' has deep ceremonial fields")

    def test_symbols_have_practical_embodiment_language(self):
        """Test that ceremonial content contains practical/action language, not just mystical."""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        data = response.json()
        
        sacred_geometry = data.get("sacred_geometry", [])
        assert len(sacred_geometry) > 0
        
        symbol = sacred_geometry[0]
        symbol_name = symbol.get("name", "Unknown")
        
        # Check embodiment_ritual for practical language
        embodiment_ritual = symbol.get("embodiment_ritual", [])
        ritual_text = " ".join(embodiment_ritual).lower()
        
        practical_keywords = ["breath", "body", "action", "sensation", "boundary", "24 hour", "water", "journal"]
        found_keywords = [kw for kw in practical_keywords if kw in ritual_text]
        
        assert len(found_keywords) >= 3, f"{symbol_name}: embodiment_ritual lacks practical language. Found: {found_keywords}"
        print(f"PASS: {symbol_name} embodiment_ritual contains practical keywords: {found_keywords}")


class TestMindfulnessNoRegression:
    """Quick no-regression check on /api/mindfulness to ensure global enrichment changes didn't break other sections."""

    def test_mindfulness_endpoint_returns_200(self):
        """Test that /api/mindfulness returns 200 status."""
        response = requests.get(f"{BASE_URL}/api/mindfulness")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: /api/mindfulness returns 200")

    def test_mindfulness_has_practices(self):
        """Test that mindfulness response has practices data."""
        response = requests.get(f"{BASE_URL}/api/mindfulness")
        assert response.status_code == 200
        data = response.json()
        
        # Check for common mindfulness fields
        has_content = False
        for key in ["practices", "grounding_practices", "mindfulness_practices", "items"]:
            if key in data and isinstance(data[key], list) and len(data[key]) > 0:
                has_content = True
                print(f"PASS: /api/mindfulness has '{key}' with {len(data[key])} items")
                break
        
        if not has_content:
            # Check if data itself is a list
            if isinstance(data, list) and len(data) > 0:
                has_content = True
                print(f"PASS: /api/mindfulness returns list with {len(data)} items")
        
        assert has_content, "Mindfulness endpoint should return content data"


class TestLightCodesSubEndpoints:
    """Test light-codes sub-endpoints."""

    def test_sacred_geometry_endpoint(self):
        """Test /api/light-codes/sacred-geometry returns 200."""
        response = requests.get(f"{BASE_URL}/api/light-codes/sacred-geometry")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, (list, dict)), "Response should be list or dict"
        print(f"PASS: /api/light-codes/sacred-geometry returns 200")

    def test_ancient_alphabets_endpoint(self):
        """Test /api/light-codes/ancient-alphabets returns 200."""
        response = requests.get(f"{BASE_URL}/api/light-codes/ancient-alphabets")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"PASS: /api/light-codes/ancient-alphabets returns 200")

    def test_light_language_endpoint(self):
        """Test /api/light-codes/light-language returns 200."""
        response = requests.get(f"{BASE_URL}/api/light-codes/light-language")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"PASS: /api/light-codes/light-language returns 200")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
