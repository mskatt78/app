"""
Iteration 150 - Test expanded Wikimedia-verified image overrides for high-risk yoga poses
Tests: Warrior III, Headstand, Shoulder Stand, Plow Pose, Wheel Pose, Firefly Pose, Eight Angle Pose
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# High-risk poses that should have verified Wikimedia images
HIGH_RISK_VERIFIED_POSES = [
    "warrior iii",
    "headstand",
    "shoulder stand",
    "plow pose",
    "wheel pose",
    "firefly pose",
    "eight angle pose",
]

# Previously verified poses (from iteration 149)
PREVIOUSLY_VERIFIED_POSES = [
    "mountain pose",
    "tree pose",
    "warrior i",
    "warrior ii",
    "downward dog",
    "cobra pose",
]


class TestYogaPosesVerifiedOverrides:
    """Test expanded Wikimedia-verified image overrides for yoga poses"""

    @pytest.fixture(scope="class")
    def yoga_poses(self):
        """Fetch all yoga poses once for the test class"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses", timeout=30)
        assert response.status_code == 200, f"Failed to fetch yoga poses: {response.status_code}"
        return response.json()

    def test_yoga_poses_endpoint_returns_data(self, yoga_poses):
        """Verify yoga poses endpoint returns data"""
        assert len(yoga_poses) > 0, "No yoga poses returned"
        print(f"PASS: Yoga poses endpoint returned {len(yoga_poses)} poses")

    def test_warrior_iii_has_verified_image(self, yoga_poses):
        """Warrior III should have Wikimedia Commons verified image"""
        pose = next((p for p in yoga_poses if p.get("name", "").lower() == "warrior iii"), None)
        assert pose is not None, "Warrior III pose not found"
        assert pose.get("image_source") == "wikimedia_commons_verified", f"Warrior III image_source: {pose.get('image_source')}"
        assert "wikimedia" in pose.get("image_url", "").lower(), f"Warrior III image_url not from Wikimedia: {pose.get('image_url')}"
        assert len(pose.get("source_references", [])) > 0, "Warrior III missing source_references"
        print(f"PASS: Warrior III has verified Wikimedia image: {pose.get('image_url')[:60]}...")

    def test_headstand_has_verified_image(self, yoga_poses):
        """Headstand should have Wikimedia Commons verified image"""
        pose = next((p for p in yoga_poses if p.get("name", "").lower() == "headstand"), None)
        assert pose is not None, "Headstand pose not found"
        assert pose.get("image_source") == "wikimedia_commons_verified", f"Headstand image_source: {pose.get('image_source')}"
        assert "wikimedia" in pose.get("image_url", "").lower(), f"Headstand image_url not from Wikimedia: {pose.get('image_url')}"
        assert len(pose.get("source_references", [])) > 0, "Headstand missing source_references"
        print(f"PASS: Headstand has verified Wikimedia image: {pose.get('image_url')[:60]}...")

    def test_shoulder_stand_has_verified_image(self, yoga_poses):
        """Shoulder Stand should have Wikimedia Commons verified image"""
        pose = next((p for p in yoga_poses if p.get("name", "").lower() == "shoulder stand"), None)
        assert pose is not None, "Shoulder Stand pose not found"
        assert pose.get("image_source") == "wikimedia_commons_verified", f"Shoulder Stand image_source: {pose.get('image_source')}"
        assert "wikimedia" in pose.get("image_url", "").lower(), f"Shoulder Stand image_url not from Wikimedia: {pose.get('image_url')}"
        assert len(pose.get("source_references", [])) > 0, "Shoulder Stand missing source_references"
        print(f"PASS: Shoulder Stand has verified Wikimedia image: {pose.get('image_url')[:60]}...")

    def test_plow_pose_has_verified_image(self, yoga_poses):
        """Plow Pose should have Wikimedia Commons verified image"""
        pose = next((p for p in yoga_poses if p.get("name", "").lower() == "plow pose"), None)
        assert pose is not None, "Plow Pose not found"
        assert pose.get("image_source") == "wikimedia_commons_verified", f"Plow Pose image_source: {pose.get('image_source')}"
        assert "wikimedia" in pose.get("image_url", "").lower(), f"Plow Pose image_url not from Wikimedia: {pose.get('image_url')}"
        assert len(pose.get("source_references", [])) > 0, "Plow Pose missing source_references"
        print(f"PASS: Plow Pose has verified Wikimedia image: {pose.get('image_url')[:60]}...")

    def test_wheel_pose_has_verified_image(self, yoga_poses):
        """Wheel Pose should have Wikimedia Commons verified image"""
        pose = next((p for p in yoga_poses if p.get("name", "").lower() == "wheel pose"), None)
        assert pose is not None, "Wheel Pose not found"
        assert pose.get("image_source") == "wikimedia_commons_verified", f"Wheel Pose image_source: {pose.get('image_source')}"
        assert "wikimedia" in pose.get("image_url", "").lower(), f"Wheel Pose image_url not from Wikimedia: {pose.get('image_url')}"
        assert len(pose.get("source_references", [])) > 0, "Wheel Pose missing source_references"
        print(f"PASS: Wheel Pose has verified Wikimedia image: {pose.get('image_url')[:60]}...")

    def test_firefly_pose_has_verified_image(self, yoga_poses):
        """Firefly Pose should have Wikimedia Commons verified image"""
        pose = next((p for p in yoga_poses if p.get("name", "").lower() == "firefly pose"), None)
        assert pose is not None, "Firefly Pose not found"
        assert pose.get("image_source") == "wikimedia_commons_verified", f"Firefly Pose image_source: {pose.get('image_source')}"
        assert "wikimedia" in pose.get("image_url", "").lower(), f"Firefly Pose image_url not from Wikimedia: {pose.get('image_url')}"
        assert len(pose.get("source_references", [])) > 0, "Firefly Pose missing source_references"
        print(f"PASS: Firefly Pose has verified Wikimedia image: {pose.get('image_url')[:60]}...")

    def test_eight_angle_pose_has_verified_image(self, yoga_poses):
        """Eight Angle Pose should have Wikimedia Commons verified image"""
        pose = next((p for p in yoga_poses if p.get("name", "").lower() == "eight angle pose"), None)
        assert pose is not None, "Eight Angle Pose not found"
        assert pose.get("image_source") == "wikimedia_commons_verified", f"Eight Angle Pose image_source: {pose.get('image_source')}"
        assert "wikimedia" in pose.get("image_url", "").lower(), f"Eight Angle Pose image_url not from Wikimedia: {pose.get('image_url')}"
        assert len(pose.get("source_references", [])) > 0, "Eight Angle Pose missing source_references"
        print(f"PASS: Eight Angle Pose has verified Wikimedia image: {pose.get('image_url')[:60]}...")

    def test_verified_poses_have_image_validation_status(self, yoga_poses):
        """Verified poses should have image_validation.status = 'verified'"""
        verified_count = 0
        for pose in yoga_poses:
            if pose.get("image_source") == "wikimedia_commons_verified":
                validation = pose.get("image_validation", {})
                assert validation.get("status") == "verified", f"{pose.get('name')} missing verified status"
                assert validation.get("source_type") == "wikimedia_commons", f"{pose.get('name')} wrong source_type"
                verified_count += 1
        print(f"PASS: {verified_count} poses have verified image_validation status")

    def test_verified_poses_have_content_integrity(self, yoga_poses):
        """Verified poses should have content_integrity.verified = True"""
        for pose in yoga_poses:
            if pose.get("image_source") == "wikimedia_commons_verified":
                integrity = pose.get("content_integrity", {})
                assert integrity.get("verified") is True, f"{pose.get('name')} content_integrity.verified not True"
                assert integrity.get("references_count", 0) > 0, f"{pose.get('name')} has no references_count"
        print("PASS: All verified poses have content_integrity.verified = True")

    def test_previously_verified_poses_still_work(self, yoga_poses):
        """Previously verified poses (from iteration 149) should still have verified images"""
        for pose_name in PREVIOUSLY_VERIFIED_POSES:
            pose = next((p for p in yoga_poses if p.get("name", "").lower() == pose_name), None)
            if pose:
                assert pose.get("image_source") == "wikimedia_commons_verified", f"{pose_name} lost verified status"
                assert "wikimedia" in pose.get("image_url", "").lower(), f"{pose_name} lost Wikimedia URL"
        print(f"PASS: Previously verified poses still have verified images")

    def test_no_regression_pose_count(self, yoga_poses):
        """Yoga poses count should not regress (should be >= 78 from iteration 149)"""
        assert len(yoga_poses) >= 78, f"Pose count regressed: {len(yoga_poses)} < 78"
        print(f"PASS: No regression in pose count ({len(yoga_poses)} poses)")

    def test_all_poses_have_required_fields(self, yoga_poses):
        """All poses should have required fields"""
        required_fields = ["id", "name", "element", "description"]
        for pose in yoga_poses:
            for field in required_fields:
                assert field in pose, f"Pose {pose.get('name', 'unknown')} missing field: {field}"
        print(f"PASS: All {len(yoga_poses)} poses have required fields")


class TestYogaPosesNoRegression:
    """Regression tests for yoga poses endpoint"""

    def test_health_check(self):
        """Health check endpoint should work"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        print("PASS: Health check endpoint working")

    def test_yoga_poses_endpoint_status(self):
        """Yoga poses endpoint should return 200"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses", timeout=30)
        assert response.status_code == 200
        print("PASS: Yoga poses endpoint returns 200")

    def test_yoga_poses_response_is_list(self):
        """Yoga poses response should be a list"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses", timeout=30)
        data = response.json()
        assert isinstance(data, list), f"Response is not a list: {type(data)}"
        print(f"PASS: Yoga poses response is a list with {len(data)} items")
