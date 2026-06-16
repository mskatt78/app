"""
Iteration 153 - Yoga Verification Tests
Tests for newly verified poses: Plank Pose, Seated Spinal Twist
Expected counts: total 78, verified 62, pending 16
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestHealthCheck:
    """Basic health check"""

    def test_health_endpoint(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("PASS: Health endpoint returns 200")


class TestYogaPoseCounts:
    """Verify yoga pose counts after new verifications"""

    def test_yoga_poses_endpoint_returns_200(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        print("PASS: /api/yoga/poses returns 200")

    def test_total_poses_count_is_78(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        assert len(poses) == 78, f"Expected 78 poses, got {len(poses)}"
        print(f"PASS: Total poses count is 78 (got {len(poses)})")

    def test_verified_poses_count_is_62(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        verified = [p for p in poses if p.get("image_source") == "wikimedia_commons_verified"]
        assert len(verified) == 62, f"Expected 62 verified poses, got {len(verified)}"
        print(f"PASS: Verified poses count is 62 (got {len(verified)})")

    def test_pending_poses_count_is_16(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        pending = [p for p in poses if p.get("image_source") == "pending_verification"]
        assert len(pending) == 16, f"Expected 16 pending poses, got {len(pending)}"
        print(f"PASS: Pending poses count is 16 (got {len(pending)})")


class TestNewlyVerifiedPoses:
    """Test newly verified poses: Plank Pose and Seated Spinal Twist"""

    def test_plank_pose_is_verified(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        plank = next((p for p in poses if p.get("name", "").lower() == "plank pose"), None)
        assert plank is not None, "Plank Pose not found"
        assert plank.get("image_source") == "wikimedia_commons_verified", f"Plank Pose image_source is {plank.get('image_source')}"
        print("PASS: Plank Pose has image_source='wikimedia_commons_verified'")

    def test_plank_pose_has_wikimedia_image_url(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        plank = next((p for p in poses if p.get("name", "").lower() == "plank pose"), None)
        assert plank is not None, "Plank Pose not found"
        image_url = plank.get("image_url", "")
        assert "wikimedia" in image_url.lower() or "wikipedia" in image_url.lower(), f"Plank Pose image_url is not Wikimedia: {image_url}"
        print(f"PASS: Plank Pose has Wikimedia image URL: {image_url[:80]}...")

    def test_plank_pose_has_source_references(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        plank = next((p for p in poses if p.get("name", "").lower() == "plank pose"), None)
        assert plank is not None, "Plank Pose not found"
        refs = plank.get("source_references", [])
        assert len(refs) >= 2, f"Plank Pose has {len(refs)} source references, expected at least 2"
        print(f"PASS: Plank Pose has {len(refs)} source references")

    def test_plank_pose_content_integrity_verified(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        plank = next((p for p in poses if p.get("name", "").lower() == "plank pose"), None)
        assert plank is not None, "Plank Pose not found"
        integrity = plank.get("content_integrity", {})
        assert integrity.get("verified"), f"Plank Pose content_integrity.verified is {integrity.get('verified')}"
        print("PASS: Plank Pose has content_integrity.verified=True")

    def test_plank_pose_image_validation_status_verified(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        plank = next((p for p in poses if p.get("name", "").lower() == "plank pose"), None)
        assert plank is not None, "Plank Pose not found"
        validation = plank.get("image_validation", {})
        assert validation.get("status") == "verified", f"Plank Pose image_validation.status is {validation.get('status')}"
        print("PASS: Plank Pose has image_validation.status='verified'")

    def test_seated_spinal_twist_is_verified(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        twist = next((p for p in poses if p.get("name", "").lower() == "seated spinal twist"), None)
        assert twist is not None, "Seated Spinal Twist not found"
        assert twist.get("image_source") == "wikimedia_commons_verified", f"Seated Spinal Twist image_source is {twist.get('image_source')}"
        print("PASS: Seated Spinal Twist has image_source='wikimedia_commons_verified'")

    def test_seated_spinal_twist_has_wikimedia_image_url(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        twist = next((p for p in poses if p.get("name", "").lower() == "seated spinal twist"), None)
        assert twist is not None, "Seated Spinal Twist not found"
        image_url = twist.get("image_url", "")
        assert "wikimedia" in image_url.lower() or "wikipedia" in image_url.lower(), f"Seated Spinal Twist image_url is not Wikimedia: {image_url}"
        print(f"PASS: Seated Spinal Twist has Wikimedia image URL: {image_url[:80]}...")

    def test_seated_spinal_twist_has_source_references(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        twist = next((p for p in poses if p.get("name", "").lower() == "seated spinal twist"), None)
        assert twist is not None, "Seated Spinal Twist not found"
        refs = twist.get("source_references", [])
        assert len(refs) >= 2, f"Seated Spinal Twist has {len(refs)} source references, expected at least 2"
        print(f"PASS: Seated Spinal Twist has {len(refs)} source references")

    def test_seated_spinal_twist_content_integrity_verified(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        twist = next((p for p in poses if p.get("name", "").lower() == "seated spinal twist"), None)
        assert twist is not None, "Seated Spinal Twist not found"
        integrity = twist.get("content_integrity", {})
        assert integrity.get("verified"), f"Seated Spinal Twist content_integrity.verified is {integrity.get('verified')}"
        print("PASS: Seated Spinal Twist has content_integrity.verified=True")

    def test_seated_spinal_twist_image_validation_status_verified(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        twist = next((p for p in poses if p.get("name", "").lower() == "seated spinal twist"), None)
        assert twist is not None, "Seated Spinal Twist not found"
        validation = twist.get("image_validation", {})
        assert validation.get("status") == "verified", f"Seated Spinal Twist image_validation.status is {validation.get('status')}"
        print("PASS: Seated Spinal Twist has image_validation.status='verified'")


class TestPendingPosesStructure:
    """Verify pending poses have correct structure"""

    def test_pending_poses_have_pending_review_status(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        pending = [p for p in poses if p.get("image_source") == "pending_verification"]
        for pose in pending:
            validation = pose.get("image_validation", {})
            assert validation.get("status") == "pending_review", f"{pose.get('name')} has status {validation.get('status')}"
        print(f"PASS: All {len(pending)} pending poses have image_validation.status='pending_review'")

    def test_pending_poses_have_priority_field(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        pending = [p for p in poses if p.get("image_source") == "pending_verification"]
        for pose in pending:
            validation = pose.get("image_validation", {})
            assert "priority" in validation, f"{pose.get('name')} missing priority field"
        print(f"PASS: All {len(pending)} pending poses have priority field")


class TestRegressionChecks:
    """Regression checks for previously verified poses"""

    def test_mountain_pose_still_verified(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        mountain = next((p for p in poses if p.get("name", "").lower() == "mountain pose"), None)
        assert mountain is not None, "Mountain Pose not found"
        assert mountain.get("image_source") == "wikimedia_commons_verified"
        print("PASS: Mountain Pose still verified (regression check)")

    def test_tree_pose_still_verified(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        tree = next((p for p in poses if p.get("name", "").lower() == "tree pose"), None)
        assert tree is not None, "Tree Pose not found"
        assert tree.get("image_source") == "wikimedia_commons_verified"
        print("PASS: Tree Pose still verified (regression check)")

    def test_bridge_pose_still_verified(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        bridge = next((p for p in poses if p.get("name", "").lower() == "bridge pose"), None)
        assert bridge is not None, "Bridge Pose not found"
        assert bridge.get("image_source") == "wikimedia_commons_verified"
        print("PASS: Bridge Pose still verified (regression check)")

    def test_happy_baby_pose_still_verified(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        happy_baby = next((p for p in poses if p.get("name", "").lower() == "happy baby pose"), None)
        assert happy_baby is not None, "Happy Baby Pose not found"
        assert happy_baby.get("image_source") == "wikimedia_commons_verified"
        print("PASS: Happy Baby Pose still verified (regression check)")


class TestVerifiedPosesSourceReferences:
    """Verify all verified poses have source references"""

    def test_all_verified_poses_have_source_references(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        verified = [p for p in poses if p.get("image_source") == "wikimedia_commons_verified"]
        for pose in verified:
            refs = pose.get("source_references", [])
            assert len(refs) >= 1, f"{pose.get('name')} has no source references"
        print(f"PASS: All {len(verified)} verified poses have at least 1 source reference")

    def test_verified_poses_have_wikimedia_urls(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        verified = [p for p in poses if p.get("image_source") == "wikimedia_commons_verified"]
        for pose in verified:
            image_url = pose.get("image_url", "")
            assert "wikimedia" in image_url.lower() or "wikipedia" in image_url.lower(), f"{pose.get('name')} has non-Wikimedia URL: {image_url}"
        print(f"PASS: All {len(verified)} verified poses have Wikimedia/Wikipedia image URLs")
