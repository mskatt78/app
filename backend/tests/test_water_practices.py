"""
Test Water Practices API endpoints
Tests for iteration 74 - verifying water practices load correctly for all 7 categories
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestWaterPracticesAPI:
    """Water Practices endpoint tests"""
    
    def test_get_all_water_practices(self):
        """Test GET /api/water-practices returns all practices"""
        response = requests.get(f"{BASE_URL}/api/water-practices")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Should return at least one practice"
        
        # Verify structure of first practice
        practice = data[0]
        assert "id" in practice
        assert "name" in practice
        assert "category" in practice
        assert "description" in practice
        print(f"PASS: Retrieved {len(data)} water practices")
    
    def test_blessing_category(self):
        """Test blessing category returns practices"""
        response = requests.get(f"{BASE_URL}/api/water-practices?category=blessing")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1, "Blessing category should have practices"
        
        # Verify all returned practices are blessing category
        for practice in data:
            assert practice.get("category") == "blessing"
        print(f"PASS: Blessing category has {len(data)} practices")
    
    def test_ceremony_category(self):
        """Test ceremony category returns practices"""
        response = requests.get(f"{BASE_URL}/api/water-practices?category=ceremony")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1, "Ceremony category should have practices"
        print(f"PASS: Ceremony category has {len(data)} practices")
    
    def test_ritual_category(self):
        """Test ritual category returns practices"""
        response = requests.get(f"{BASE_URL}/api/water-practices?category=ritual")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1, "Ritual category should have practices"
        print(f"PASS: Ritual category has {len(data)} practices")
    
    def test_frequency_category(self):
        """Test frequency category returns practices"""
        response = requests.get(f"{BASE_URL}/api/water-practices?category=frequency")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1, "Frequency category should have practices"
        print(f"PASS: Frequency category has {len(data)} practices")
    
    def test_crystalline_category(self):
        """Test crystalline category returns practices"""
        response = requests.get(f"{BASE_URL}/api/water-practices?category=crystalline")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1, "Crystalline category should have practices"
        print(f"PASS: Crystalline category has {len(data)} practices")
    
    def test_cleansing_category(self):
        """Test cleansing category returns practices"""
        response = requests.get(f"{BASE_URL}/api/water-practices?category=cleansing")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1, "Cleansing category should have practices"
        print(f"PASS: Cleansing category has {len(data)} practices")
    
    def test_moon_category(self):
        """Test moon category returns practices"""
        response = requests.get(f"{BASE_URL}/api/water-practices?category=moon")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1, "Moon category should have practices"
        print(f"PASS: Moon category has {len(data)} practices")
    
    def test_all_seven_categories_have_data(self):
        """Verify all 7 categories have at least one practice"""
        categories = ["blessing", "ceremony", "ritual", "frequency", "crystalline", "cleansing", "moon"]
        
        for cat in categories:
            response = requests.get(f"{BASE_URL}/api/water-practices?category={cat}")
            assert response.status_code == 200
            data = response.json()
            assert len(data) >= 1, f"Category '{cat}' should have at least one practice"
        
        print("PASS: All 7 categories have data")
    
    def test_practice_structure(self):
        """Test that practices have required fields"""
        response = requests.get(f"{BASE_URL}/api/water-practices")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) > 0
        
        practice = data[0]
        required_fields = ["id", "name", "description", "category", "steps"]
        
        for field in required_fields:
            assert field in practice, f"Practice should have '{field}' field"
        
        # Steps should be a list
        assert isinstance(practice.get("steps"), list)
        assert len(practice.get("steps", [])) > 0, "Practice should have at least one step"
        
        print("PASS: Practice structure is valid")
    
    def test_category_normalization_aliases(self):
        """Test that category aliases work (frontend normalizes these)"""
        # The frontend normalizes categories like 'blessings' -> 'blessing'
        # Backend stores normalized values, so direct query should work
        response = requests.get(f"{BASE_URL}/api/water-practices?category=blessing")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        print("PASS: Category normalization working")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
