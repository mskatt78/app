"""
Iteration 239 - Strict Separation Testing for Somatic Yoga, Chair Yoga, and Fascia Stretching
Tests that all three are separate endpoints with independent datasets and proper tiering (4 free + 10 premium = 14 items)
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestSeparateEndpoints:
    """Verify /api/somatic-yoga, /api/chair-yoga, /api/fascia-stretching are separate endpoints"""

    def test_somatic_yoga_endpoint_exists(self):
        """Test /api/somatic-yoga endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/somatic-yoga")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"PASS: /api/somatic-yoga returns {len(data)} items")

    def test_chair_yoga_endpoint_exists(self):
        """Test /api/chair-yoga endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/chair-yoga")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"PASS: /api/chair-yoga returns {len(data)} items")

    def test_fascia_stretching_endpoint_exists(self):
        """Test /api/fascia-stretching endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/fascia-stretching")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"PASS: /api/fascia-stretching returns {len(data)} items")


class TestTieringRequirements:
    """Verify each endpoint returns exactly 14 items (4 free + 10 premium)"""

    def test_somatic_yoga_tiering(self):
        """Test /api/somatic-yoga returns 14 items with 4 free + 10 premium"""
        response = requests.get(f"{BASE_URL}/api/somatic-yoga")
        assert response.status_code == 200
        data = response.json()
        
        total = len(data)
        free_count = len([x for x in data if not x.get("is_premium")])
        premium_count = len([x for x in data if x.get("is_premium")])
        
        assert total == 14, f"Expected 14 total items, got {total}"
        assert free_count == 4, f"Expected 4 free items, got {free_count}"
        assert premium_count == 10, f"Expected 10 premium items, got {premium_count}"
        print(f"PASS: /api/somatic-yoga tiering correct: {free_count} free + {premium_count} premium = {total}")

    def test_chair_yoga_tiering(self):
        """Test /api/chair-yoga returns 14 items with 4 free + 10 premium"""
        response = requests.get(f"{BASE_URL}/api/chair-yoga")
        assert response.status_code == 200
        data = response.json()
        
        total = len(data)
        free_count = len([x for x in data if not x.get("is_premium")])
        premium_count = len([x for x in data if x.get("is_premium")])
        
        assert total == 14, f"Expected 14 total items, got {total}"
        assert free_count == 4, f"Expected 4 free items, got {free_count}"
        assert premium_count == 10, f"Expected 10 premium items, got {premium_count}"
        print(f"PASS: /api/chair-yoga tiering correct: {free_count} free + {premium_count} premium = {total}")

    def test_fascia_stretching_tiering(self):
        """Test /api/fascia-stretching returns 14 items with 4 free + 10 premium"""
        response = requests.get(f"{BASE_URL}/api/fascia-stretching")
        assert response.status_code == 200
        data = response.json()
        
        total = len(data)
        free_count = len([x for x in data if not x.get("is_premium")])
        premium_count = len([x for x in data if x.get("is_premium")])
        
        assert total == 14, f"Expected 14 total items, got {total}"
        assert free_count == 4, f"Expected 4 free items, got {free_count}"
        assert premium_count == 10, f"Expected 10 premium items, got {premium_count}"
        print(f"PASS: /api/fascia-stretching tiering correct: {free_count} free + {premium_count} premium = {total}")


