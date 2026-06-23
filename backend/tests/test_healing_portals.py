"""
Healing Portals API Tests - Iteration 185
Tests for GET /api/healing-portals endpoints
"""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Expected portal types from seed data
EXPECTED_PORTAL_TYPES = ["heart", "womb", "shadow", "ancestral", "trauma"]
EXPECTED_PORTAL_COUNT = 5


class TestHealingPortalsAPI:
    """Tests for /api/healing-portals endpoints"""

    def test_get_all_healing_portals_returns_200(self):
        """GET /api/healing-portals returns 200"""
        response = requests.get(f"{BASE_URL}/api/healing-portals")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASSED: GET /api/healing-portals returns 200")

    def test_get_all_healing_portals_returns_5_portals(self):
        """GET /api/healing-portals returns exactly 5 seeded portals"""
        response = requests.get(f"{BASE_URL}/api/healing-portals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == EXPECTED_PORTAL_COUNT, f"Expected {EXPECTED_PORTAL_COUNT} portals, got {len(data)}"
        print(f"PASSED: GET /api/healing-portals returns {EXPECTED_PORTAL_COUNT} portals")

    def test_healing_portals_have_required_fields(self):
        """Each portal has required fields: id, name, portal_type, element, description, is_premium"""
        response = requests.get(f"{BASE_URL}/api/healing-portals")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["id", "name", "portal_type", "element", "description", "is_premium", 
                          "duration_minutes", "intensity", "alchemy_teachings", "rituals", 
                          "ceremonies", "integration_practices"]
        
        for portal in data:
            for field in required_fields:
                assert field in portal, f"Portal {portal.get('id', 'unknown')} missing field: {field}"
        print("PASSED: All portals have required fields")

    def test_healing_portals_have_expected_types(self):
        """All 5 expected portal types are present: womb, shadow, heart, ancestral, trauma"""
        response = requests.get(f"{BASE_URL}/api/healing-portals")
        assert response.status_code == 200
        data = response.json()
        
        portal_types = [p["portal_type"] for p in data]
        for expected_type in EXPECTED_PORTAL_TYPES:
            assert expected_type in portal_types, f"Missing portal type: {expected_type}"
        print(f"PASSED: All expected portal types present: {EXPECTED_PORTAL_TYPES}")

    def test_all_portals_are_premium(self):
        """All healing portals should be premium locked"""
        response = requests.get(f"{BASE_URL}/api/healing-portals")
        assert response.status_code == 200
        data = response.json()
        
        for portal in data:
            assert portal.get("is_premium") is True, f"Portal {portal['id']} should be premium"
        print("PASSED: All portals are premium locked")

    def test_filter_by_portal_type_womb(self):
        """GET /api/healing-portals?portal_type=womb returns only womb portal"""
        response = requests.get(f"{BASE_URL}/api/healing-portals?portal_type=womb")
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) == 1, f"Expected 1 womb portal, got {len(data)}"
        assert data[0]["portal_type"] == "womb"
        assert data[0]["id"] == "portal-womb-healing"
        print("PASSED: Filter by portal_type=womb works correctly")

    def test_filter_by_portal_type_shadow(self):
        """GET /api/healing-portals?portal_type=shadow returns only shadow portal"""
        response = requests.get(f"{BASE_URL}/api/healing-portals?portal_type=shadow")
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) == 1, f"Expected 1 shadow portal, got {len(data)}"
        assert data[0]["portal_type"] == "shadow"
        print("PASSED: Filter by portal_type=shadow works correctly")

    def test_filter_by_portal_type_heart(self):
        """GET /api/healing-portals?portal_type=heart returns only heart portal"""
        response = requests.get(f"{BASE_URL}/api/healing-portals?portal_type=heart")
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) == 1, f"Expected 1 heart portal, got {len(data)}"
        assert data[0]["portal_type"] == "heart"
        print("PASSED: Filter by portal_type=heart works correctly")

    def test_filter_by_portal_type_ancestral(self):
        """GET /api/healing-portals?portal_type=ancestral returns only ancestral portal"""
        response = requests.get(f"{BASE_URL}/api/healing-portals?portal_type=ancestral")
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) == 1, f"Expected 1 ancestral portal, got {len(data)}"
        assert data[0]["portal_type"] == "ancestral"
        print("PASSED: Filter by portal_type=ancestral works correctly")

    def test_filter_by_portal_type_trauma(self):
        """GET /api/healing-portals?portal_type=trauma returns only trauma portal"""
        response = requests.get(f"{BASE_URL}/api/healing-portals?portal_type=trauma")
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) == 1, f"Expected 1 trauma portal, got {len(data)}"
        assert data[0]["portal_type"] == "trauma"
        print("PASSED: Filter by portal_type=trauma works correctly")

    def test_get_portal_by_id_heart(self):
        """GET /api/healing-portals/portal-heart-healing returns correct portal"""
        response = requests.get(f"{BASE_URL}/api/healing-portals/portal-heart-healing")
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == "portal-heart-healing"
        assert data["name"] == "Heart Healing Portal"
        assert data["portal_type"] == "heart"
        assert data["element"] == "Water"
        assert data["is_premium"] is True
        print("PASSED: GET /api/healing-portals/portal-heart-healing returns correct data")

    def test_get_portal_by_id_womb(self):
        """GET /api/healing-portals/portal-womb-healing returns correct portal"""
        response = requests.get(f"{BASE_URL}/api/healing-portals/portal-womb-healing")
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == "portal-womb-healing"
        assert data["name"] == "Womb Healing Portal"
        assert data["portal_type"] == "womb"
        print("PASSED: GET /api/healing-portals/portal-womb-healing returns correct data")

    def test_get_portal_by_id_shadow(self):
        """GET /api/healing-portals/portal-shadow-integration returns correct portal"""
        response = requests.get(f"{BASE_URL}/api/healing-portals/portal-shadow-integration")
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == "portal-shadow-integration"
        assert data["name"] == "Shadow Integration Portal"
        assert data["portal_type"] == "shadow"
        print("PASSED: GET /api/healing-portals/portal-shadow-integration returns correct data")

    def test_get_portal_by_id_not_found(self):
        """GET /api/healing-portals/nonexistent returns 404"""
        response = requests.get(f"{BASE_URL}/api/healing-portals/nonexistent-portal-id")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASSED: GET /api/healing-portals/nonexistent returns 404")

    def test_portal_alchemy_teachings_are_lists(self):
        """Portal alchemy_teachings field is a list with content"""
        response = requests.get(f"{BASE_URL}/api/healing-portals/portal-heart-healing")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data["alchemy_teachings"], list)
        assert len(data["alchemy_teachings"]) >= 1, "alchemy_teachings should have at least 1 item"
        print("PASSED: alchemy_teachings is a list with content")

    def test_portal_rituals_are_lists(self):
        """Portal rituals field is a list with content"""
        response = requests.get(f"{BASE_URL}/api/healing-portals/portal-womb-healing")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data["rituals"], list)
        assert len(data["rituals"]) >= 1, "rituals should have at least 1 item"
        print("PASSED: rituals is a list with content")

    def test_portal_ceremonies_are_lists(self):
        """Portal ceremonies field is a list with content"""
        response = requests.get(f"{BASE_URL}/api/healing-portals/portal-shadow-integration")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data["ceremonies"], list)
        assert len(data["ceremonies"]) >= 1, "ceremonies should have at least 1 item"
        print("PASSED: ceremonies is a list with content")

    def test_portal_integration_practices_are_lists(self):
        """Portal integration_practices field is a list with content"""
        response = requests.get(f"{BASE_URL}/api/healing-portals/portal-ancestral-healing")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data["integration_practices"], list)
        assert len(data["integration_practices"]) >= 1, "integration_practices should have at least 1 item"
        print("PASSED: integration_practices is a list with content")

    def test_trauma_portal_has_safety_notes(self):
        """Trauma portal has safety_notes field"""
        response = requests.get(f"{BASE_URL}/api/healing-portals/portal-trauma-release")
        assert response.status_code == 200
        data = response.json()
        
        assert "safety_notes" in data, "Trauma portal should have safety_notes"
        assert len(data["safety_notes"]) > 0, "safety_notes should not be empty"
        print("PASSED: Trauma portal has safety_notes field")

    def test_portal_has_opening_invocation(self):
        """Portals have opening_invocation field"""
        response = requests.get(f"{BASE_URL}/api/healing-portals/portal-heart-healing")
        assert response.status_code == 200
        data = response.json()
        
        assert "opening_invocation" in data
        assert len(data["opening_invocation"]) > 0
        print("PASSED: Portal has opening_invocation field")

    def test_portal_has_content_integrity(self):
        """Portals have content_integrity enrichment"""
        response = requests.get(f"{BASE_URL}/api/healing-portals/portal-womb-healing")
        assert response.status_code == 200
        data = response.json()
        
        assert "content_integrity" in data
        assert "source_type" in data["content_integrity"]
        print("PASSED: Portal has content_integrity enrichment")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
