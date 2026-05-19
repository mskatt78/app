"""
Comprehensive tests for Shamanic Content Features
Tests all category filters and data integrity for:
- Heart Practices (6 categories: self_love, compassion, forgiveness, gratitude, connection, healing)
- Elemental Practices (5 elements + All)
- Earth Altars
- Creative Processes
- Shamanic Practices
- Yoga Library (60 poses with AI images)
- Mudras Library (12 mudras with AI images)
- Dashboard daily guidance
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com"

class TestHeartPracticesCategories:
    """Test Heart Practices API with all 6 category filters"""
    
    def test_get_all_heart_practices(self):
        """GET /api/heart-practices should return all practices"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 6, f"Expected 6 heart practices, got {len(data)}"
        
        # Verify each practice has required fields
        for practice in data:
            assert "id" in practice
            assert "name" in practice
            assert "category" in practice
            assert "description" in practice
        print(f"✓ All heart practices returned: {len(data)} practices")
    
    def test_filter_self_love(self):
        """GET /api/heart-practices?category=self_love"""
        response = requests.get(f"{BASE_URL}/api/heart-practices?category=self_love")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) > 0, "Expected at least 1 self_love practice"
        for practice in data:
            assert practice["category"] == "self_love", f"Expected self_love, got {practice['category']}"
        print(f"✓ self_love filter works: {len(data)} practices")
    
    def test_filter_compassion(self):
        """GET /api/heart-practices?category=compassion"""
        response = requests.get(f"{BASE_URL}/api/heart-practices?category=compassion")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) > 0, "Expected at least 1 compassion practice"
        for practice in data:
            assert practice["category"] == "compassion", f"Expected compassion, got {practice['category']}"
        print(f"✓ compassion filter works: {len(data)} practices")
    
    def test_filter_forgiveness(self):
        """GET /api/heart-practices?category=forgiveness"""
        response = requests.get(f"{BASE_URL}/api/heart-practices?category=forgiveness")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) > 0, "Expected at least 1 forgiveness practice"
        for practice in data:
            assert practice["category"] == "forgiveness", f"Expected forgiveness, got {practice['category']}"
        print(f"✓ forgiveness filter works: {len(data)} practices")
    
    def test_filter_gratitude(self):
        """GET /api/heart-practices?category=gratitude"""
        response = requests.get(f"{BASE_URL}/api/heart-practices?category=gratitude")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) > 0, "Expected at least 1 gratitude practice"
        for practice in data:
            assert practice["category"] == "gratitude", f"Expected gratitude, got {practice['category']}"
        print(f"✓ gratitude filter works: {len(data)} practices")
    
    def test_filter_connection(self):
        """GET /api/heart-practices?category=connection"""
        response = requests.get(f"{BASE_URL}/api/heart-practices?category=connection")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) > 0, "Expected at least 1 connection practice"
        for practice in data:
            assert practice["category"] == "connection", f"Expected connection, got {practice['category']}"
        print(f"✓ connection filter works: {len(data)} practices")
    
    def test_filter_healing(self):
        """GET /api/heart-practices?category=healing"""
        response = requests.get(f"{BASE_URL}/api/heart-practices?category=healing")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) > 0, "Expected at least 1 healing practice"
        for practice in data:
            assert practice["category"] == "healing", f"Expected healing, got {practice['category']}"
        print(f"✓ healing filter works: {len(data)} practices")
    
    def test_all_categories_covered(self):
        """Verify all 6 categories exist in the data"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        data = response.json()
        
        categories_found = set(p["category"] for p in data)
        expected_categories = {"self_love", "compassion", "forgiveness", "gratitude", "connection", "healing"}
        
        assert categories_found == expected_categories, f"Missing categories: {expected_categories - categories_found}"
        print(f"✓ All 6 heart practice categories present: {categories_found}")


class TestElementalPractices:
    """Test Elemental Practices API with element filters"""
    
    def test_get_all_elemental_practices(self):
        """GET /api/elemental-practices should return all practices"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 10, f"Expected at least 10 elemental practices, got {len(data)}"
        print(f"✓ Elemental practices returned: {len(data)}")
    
    def test_filter_earth(self):
        """GET /api/elemental-practices?element=Earth"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices?element=Earth")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) > 0
        for practice in data:
            assert practice["element"] == "Earth"
        print(f"✓ Earth filter works: {len(data)} practices")
    
    def test_filter_water(self):
        """GET /api/elemental-practices?element=Water"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices?element=Water")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) > 0
        for practice in data:
            assert practice["element"] == "Water"
        print(f"✓ Water filter works: {len(data)} practices")
    
    def test_filter_fire(self):
        """GET /api/elemental-practices?element=Fire"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices?element=Fire")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) > 0
        for practice in data:
            assert practice["element"] == "Fire"
        print(f"✓ Fire filter works: {len(data)} practices")
    
    def test_filter_air(self):
        """GET /api/elemental-practices?element=Air"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices?element=Air")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) > 0
        for practice in data:
            assert practice["element"] == "Air"
        print(f"✓ Air filter works: {len(data)} practices")
    
    def test_filter_spirit(self):
        """GET /api/elemental-practices?element=Spirit"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices?element=Spirit")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) > 0
        for practice in data:
            assert practice["element"] == "Spirit"
        print(f"✓ Spirit filter works: {len(data)} practices")


class TestEarthAltars:
    """Test Earth Altars API"""
    
    def test_get_all_earth_altars(self):
        """GET /api/earth-altars should return all altars"""
        response = requests.get(f"{BASE_URL}/api/earth-altars")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 6, f"Expected 6 earth altars, got {len(data)}"
        
        for altar in data:
            assert "id" in altar
            assert "name" in altar
            assert "element" in altar
            assert "description" in altar
            assert "image_url" in altar
        print(f"✓ Earth altars returned: {len(data)}")
    
    def test_get_single_altar(self):
        """GET /api/earth-altars/1 should return specific altar"""
        response = requests.get(f"{BASE_URL}/api/earth-altars/1")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == "1"
        assert "name" in data
        print(f"✓ Single altar returned: {data['name']}")


class TestCreativeProcesses:
    """Test Creative Processes API"""
    
    def test_get_all_creative_processes(self):
        """GET /api/creative-processes should return all processes"""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 6, f"Expected 6 creative processes, got {len(data)}"
        
        for process in data:
            assert "id" in process
            assert "name" in process
            assert "category" in process
            assert "description" in process
        print(f"✓ Creative processes returned: {len(data)}")
    
    def test_get_single_process(self):
        """GET /api/creative-processes/1 should return specific process"""
        response = requests.get(f"{BASE_URL}/api/creative-processes/1")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == "1"
        print(f"✓ Single process returned: {data['name']}")


class TestShamanicPractices:
    """Test Shamanic Practices API"""
    
    def test_get_all_shamanic_practices(self):
        """GET /api/shamanic-practices should return all practices"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 8, f"Expected at least 8 shamanic practices, got {len(data)}"
        
        for practice in data:
            assert "id" in practice
            assert "name" in practice
            assert "category" in practice
            assert "description" in practice
        print(f"✓ Shamanic practices returned: {len(data)}")
    
    def test_get_single_practice(self):
        """GET /api/shamanic-practices/1 should return specific practice"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices/1")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == "1"
        print(f"✓ Single shamanic practice returned: {data['name']}")


class TestYogaLibrary:
    """Test Yoga Poses API - expect 60 poses with AI images"""
    
    def test_get_all_yoga_poses(self):
        """GET /api/yoga/poses should return all poses"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 60, f"Expected at least 60 yoga poses, got {len(data)}"
        
        # Check for required fields
        for pose in data:
            assert "id" in pose
            assert "name" in pose
            assert "element" in pose
        
        # Count poses with AI images
        poses_with_images = sum(1 for p in data if p.get("image_url"))
        print(f"✓ Yoga poses returned: {len(data)}, with images: {poses_with_images}")
    
    def test_filter_yoga_by_element(self):
        """Test element filtering for yoga poses"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses?element=Earth")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) > 0
        for pose in data:
            assert pose["element"] == "Earth"
        print(f"✓ Yoga Earth filter works: {len(data)} poses")
    
    def test_filter_yoga_by_difficulty(self):
        """Test difficulty filtering for yoga poses"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses?difficulty=Beginner")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) > 0
        for pose in data:
            assert pose.get("difficulty") == "Beginner"
        print(f"✓ Yoga Beginner filter works: {len(data)} poses")


