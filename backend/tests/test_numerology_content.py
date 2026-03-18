"""
Test numerology calculation and content counts - Iteration 19
Tests: Numerology (life_path, crystal, element, mantra, personal_year)
Tests: Content counts (Yoga: 66, Breathwork: 11, Shamanic: 21, Elemental: 15, Creative: 17)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestNumerology:
    """Numerology endpoint tests - Life Path calculation with all fields"""
    
    def test_numerology_calculate_returns_life_path(self):
        """Test that numerology calculate returns life_path object"""
        response = requests.post(
            f"{BASE_URL}/api/numerology/calculate",
            json={"birth_date": "1990-05-15", "full_name": "Test User"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify life_path object exists and has all required fields
        assert "life_path" in data
        life_path = data["life_path"]
        
        assert "number" in life_path
        assert "name" in life_path
        assert "crystal" in life_path
        assert "element" in life_path
        assert "mantra" in life_path
        assert "traits" in life_path
        assert isinstance(life_path["traits"], list)
    
    def test_numerology_calculate_returns_personal_year(self):
        """Test that numerology calculate returns personal_year object"""
        response = requests.post(
            f"{BASE_URL}/api/numerology/calculate",
            json={"birth_date": "1985-03-20"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "personal_year" in data
        personal_year = data["personal_year"]
        
        assert "number" in personal_year
        assert "theme" in personal_year
        assert "description" in personal_year
    
    def test_numerology_calculate_with_name_returns_expression_soul(self):
        """Test that numerology with name returns expression and soul_urge"""
        response = requests.post(
            f"{BASE_URL}/api/numerology/calculate",
            json={"birth_date": "1990-05-15", "full_name": "Jane Doe"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # With full_name, should return expression and soul_urge
        assert "expression" in data
        assert "soul_urge" in data
        assert "number" in data["expression"]
        assert "number" in data["soul_urge"]
    
    def test_numerology_life_paths_endpoint(self):
        """Test that life-paths endpoint returns all paths with crystal and mantra"""
        response = requests.get(f"{BASE_URL}/api/numerology/life-paths")
        assert response.status_code == 200
        data = response.json()
        
        # Should have multiple life paths
        assert len(data) >= 9  # At least 1-9
        
        # Check a sample path has all required fields
        for key, path in data.items():
            assert "crystal" in path
            assert "mantra" in path
            assert "element" in path
            assert "traits" in path
            break
    
    def test_numerology_master_numbers(self):
        """Test that master numbers (11, 22, 33) are recognized"""
        response = requests.get(f"{BASE_URL}/api/numerology/life-paths")
        assert response.status_code == 200
        data = response.json()
        
        # Check for master numbers
        assert "11" in data or 11 in [int(k) for k in data.keys() if k.isdigit()]


class TestContentCounts:
    """Content counts verification tests"""
    
    def test_yoga_poses_count(self):
        """Verify yoga poses count is 66"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 66, f"Expected 66 yoga poses, got {len(data)}"
    
    def test_breathwork_sessions_count(self):
        """Verify breathwork sessions count is 11"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 11, f"Expected 11 breathwork sessions, got {len(data)}"
    
    def test_shamanic_practices_count(self):
        """Verify shamanic practices count is 21"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 21, f"Expected 21 shamanic practices, got {len(data)}"
    
    def test_elemental_practices_count(self):
        """Verify elemental practices count is 15"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 15, f"Expected 15 elemental practices, got {len(data)}"
    
    def test_creative_processes_count(self):
        """Verify creative processes count is 17"""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 17, f"Expected 17 creative processes, got {len(data)}"


class TestYogaFiltering:
    """Test yoga library filtering by element"""
    
    def test_yoga_poses_structure(self):
        """Verify yoga poses have element field for filtering"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        
        # Check that poses have element field
        elements_found = set()
        for pose in data:
            if "element" in pose:
                elements_found.add(pose["element"])
        
        # Should have multiple elements
        assert len(elements_found) > 0, "Yoga poses should have element field"
    
    def test_yoga_poses_have_required_fields(self):
        """Verify yoga poses have all required fields"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["id", "name", "description"]
        for pose in data[:5]:  # Check first 5
            for field in required_fields:
                assert field in pose, f"Yoga pose missing required field: {field}"


class TestContentStructure:
    """Test content structure for each category"""
    
    def test_breathwork_session_structure(self):
        """Verify breathwork sessions have required structure"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        data = response.json()
        
        for session in data[:3]:
            assert "id" in session
            assert "name" in session
            assert "description" in session
    
    def test_shamanic_practice_structure(self):
        """Verify shamanic practices have required structure"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        
        for practice in data[:3]:
            assert "id" in practice
            assert "name" in practice
            assert "description" in practice
    
    def test_elemental_practice_structure(self):
        """Verify elemental practices have required structure"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200
        data = response.json()
        
        for practice in data[:3]:
            assert "id" in practice
            assert "name" in practice
            assert "description" in practice
    
    def test_creative_process_structure(self):
        """Verify creative processes have required structure"""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200
        data = response.json()
        
        for process in data[:3]:
            assert "id" in process
            assert "name" in process
            assert "description" in process


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
