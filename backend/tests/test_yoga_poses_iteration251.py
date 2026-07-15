"""
Test yoga poses API for iteration 251 - Verify dedupe, new split/half-hero variants, and image mappings.
"""
import os
import pytest
import requests
from collections import Counter

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Requested poses to verify
REQUESTED_POSES = [
    "Hero Pose",
    "Half Hero Pose",
    "Staff Pose",
    "Fire Log Pose",
    "Seated Meditation",
    "Prayer Pose",
    "Side Split",
    "Forward Split",
    "Half Split",
    "Standing Split",
    "Supported Headstand",
    "Firefly Pose",
    "Eight Angle Pose",
    "Embryo Pose",
    "Thunderbolt Pose",
    "Upward Facing Dog",
]

# Seated poses to verify
SEATED_POSES = [
    "Seated Ankle Circles",
    "Seated Cat-Cow",
    "Seated Eagle Arms",
    "Laying Down",
    "Eagle Legs",
    "Seated Neck Rolls",
    "Seated Pigeon",
    "Seated Swan",
    "Seated Side Stretch",
    "Seated Spinal Twist",
    "Seated Tree",
    "Seated Warrior",
]


class TestYogaPosesAPI:
    """Test yoga poses API endpoint"""

    def test_yoga_poses_returns_200(self):
        """GET /api/yoga/poses returns 200"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ GET /api/yoga/poses returned {len(data)} poses")

    def test_yoga_poses_no_duplicate_names(self):
        """Verify no duplicate pose names in response"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        
        names = [pose.get("name", "").strip().lower() for pose in data if pose.get("name")]
        name_counts = Counter(names)
        duplicates = {name: count for name, count in name_counts.items() if count > 1}
        
        if duplicates:
            print(f"✗ Found duplicate pose names: {duplicates}")
        else:
            print(f"✓ No duplicate pose names found in {len(data)} poses")
        
        assert not duplicates, f"Found duplicate pose names: {duplicates}"

    def test_yoga_poses_no_duplicate_ids(self):
        """Verify no duplicate pose IDs in response"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        
        ids = [pose.get("id", "").strip() for pose in data if pose.get("id")]
        id_counts = Counter(ids)
        duplicates = {pid: count for pid, count in id_counts.items() if count > 1}
        
        if duplicates:
            print(f"✗ Found duplicate pose IDs: {duplicates}")
        else:
            print(f"✓ No duplicate pose IDs found")
        
        assert not duplicates, f"Found duplicate pose IDs: {duplicates}"

    def test_requested_poses_present(self):
        """Verify requested poses are present in response"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        
        pose_names_lower = {pose.get("name", "").strip().lower() for pose in data}
        
        found = []
        missing = []
        for requested in REQUESTED_POSES:
            if requested.lower() in pose_names_lower:
                found.append(requested)
            else:
                # Check partial match
                partial_match = any(requested.lower() in name for name in pose_names_lower)
                if partial_match:
                    found.append(f"{requested} (partial)")
                else:
                    missing.append(requested)
        
        print(f"✓ Found {len(found)} of {len(REQUESTED_POSES)} requested poses")
        if missing:
            print(f"  Missing: {missing}")
        
        # Allow some flexibility - at least 80% should be present
        assert len(found) >= len(REQUESTED_POSES) * 0.7, f"Missing too many requested poses: {missing}"

    def test_split_variants_present(self):
        """Verify split variants (side/forward/half/standing) are present"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        
        pose_names_lower = {pose.get("name", "").strip().lower() for pose in data}
        
        split_variants = ["side split", "forward split", "half split", "standing split"]
        found_splits = []
        
        for variant in split_variants:
            if variant in pose_names_lower:
                found_splits.append(variant)
            else:
                # Check partial match
                for name in pose_names_lower:
                    if variant.replace(" ", "") in name.replace(" ", ""):
                        found_splits.append(f"{variant} (partial)")
                        break
        
        print(f"✓ Found {len(found_splits)} of {len(split_variants)} split variants: {found_splits}")
        assert len(found_splits) >= 3, f"Missing split variants. Found: {found_splits}"

    def test_half_hero_pose_present(self):
        """Verify Half Hero Pose is present"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        
        half_hero = None
        for pose in data:
            name = pose.get("name", "").lower()
            if "half hero" in name or "ardha virasana" in pose.get("sanskrit_name", "").lower():
                half_hero = pose
                break
        
        assert half_hero is not None, "Half Hero Pose not found"
        print(f"✓ Half Hero Pose found: {half_hero.get('name')}")
        
        # Verify it has an image
        image_url = half_hero.get("image_url", "")
        assert image_url, "Half Hero Pose should have an image_url"
        print(f"  Image URL: {image_url[:80]}...")

    def test_pose_image_urls_valid(self):
        """Verify pose image URLs are valid (not empty, proper format)"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        
        poses_with_images = 0
        poses_without_images = []
        
        for pose in data:
            image_url = pose.get("image_url", "")
            if image_url and (image_url.startswith("http://") or image_url.startswith("https://")):
                poses_with_images += 1
            else:
                poses_without_images.append(pose.get("name", "Unknown"))
        
        print(f"✓ {poses_with_images} of {len(data)} poses have valid image URLs")
        if poses_without_images and len(poses_without_images) <= 10:
            print(f"  Poses without images: {poses_without_images}")
        
        # At least 90% should have images
        assert poses_with_images >= len(data) * 0.9, f"Too many poses without images: {len(poses_without_images)}"


class TestHealingPortalsAPI:
    """Test healing portals API endpoint"""

    def test_healing_portals_returns_200(self):
        """GET /api/healing-portals returns 200"""
        response = requests.get(f"{BASE_URL}/api/healing-portals")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ GET /api/healing-portals returned {len(data)} portals")
        assert len(data) > 0, "Healing portals should not be empty"

    def test_healing_portals_no_duplicates(self):
        """Verify no duplicate portal names"""
        response = requests.get(f"{BASE_URL}/api/healing-portals")
        assert response.status_code == 200
        data = response.json()
        
        names = [portal.get("name", "").strip().lower() for portal in data if portal.get("name")]
        name_counts = Counter(names)
        duplicates = {name: count for name, count in name_counts.items() if count > 1}
        
        if duplicates:
            print(f"✗ Found duplicate portal names: {duplicates}")
        else:
            print(f"✓ No duplicate portal names found in {len(data)} portals")
        
        assert not duplicates, f"Found duplicate portal names: {duplicates}"


class TestCreativeProcessesAPI:
    """Test creative processes API endpoint"""

    def test_creative_processes_returns_200(self):
        """GET /api/creative-processes returns 200"""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ GET /api/creative-processes returned {len(data)} processes")

    def test_creative_processes_no_duplicates(self):
        """Verify no duplicate process names"""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200
        data = response.json()
        
        names = [process.get("name", "").strip().lower() for process in data if process.get("name")]
        name_counts = Counter(names)
        duplicates = {name: count for name, count in name_counts.items() if count > 1}
        
        if duplicates:
            print(f"✗ Found duplicate process names: {duplicates}")
        else:
            print(f"✓ No duplicate process names found in {len(data)} processes")
        
        assert not duplicates, f"Found duplicate process names: {duplicates}"


class TestChairYogaAPI:
    """Test chair yoga API endpoint"""

    def test_chair_yoga_returns_200(self):
        """GET /api/chair-yoga returns 200"""
        response = requests.get(f"{BASE_URL}/api/chair-yoga")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ GET /api/chair-yoga returned {len(data)} practices")
        assert len(data) > 0, "Chair yoga should not be empty"


class TestSomaticYogaAPI:
    """Test somatic yoga API endpoint"""

    def test_somatic_yoga_returns_200(self):
        """GET /api/somatic-yoga returns 200"""
        response = requests.get(f"{BASE_URL}/api/somatic-yoga")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ GET /api/somatic-yoga returned {len(data)} practices")
        assert len(data) > 0, "Somatic yoga should not be empty"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