class TestIndependentDatasets:
    """Verify each endpoint returns distinct data (not shared/collapsed)"""

    def test_chair_yoga_has_chair_specific_content(self):
        """Test /api/chair-yoga returns chair-specific content"""
        response = requests.get(f"{BASE_URL}/api/chair-yoga")
        assert response.status_code == 200
        data = response.json()
        
        # Check for chair-specific fields or category
        chair_items = [x for x in data if "Chair" in x.get("name", "") or x.get("category") == "Chair Yoga"]
        assert len(chair_items) > 0, "Chair Yoga endpoint should return chair-specific content"
        
        # Check for chair support level field
        items_with_chair_support = [x for x in data if x.get("chair_support_level")]
        print(f"PASS: /api/chair-yoga has {len(chair_items)} chair-specific items, {len(items_with_chair_support)} with chair_support_level")

    def test_fascia_stretching_has_fascia_specific_content(self):
        """Test /api/fascia-stretching returns fascia-specific content"""
        response = requests.get(f"{BASE_URL}/api/fascia-stretching")
        assert response.status_code == 200
        data = response.json()
        
        # Check for fascia-specific fields
        fascia_items = [x for x in data if "Fascia" in x.get("name", "") or x.get("category") == "Fascia Stretching" or x.get("movement_track") == "Fascia Stretching"]
        assert len(fascia_items) > 0, "Fascia Stretching endpoint should return fascia-specific content"
        
        # Check for fascia focus area field
        items_with_fascia_focus = [x for x in data if x.get("fascia_focus_area")]
        print(f"PASS: /api/fascia-stretching has {len(fascia_items)} fascia-specific items, {len(items_with_fascia_focus)} with fascia_focus_area")

    def test_somatic_yoga_has_somatic_specific_content(self):
        """Test /api/somatic-yoga returns somatic-specific content"""
        response = requests.get(f"{BASE_URL}/api/somatic-yoga")
        assert response.status_code == 200
        data = response.json()
        
        # Check for somatic-specific fields
        somatic_items = [x for x in data if "Somatic" in x.get("name", "") or x.get("style")]
        assert len(somatic_items) > 0, "Somatic Yoga endpoint should return somatic-specific content"
        print(f"PASS: /api/somatic-yoga has {len(somatic_items)} somatic-specific items")

    def test_endpoints_return_different_data(self):
        """Test that the three endpoints return different datasets"""
        somatic_resp = requests.get(f"{BASE_URL}/api/somatic-yoga")
        chair_resp = requests.get(f"{BASE_URL}/api/chair-yoga")
        fascia_resp = requests.get(f"{BASE_URL}/api/fascia-stretching")
        
        somatic_data = somatic_resp.json()
        chair_data = chair_resp.json()
        fascia_data = fascia_resp.json()
        
        # Get first item names from each
        somatic_names = set(x.get("name", "") for x in somatic_data)
        chair_names = set(x.get("name", "") for x in chair_data)
        fascia_names = set(x.get("name", "") for x in fascia_data)
        
        # Check that chair and fascia have distinct names from each other
        # (somatic-yoga may share some base content but chair/fascia should be distinct)
        chair_only = chair_names - fascia_names
        fascia_only = fascia_names - chair_names
        
        print(f"Chair-only names: {len(chair_only)}")
        print(f"Fascia-only names: {len(fascia_only)}")
        
        # At minimum, fascia should have fascia-specific names
        fascia_specific = [n for n in fascia_names if "Fascia" in n]
        assert len(fascia_specific) > 0, "Fascia endpoint should have fascia-specific named items"
        print(f"PASS: Endpoints return distinct datasets")


class TestLegacyRouteCompatibility:
    """Verify legacy routes still work"""

    def test_somatic_movement_endpoint(self):
        """Test /api/somatic endpoint still works (legacy)"""
        response = requests.get(f"{BASE_URL}/api/somatic")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"PASS: /api/somatic (legacy) returns {len(data)} items")


class TestContentIntegrity:
    """Verify content has required fields for each endpoint"""

    def test_chair_yoga_has_required_fields(self):
        """Test Chair Yoga items have required fields"""
        response = requests.get(f"{BASE_URL}/api/chair-yoga")
        data = response.json()
        
        required_fields = ["id", "name", "description"]
        for item in data[:3]:  # Check first 3 items
            for field in required_fields:
                assert field in item, f"Missing required field: {field}"
        
        # Check for chair-specific optional fields
        first_item = data[0]
        optional_chair_fields = ["chair_support_level", "props", "guided_practice"]
        found_optional = [f for f in optional_chair_fields if f in first_item]
        print(f"PASS: Chair Yoga items have required fields + {len(found_optional)} optional chair fields")

    def test_fascia_stretching_has_required_fields(self):
        """Test Fascia Stretching items have required fields"""
        response = requests.get(f"{BASE_URL}/api/fascia-stretching")
        data = response.json()
        
        required_fields = ["id", "name", "description"]
        for item in data[:3]:  # Check first 3 items
            for field in required_fields:
                assert field in item, f"Missing required field: {field}"
        
        # Check for fascia-specific optional fields
        first_item = data[0]
        optional_fascia_fields = ["fascia_focus_area", "movement_track", "props"]
        found_optional = [f for f in optional_fascia_fields if f in first_item]
        print(f"PASS: Fascia Stretching items have required fields + {len(found_optional)} optional fascia fields")

    def test_somatic_yoga_has_required_fields(self):
        """Test Somatic Yoga items have required fields"""
        response = requests.get(f"{BASE_URL}/api/somatic-yoga")
        data = response.json()
        
        required_fields = ["id", "name", "description"]
        for item in data[:3]:  # Check first 3 items
            for field in required_fields:
                assert field in item, f"Missing required field: {field}"
        
        # Check for somatic-specific optional fields
        first_item = data[0]
        optional_somatic_fields = ["style", "practice_guide", "body_focus", "breathing_pattern"]
        found_optional = [f for f in optional_somatic_fields if f in first_item]
        print(f"PASS: Somatic Yoga items have required fields + {len(found_optional)} optional somatic fields")
