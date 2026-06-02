"""
Iteration 152 - Yoga Verification Tests
Tests for expanded verified yoga entries (Happy Baby, Legs Up the Wall, Reclined Bound Angle, Staff Pose, Seated Meditation)
Expected counts: total 78, verified 60, pending 18
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestYogaVerificationCounts:
    """Test yoga pose counts and verification status"""

    def test_health_check(self):
        """Health check endpoint works"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200

    def test_yoga_poses_endpoint_returns_200(self):
        """Yoga poses endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200

    def test_total_poses_count(self):
        """Total poses count is 78"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        data = response.json()
        assert len(data) == 78, f"Expected 78 poses, got {len(data)}"

    def test_verified_poses_count(self):
        """Verified poses count is 60"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        data = response.json()
        verified = [p for p in data if p.get("image_source") == "wikimedia_commons_verified"]
        assert len(verified) == 60, f"Expected 60 verified, got {len(verified)}"

    def test_pending_poses_count(self):
        """Pending poses count is 18"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        data = response.json()
        pending = [p for p in data if p.get("image_source") == "pending_verification"]
        assert len(pending) == 18, f"Expected 18 pending, got {len(pending)}"


class TestNewlyVerifiedPoses:
    """Test newly verified poses: Happy Baby, Legs Up the Wall, Reclined Bound Angle, Staff Pose, Seated Meditation"""

    @pytest.fixture
    def poses_data(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        return response.json()

    def test_happy_baby_pose_verified(self, poses_data):
        """Happy Baby Pose has Wikimedia Commons verified image"""
        pose = next((p for p in poses_data if p.get("name", "").lower() == "happy baby pose"), None)
        assert pose is not None, "Happy Baby Pose not found"
        assert pose.get("image_source") == "wikimedia_commons_verified"
        assert pose.get("image_validation", {}).get("status") == "verified"
        assert len(pose.get("source_references", [])) >= 2

    def test_legs_up_the_wall_verified(self, poses_data):
        """Legs Up the Wall has Wikimedia Commons verified image"""
        pose = next((p for p in poses_data if p.get("name", "").lower() == "legs up the wall"), None)
        assert pose is not None, "Legs Up the Wall not found"
        assert pose.get("image_source") == "wikimedia_commons_verified"
        assert pose.get("image_validation", {}).get("status") == "verified"
        assert len(pose.get("source_references", [])) >= 2

    def test_reclined_bound_angle_verified(self, poses_data):
        """Reclined Bound Angle has Wikimedia Commons verified image"""
        pose = next((p for p in poses_data if p.get("name", "").lower() == "reclined bound angle"), None)
        assert pose is not None, "Reclined Bound Angle not found"
        assert pose.get("image_source") == "wikimedia_commons_verified"
        assert pose.get("image_validation", {}).get("status") == "verified"
        assert len(pose.get("source_references", [])) >= 2

    def test_staff_pose_verified(self, poses_data):
        """Staff Pose has Wikimedia Commons verified image"""
        pose = next((p for p in poses_data if p.get("name", "").lower() == "staff pose"), None)
        assert pose is not None, "Staff Pose not found"
        assert pose.get("image_source") == "wikimedia_commons_verified"
        assert pose.get("image_validation", {}).get("status") == "verified"
        assert len(pose.get("source_references", [])) >= 2

    def test_seated_meditation_verified(self, poses_data):
        """Seated Meditation has Wikimedia Commons verified image"""
        pose = next((p for p in poses_data if p.get("name", "").lower() == "seated meditation"), None)
        assert pose is not None, "Seated Meditation not found"
        assert pose.get("image_source") == "wikimedia_commons_verified"
        assert pose.get("image_validation", {}).get("status") == "verified"
        assert len(pose.get("source_references", [])) >= 2


class TestPendingPosesStructure:
    """Test pending poses have correct structure"""

    @pytest.fixture
    def pending_poses(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        data = response.json()
        return [p for p in data if p.get("image_source") == "pending_verification"]

    def test_pending_poses_have_pending_review_status(self, pending_poses):
        """All pending poses have status='pending_review'"""
        for pose in pending_poses:
            val = pose.get("image_validation", {})
            assert val.get("status") == "pending_review", f"{pose.get('name')} has wrong status"

    def test_pending_poses_have_priority(self, pending_poses):
        """All pending poses have priority field"""
        for pose in pending_poses:
            val = pose.get("image_validation", {})
            assert val.get("priority") in ["low", "medium", "high"], f"{pose.get('name')} missing priority"


class TestVerifiedPosesStructure:
    """Test verified poses have correct structure"""

    @pytest.fixture
    def verified_poses(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        data = response.json()
        return [p for p in data if p.get("image_source") == "wikimedia_commons_verified"]

    def test_verified_poses_have_content_integrity_verified(self, verified_poses):
        """All verified poses have content_integrity.verified=True"""
        for pose in verified_poses:
            ci = pose.get("content_integrity", {})
            assert ci.get("verified") is True, f"{pose.get('name')} content_integrity.verified is not True"

    def test_verified_poses_have_source_references(self, verified_poses):
        """All verified poses have at least 2 source references"""
        for pose in verified_poses:
            refs = pose.get("source_references", [])
            assert len(refs) >= 2, f"{pose.get('name')} has {len(refs)} refs, expected >= 2"

    def test_verified_poses_have_wikimedia_image_urls(self, verified_poses):
        """All verified poses have Wikimedia image URLs"""
        for pose in verified_poses:
            img_url = pose.get("image_url", "")
            assert "wikimedia" in img_url.lower() or "wikipedia" in img_url.lower(), \
                f"{pose.get('name')} image_url is not from Wikimedia: {img_url}"


class TestRegressionChecks:
    """Regression checks for previously verified poses"""

    @pytest.fixture
    def poses_data(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        return response.json()

    def test_mountain_pose_still_verified(self, poses_data):
        """Mountain Pose still verified (regression check)"""
        pose = next((p for p in poses_data if p.get("name", "").lower() == "mountain pose"), None)
        assert pose is not None
        assert pose.get("image_source") == "wikimedia_commons_verified"

    def test_tree_pose_still_verified(self, poses_data):
        """Tree Pose still verified (regression check)"""
        pose = next((p for p in poses_data if p.get("name", "").lower() == "tree pose"), None)
        assert pose is not None
        assert pose.get("image_source") == "wikimedia_commons_verified"

    def test_warrior_poses_still_verified(self, poses_data):
        """Warrior I, II, III still verified (regression check)"""
        for warrior in ["warrior i", "warrior ii", "warrior iii"]:
            pose = next((p for p in poses_data if p.get("name", "").lower() == warrior), None)
            assert pose is not None, f"{warrior} not found"
            assert pose.get("image_source") == "wikimedia_commons_verified", f"{warrior} not verified"

    def test_bridge_pose_still_verified(self, poses_data):
        """Bridge Pose still verified (regression check)"""
        pose = next((p for p in poses_data if p.get("name", "").lower() == "bridge pose"), None)
        assert pose is not None
        assert pose.get("image_source") == "wikimedia_commons_verified"