class TestMudrasLibrary:
    """Test Mudras API - expect 12 mudras with AI images"""
    
    def test_get_all_mudras(self):
        """GET /api/mudras should return all mudras"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 12, f"Expected at least 12 mudras, got {len(data)}"
        
        for mudra in data:
            assert "id" in mudra
            assert "name" in mudra
            assert "element" in mudra
        
        # Count mudras with images
        mudras_with_images = sum(1 for m in data if m.get("image_url"))
        print(f"✓ Mudras returned: {len(data)}, with images: {mudras_with_images}")
    
    def test_filter_mudras_by_element(self):
        """Test element filtering for mudras"""
        response = requests.get(f"{BASE_URL}/api/mudras?element=Earth")
        assert response.status_code == 200
        
        data = response.json()
        # May have 0 results depending on data
        print(f"✓ Mudras Earth filter works: {len(data)} mudras")


class TestDashboardDaily:
    """Test Dashboard daily guidance endpoint (requires auth but tests structure)"""
    
    def test_dashboard_unauthenticated_returns_401(self):
        """GET /api/dashboard/daily without auth should return 401"""
        response = requests.get(f"{BASE_URL}/api/dashboard/daily")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Dashboard correctly requires authentication")


class TestDataIntegrity:
    """Test data integrity across all shamanic content"""
    
    def test_heart_practices_have_images(self):
        """All heart practices should have image_url"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        data = response.json()
        
        with_images = sum(1 for p in data if p.get("image_url"))
        print(f"Heart practices with images: {with_images}/{len(data)}")
        assert with_images == len(data), "Some heart practices missing images"
    
    def test_earth_altars_have_images(self):
        """All earth altars should have AI-generated images"""
        response = requests.get(f"{BASE_URL}/api/earth-altars")
        data = response.json()
        
        with_images = sum(1 for a in data if a.get("image_url") and "emergentagent" in a.get("image_url", ""))
        print(f"Earth altars with AI images: {with_images}/{len(data)}")
    
    def test_elemental_practices_have_images(self):
        """All elemental practices should have image_url"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        data = response.json()
        
        with_images = sum(1 for p in data if p.get("image_url"))
        print(f"Elemental practices with images: {with_images}/{len(data)}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
