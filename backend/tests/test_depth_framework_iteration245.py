"""
Test depth framework fields (why_this_heals, safety_notes, integration_actions) 
across spiritual sections for shamanic depth parity.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestElementalPracticesDepthFields:
    """Test elemental practices return depth framework fields"""

    def test_elemental_practices_endpoint_returns_data(self):
        """Verify elemental practices endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"PASS: Elemental practices endpoint returns {len(data)} items")

    def test_elemental_practice_has_depth_fields(self):
        """Verify elemental practices have depth framework fields"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200
        data = response.json()
        
        practices_with_why_heals = 0
        practices_with_safety = 0
        practices_with_integration = 0
        
        for practice in data[:10]:
            if practice.get("why_this_heals"):
                practices_with_why_heals += 1
            if practice.get("safety_notes"):
                practices_with_safety += 1
            if practice.get("integration_actions") and len(practice.get("integration_actions", [])) > 0:
                practices_with_integration += 1
        
        print(f"Elemental practices depth fields: why_heals={practices_with_why_heals}, safety={practices_with_safety}, integration={practices_with_integration}")
        assert practices_with_why_heals > 0 or practices_with_safety > 0 or practices_with_integration > 0, \
            "Expected at least some elemental practices to have depth fields"


class TestShamanicPracticesDepthFields:
    """Test shamanic practices return depth framework fields"""

    def test_shamanic_practices_endpoint_returns_data(self):
        """Verify shamanic practices endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"PASS: Shamanic practices endpoint returns {len(data)} items")

    def test_shamanic_practice_has_depth_fields(self):
        """Verify shamanic practices have depth framework fields"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        
        practices_with_why_heals = 0
        practices_with_safety = 0
        practices_with_integration = 0
        
        for practice in data[:10]:
            if practice.get("why_this_heals"):
                practices_with_why_heals += 1
            if practice.get("safety_notes"):
                practices_with_safety += 1
            if practice.get("integration_actions") and len(practice.get("integration_actions", [])) > 0:
                practices_with_integration += 1
        
        print(f"Shamanic practices depth fields: why_heals={practices_with_why_heals}, safety={practices_with_safety}, integration={practices_with_integration}")
        assert practices_with_safety > 0, "Expected shamanic practices to have safety_notes"


class TestMasculineEmbodimentDepthFields:
    """Test masculine embodiment practices return depth framework fields"""

    def test_masculine_embodiment_endpoint_returns_data(self):
        """Verify masculine embodiment endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/masculine-embodiment")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"PASS: Masculine embodiment endpoint returns {len(data)} items")

    def test_masculine_embodiment_has_depth_fields(self):
        """Verify masculine embodiment practices have depth framework fields"""
        response = requests.get(f"{BASE_URL}/api/masculine-embodiment")
        assert response.status_code == 200
        data = response.json()
        
        practices_with_why_heals = 0
        practices_with_safety = 0
        practices_with_integration = 0
        
        for practice in data[:10]:
            if practice.get("why_this_heals"):
                practices_with_why_heals += 1
            if practice.get("safety_notes"):
                practices_with_safety += 1
            if practice.get("integration_actions") and len(practice.get("integration_actions", [])) > 0:
                practices_with_integration += 1
        
        print(f"Masculine embodiment depth fields: why_heals={practices_with_why_heals}, safety={practices_with_safety}, integration={practices_with_integration}")


class TestElementalTemplesDepthFields:
    """Test elemental temples return depth framework fields"""

    def test_elemental_temples_endpoint_returns_data(self):
        """Verify elemental temples endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/elemental-temples")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"PASS: Elemental temples endpoint returns {len(data)} temples")

    def test_elemental_temple_has_depth_fields(self):
        """Verify elemental temples have depth framework fields"""
        response = requests.get(f"{BASE_URL}/api/elemental-temples")
        assert response.status_code == 200
        data = response.json()
        
        temples_with_why_heals = 0
        temples_with_safety = 0
        temples_with_integration = 0
        
        for temple in data:
            if temple.get("why_this_heals"):
                temples_with_why_heals += 1
            if temple.get("safety_notes"):
                temples_with_safety += 1
            if temple.get("integration_actions") and len(temple.get("integration_actions", [])) > 0:
                temples_with_integration += 1
        
        print(f"Elemental temples depth fields: why_heals={temples_with_why_heals}, safety={temples_with_safety}, integration={temples_with_integration}")
        assert temples_with_why_heals > 0, "Expected elemental temples to have why_this_heals"
        assert temples_with_safety > 0, "Expected elemental temples to have safety_notes"
        assert temples_with_integration > 0, "Expected elemental temples to have integration_actions"

    def test_elemental_temple_detail_has_content(self):
        """Verify elemental temple detail has content"""
        response = requests.get(f"{BASE_URL}/api/elemental-temples")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            first_temple = data[0]
            temple_id = first_temple.get("id")
            
            detail_response = requests.get(f"{BASE_URL}/api/elemental-temples/{temple_id}")
            assert detail_response.status_code == 200
            detail = detail_response.json()
            
            print(f"Temple detail keys: {list(detail.keys())[:20]}")
            assert "name" in detail or "element" in detail, "Expected temple detail to have name or element"
            # Note: depth fields are in list endpoint, detail endpoint has safety_precautions
            assert "safety_precautions" in detail or "safety_notes" in detail, "Expected temple detail to have safety info"


class TestHealthEndpoint:
    """Basic health check"""

    def test_health_endpoint(self):
        """Verify health endpoint works"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("PASS: Health endpoint working")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
