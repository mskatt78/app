"""
Iteration 146 - Backend API Tests
Testing LightCodes, ElementalTemples, HeartPractices, Courses endpoints
and the new /api/elements alias endpoint
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✅ Health check passed: {data}")


class TestLightCodesAPI:
    """Light Codes endpoint tests"""
    
    def test_get_light_codes(self):
        """Test GET /api/light-codes returns light codes data"""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure - should have category keys
        assert isinstance(data, dict)
        assert "sacred_geometry" in data
        
        # Verify sacred_geometry has items
        sacred_geometry = data["sacred_geometry"]
        assert isinstance(sacred_geometry, list)
        assert len(sacred_geometry) > 0
        
        # Verify first item structure
        first_item = sacred_geometry[0]
        assert "id" in first_item
        assert "name" in first_item
        assert "description" in first_item
        print(f"✅ Light Codes API returned {len(sacred_geometry)} sacred geometry items")
        
    def test_light_codes_has_all_categories(self):
        """Test that light codes has expected categories"""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        data = response.json()
        
        expected_categories = ["sacred_geometry", "ancient_alphabets", "light_language_symbols", "galactic_codes", "chakra_codes"]
        for category in expected_categories:
            assert category in data, f"Missing category: {category}"
        print(f"✅ Light Codes has all {len(expected_categories)} expected categories")


class TestElementalTemplesAPI:
    """Elemental Temples endpoint tests"""
    
    def test_get_elemental_temples(self):
        """Test GET /api/elemental-temples returns temple data"""
        response = requests.get(f"{BASE_URL}/api/elemental-temples")
        assert response.status_code == 200
        data = response.json()
        
        # Should return list of 5 temples
        assert isinstance(data, list)
        assert len(data) == 5
        
        # Verify temple structure
        temple_ids = [t["id"] for t in data]
        expected_ids = ["earth", "water", "fire", "air", "spirit"]
        for expected_id in expected_ids:
            assert expected_id in temple_ids, f"Missing temple: {expected_id}"
        
        print(f"✅ Elemental Temples API returned {len(data)} temples")
        
    def test_elements_alias_endpoint(self):
        """Test GET /api/elements alias returns same data as /api/elemental-temples"""
        # Get data from both endpoints
        temples_response = requests.get(f"{BASE_URL}/api/elemental-temples")
        elements_response = requests.get(f"{BASE_URL}/api/elements")
        
        assert temples_response.status_code == 200
        assert elements_response.status_code == 200
        
        temples_data = temples_response.json()
        elements_data = elements_response.json()
        
        # Both should return same data
        assert len(temples_data) == len(elements_data)
        assert temples_data[0]["id"] == elements_data[0]["id"]
        
        print(f"✅ /api/elements alias works correctly, returns {len(elements_data)} temples")
        
    def test_elemental_temple_structure(self):
        """Test that elemental temple has expected fields"""
        response = requests.get(f"{BASE_URL}/api/elemental-temples")
        assert response.status_code == 200
        data = response.json()
        
        # Check Earth temple structure
        earth = next((t for t in data if t["id"] == "earth"), None)
        assert earth is not None
        
        expected_fields = ["id", "name", "element", "description", "practices", "rituals", "ceremonies", "blessings", "affirmations"]
        for field in expected_fields:
            assert field in earth, f"Missing field in Earth temple: {field}"
        
        print(f"✅ Earth temple has all expected fields")


class TestHeartPracticesAPI:
    """Heart Practices endpoint tests"""
    
    def test_get_heart_practices(self):
        """Test GET /api/heart-practices returns practices"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Verify first practice structure
        first_practice = data[0]
        assert "id" in first_practice
        assert "name" in first_practice
        
        print(f"✅ Heart Practices API returned {len(data)} practices")


class TestCoursesAPI:
    """Courses endpoint tests"""
    
    def test_get_courses(self):
        """Test GET /api/courses returns courses"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) == 3  # Should have 3 courses
        
        # Verify course structure - courses use "title" not "name"
        first_course = data[0]
        assert "id" in first_course
        assert "title" in first_course
        assert "price" in first_course
        
        print(f"✅ Courses API returned {len(data)} courses")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
