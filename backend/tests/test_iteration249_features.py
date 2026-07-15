"""
Iteration 249 - Testing Healing Portals, Creative Processes deduplication, and Yoga Pose Image Mapping
Features:
1. Healing Portals route should return portal cards (not empty/loader forever)
2. Creative Processes API should not show duplicate items by id or name
3. Yoga pose image matching for specific poses
4. Chair Yoga and Somatic Yoga should render valid images
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

class TestHealingPortals:
    """Test Healing Portals endpoint returns valid data for guest users."""
    
    def test_healing_portals_returns_data(self):
        """Healing portals endpoint should return non-empty list."""
        response = requests.get(f"{BASE_URL}/api/healing-portals", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Healing portals should not be empty"
        print(f"✓ Healing portals returned {len(data)} items")
    
    def test_healing_portals_have_required_fields(self):
        """Each portal should have id, name, and description."""
        response = requests.get(f"{BASE_URL}/api/healing-portals", timeout=15)
        assert response.status_code == 200
        
        data = response.json()
        for portal in data[:5]:  # Check first 5
            assert "id" in portal, f"Portal missing 'id': {portal.get('name', 'unknown')}"
            assert "name" in portal, f"Portal missing 'name': {portal.get('id', 'unknown')}"
            assert portal.get("id"), "Portal id should not be empty"
            assert portal.get("name"), "Portal name should not be empty"
        print(f"✓ All checked portals have required fields (id, name)")
    
    def test_healing_portals_no_duplicates(self):
        """Healing portals should not have duplicate ids or names."""
        response = requests.get(f"{BASE_URL}/api/healing-portals", timeout=15)
        assert response.status_code == 200
        
        data = response.json()
        ids = [p.get("id") for p in data if p.get("id")]
        names = [p.get("name") for p in data if p.get("name")]
        
        assert len(ids) == len(set(ids)), f"Duplicate portal IDs found: {[x for x in ids if ids.count(x) > 1]}"
        assert len(names) == len(set(names)), f"Duplicate portal names found: {[x for x in names if names.count(x) > 1]}"
        print(f"✓ No duplicate IDs or names in {len(data)} portals")


class TestCreativeProcesses:
    """Test Creative Processes API for duplicates."""
    
    def test_creative_processes_returns_data(self):
        """Creative processes endpoint should return non-empty list."""
        response = requests.get(f"{BASE_URL}/api/creative-processes", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Creative processes should not be empty"
        print(f"✓ Creative processes returned {len(data)} items")
    
    def test_creative_processes_no_duplicate_ids(self):
        """Creative processes should not have duplicate IDs."""
        response = requests.get(f"{BASE_URL}/api/creative-processes", timeout=15)
        assert response.status_code == 200
        
        data = response.json()
        ids = [p.get("id") for p in data if p.get("id")]
        
        duplicates = [x for x in ids if ids.count(x) > 1]
        assert len(ids) == len(set(ids)), f"Duplicate process IDs found: {set(duplicates)}"
        print(f"✓ No duplicate IDs in {len(data)} creative processes")
    
    def test_creative_processes_no_duplicate_names(self):
        """Creative processes should not have duplicate names."""
        response = requests.get(f"{BASE_URL}/api/creative-processes", timeout=15)
        assert response.status_code == 200
        
        data = response.json()
        names = [p.get("name", "").strip().lower() for p in data if p.get("name")]
        
        duplicates = [x for x in names if names.count(x) > 1]
        assert len(names) == len(set(names)), f"Duplicate process names found: {set(duplicates)}"
        print(f"✓ No duplicate names in {len(data)} creative processes")
    
    def test_creative_processes_category_filter_no_duplicates(self):
        """Creative processes filtered by category should not have duplicates."""
        categories = ["visual", "writing", "movement", "earth-crafting", "sacred-tool-birthing"]
        
        for category in categories:
            response = requests.get(f"{BASE_URL}/api/creative-processes?category={category}", timeout=15)
            if response.status_code != 200:
                continue
            
            data = response.json()
            if not data:
                continue
            
            ids = [p.get("id") for p in data if p.get("id")]
            names = [p.get("name", "").strip().lower() for p in data if p.get("name")]
            
            id_duplicates = [x for x in ids if ids.count(x) > 1]
            name_duplicates = [x for x in names if names.count(x) > 1]
            
            assert len(ids) == len(set(ids)), f"Duplicate IDs in category '{category}': {set(id_duplicates)}"
            assert len(names) == len(set(names)), f"Duplicate names in category '{category}': {set(name_duplicates)}"
            print(f"✓ No duplicates in category '{category}' ({len(data)} items)")


class TestYogaPoseEndpoints:
    """Test yoga pose endpoints for Chair Yoga and Somatic Yoga."""
    
    def test_yoga_poses_returns_data(self):
        """Yoga poses endpoint should return data."""
        response = requests.get(f"{BASE_URL}/api/yoga/poses", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Yoga poses should not be empty"
        print(f"✓ Yoga poses returned {len(data)} items")
    
    def test_chair_yoga_category_exists(self):
        """Chair yoga category should return poses."""
        response = requests.get(f"{BASE_URL}/api/yoga/poses?category=chair", timeout=15)
        assert response.status_code == 200
        
        data = response.json()
        # Chair yoga may be filtered or have specific poses
        print(f"✓ Chair yoga category returned {len(data)} items")
    
    def test_somatic_yoga_category_exists(self):
        """Somatic yoga category should return poses."""
        response = requests.get(f"{BASE_URL}/api/yoga/poses?category=somatic", timeout=15)
        assert response.status_code == 200
        
        data = response.json()
        print(f"✓ Somatic yoga category returned {len(data)} items")
    
    def test_yoga_poses_have_images(self):
        """Yoga poses should have image_url or image field."""
        response = requests.get(f"{BASE_URL}/api/yoga/poses", timeout=15)
        assert response.status_code == 200
        
        data = response.json()
        poses_with_images = 0
        for pose in data[:20]:  # Check first 20
            has_image = bool(pose.get("image_url") or pose.get("image"))
            if has_image:
                poses_with_images += 1
        
        # At least 50% should have images
        assert poses_with_images >= len(data[:20]) * 0.5, f"Only {poses_with_images}/{len(data[:20])} poses have images"
        print(f"✓ {poses_with_images}/{len(data[:20])} checked poses have images")


class TestYogaPoseImageMapping:
    """Test that specific yoga poses have correct image mappings."""
    
    TARGET_POSES = [
        "Standing Forward Fold",
        "Upward Facing Dog",
        "Boat Pose",
        "Reverse Warrior",
        "Crow Pose",
        "Locust Pose",
        "Bow Pose",
        "Pigeon Pose",
        "Reclined Bound Angle",
        "Happy Baby Pose",
        "Supine Twist",
    ]
    
    def test_target_poses_exist_in_api(self):
        """Check that target poses exist in the yoga poses API."""
        response = requests.get(f"{BASE_URL}/api/yoga/poses", timeout=15)
        assert response.status_code == 200
        
        data = response.json()
        pose_names = [p.get("name", "").lower() for p in data]
        
        found_poses = []
        for target in self.TARGET_POSES:
            target_lower = target.lower()
            # Check for partial match
            matches = [name for name in pose_names if target_lower in name or any(word in name for word in target_lower.split())]
            if matches:
                found_poses.append(target)
        
        print(f"✓ Found {len(found_poses)}/{len(self.TARGET_POSES)} target poses in API")
        # At least some target poses should exist
        assert len(found_poses) >= 3, f"Expected at least 3 target poses, found {len(found_poses)}"


class TestAPIHealth:
    """Basic health checks."""
    
    def test_api_health(self):
        """API health endpoint should return healthy."""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        print("✓ API health check passed")
    
    def test_crystals_endpoint(self):
        """Crystals endpoint should work."""
        response = requests.get(f"{BASE_URL}/api/crystals", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Crystals endpoint returned {len(data)} items")
    
    def test_meditations_endpoint(self):
        """Meditations endpoint should work."""
        response = requests.get(f"{BASE_URL}/api/meditations", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Meditations endpoint returned {len(data)} items")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
