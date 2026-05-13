"""
Iteration 94 - Module 1 Backend Tests
Tests for I Ching cast endpoint after helper decomposition in content.py
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestIChing:
    """I Ching endpoint tests after helper decomposition"""
    
    def test_iching_cast_coins_returns_valid_hexagram(self):
        """Test that I Ching cast endpoint returns valid hexagram data"""
        response = requests.get(f"{BASE_URL}/api/i-ching/cast/coins")
        assert response.status_code == 200
        
        data = response.json()
        # Verify required fields exist
        assert "number" in data
        assert "name" in data
        assert "chinese" in data
        assert "judgment" in data
        assert "lines_cast" in data
        assert "changing_lines" in data
        
        # Verify hexagram number is valid (1-64)
        assert 1 <= data["number"] <= 64
        
        # Verify lines_cast has 6 values
        assert len(data["lines_cast"]) == 6
        
        # Verify each line value is valid (6, 7, 8, or 9)
        for line in data["lines_cast"]:
            assert line in [6, 7, 8, 9]
        
        print(f"✓ I Ching cast returned hexagram #{data['number']}: {data['name']}")
        print(f"  Lines cast: {data['lines_cast']}")
        print(f"  Changing lines: {data['changing_lines']}")
    
    def test_iching_get_all_hexagrams(self):
        """Test that all hexagrams endpoint works"""
        response = requests.get(f"{BASE_URL}/api/i-ching")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ I Ching returned {len(data)} hexagrams")
    
    def test_iching_get_specific_hexagram(self):
        """Test getting a specific hexagram by number"""
        response = requests.get(f"{BASE_URL}/api/i-ching/1")
        assert response.status_code == 200
        
        data = response.json()
        assert data["number"] == 1
        assert "name" in data
        print(f"✓ Hexagram #1: {data['name']}")


class TestCoursesEndpoint:
    """Courses endpoint tests"""
    
    def test_courses_list(self):
        """Test courses list endpoint"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        
        # Verify course structure
        course = data[0]
        assert "id" in course
        assert "title" in course
        print(f"✓ Courses endpoint returned {len(data)} courses")


class TestBreathworkEndpoint:
    """Breathwork endpoint tests"""
    
    def test_breathwork_sessions_list(self):
        """Test breathwork sessions list endpoint"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        
        # Verify session structure
        session = data[0]
        assert "id" in session
        assert "name" in session
        assert "pattern" in session
        print(f"✓ Breathwork endpoint returned {len(data)} sessions")


class TestYogaEndpoint:
    """Yoga endpoint tests (for AdminCMS)"""
    
    def test_yoga_poses_list(self):
        """Test yoga poses list endpoint"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Yoga poses endpoint returned {len(data)} poses")


class TestCrystalsEndpoint:
    """Crystals endpoint tests (for AdminCMS)"""
    
    def test_crystals_list(self):
        """Test crystals list endpoint"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Crystals endpoint returned {len(data)} crystals")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
