"""
Iteration 154 - Yoga Verification Complete + Admin Queue Filters
Tests:
1. All 78 yoga poses are verified (0 pending)
2. Fire Log Pose and Frog Pose have verified Wikimedia images
3. Former seated pending entries are now verified
4. Admin yoga verification queue filters work (verification_status, verification_priority)
5. Admin collections endpoint shows correct yoga verification counts
6. No regressions on yoga page, admin dashboard
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
ADMIN_PASSWORD = "ShamanicAdmin2026!"


@pytest.fixture(scope="module")
def admin_session():
    """Get admin session via fallback login"""
    session = requests.Session()
    resp = session.post(
        f"{BASE_URL}/api/admin/login",
        json={"password": ADMIN_PASSWORD},
    )
    assert resp.status_code == 200, f"Admin login failed: {resp.text}"
    return session


class TestYogaPosesVerificationComplete:
    """Test that all yoga poses are now verified with zero pending"""

    def test_health_check(self):
        """Verify API is healthy"""
        resp = requests.get(f"{BASE_URL}/api/health")
        assert resp.status_code == 200

    def test_yoga_poses_returns_200(self):
        """GET /api/yoga/poses returns 200"""
        resp = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert resp.status_code == 200

    def test_total_poses_count_is_78(self):
        """Total poses count is 78"""
        resp = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = resp.json()
        assert len(poses) == 78, f"Expected 78 poses, got {len(poses)}"

    def test_all_poses_verified_zero_pending(self):
        """All 78 poses are verified with zero pending"""
        resp = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = resp.json()
        verified = [p for p in poses if p.get("image_source") == "wikimedia_commons_verified"]
        pending = [p for p in poses if p.get("image_source") == "pending_verification"]
        assert len(verified) == 78, f"Expected 78 verified, got {len(verified)}"
        assert len(pending) == 0, f"Expected 0 pending, got {len(pending)}"


class TestFireLogAndFrogPoseVerified:
    """Test Fire Log Pose and Frog Pose are verified with Wikimedia images"""

    def test_fire_log_pose_verified(self):
        """Fire Log Pose has wikimedia_commons_verified image"""
        resp = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = resp.json()
        pose = next((p for p in poses if p.get("name", "").lower() == "fire log pose"), None)
        assert pose is not None, "Fire Log Pose not found"
        assert pose.get("image_source") == "wikimedia_commons_verified"

    def test_fire_log_pose_has_wikimedia_url(self):
        """Fire Log Pose has Wikimedia image URL"""
        resp = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = resp.json()
        pose = next((p for p in poses if p.get("name", "").lower() == "fire log pose"), None)
        assert pose is not None
        assert "wikimedia.org" in pose.get("image_url", "")

    def test_fire_log_pose_has_source_references(self):
        """Fire Log Pose has source references"""
        resp = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = resp.json()
        pose = next((p for p in poses if p.get("name", "").lower() == "fire log pose"), None)
        assert pose is not None
        refs = pose.get("source_references", [])
        assert len(refs) >= 2, f"Expected 2+ refs, got {len(refs)}"

    def test_frog_pose_verified(self):
        """Frog Pose has wikimedia_commons_verified image"""
        resp = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = resp.json()
        pose = next((p for p in poses if p.get("name", "").lower() == "frog pose"), None)
        assert pose is not None, "Frog Pose not found"
        assert pose.get("image_source") == "wikimedia_commons_verified"

    def test_frog_pose_has_wikimedia_url(self):
        """Frog Pose has Wikimedia image URL"""
        resp = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = resp.json()
        pose = next((p for p in poses if p.get("name", "").lower() == "frog pose"), None)
        assert pose is not None
        assert "wikimedia.org" in pose.get("image_url", "")

    def test_frog_pose_has_source_references(self):
        """Frog Pose has source references"""
        resp = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = resp.json()
        pose = next((p for p in poses if p.get("name", "").lower() == "frog pose"), None)
        assert pose is not None
        refs = pose.get("source_references", [])
        assert len(refs) >= 2, f"Expected 2+ refs, got {len(refs)}"


class TestSeatedPosesVerified:
    """Test that former seated pending entries are now verified"""

    def test_seated_spinal_twist_verified(self):
        """Seated Spinal Twist is verified"""
        resp = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = resp.json()
        pose = next((p for p in poses if p.get("name", "").lower() == "seated spinal twist"), None)
        assert pose is not None
        assert pose.get("image_source") == "wikimedia_commons_verified"

    def test_seated_meditation_verified(self):
        """Seated Meditation is verified"""
        resp = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = resp.json()
        pose = next((p for p in poses if p.get("name", "").lower() == "seated meditation"), None)
        assert pose is not None
        assert pose.get("image_source") == "wikimedia_commons_verified"

    def test_seated_cat_cow_verified(self):
        """Seated Cat-Cow is verified"""
        resp = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = resp.json()
        pose = next((p for p in poses if p.get("name", "").lower() == "seated cat-cow"), None)
        assert pose is not None
        assert pose.get("image_source") == "wikimedia_commons_verified"

    def test_seated_neck_rolls_verified(self):
        """Seated Neck Rolls is verified"""
        resp = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = resp.json()
        pose = next((p for p in poses if p.get("name", "").lower() == "seated neck rolls"), None)
        assert pose is not None
        assert pose.get("image_source") == "wikimedia_commons_verified"


class TestAdminYogaVerificationFilters:
    """Test admin yoga verification queue filters"""

    def test_admin_yoga_items_no_filter(self, admin_session):
        """Admin yoga items returns all 78 poses"""
        resp = admin_session.get(f"{BASE_URL}/api/admin/yoga_poses/items?limit=100")
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("total") == 78

    def test_admin_yoga_verification_summary(self, admin_session):
        """Admin yoga items returns verification_summary"""
        resp = admin_session.get(f"{BASE_URL}/api/admin/yoga_poses/items?limit=5")
        assert resp.status_code == 200
        data = resp.json()
        summary = data.get("verification_summary", {})
        assert summary.get("verified") == 78
        assert summary.get("pending") == 0

    def test_admin_yoga_filter_pending(self, admin_session):
        """Admin yoga filter verification_status=pending returns 0"""
        resp = admin_session.get(f"{BASE_URL}/api/admin/yoga_poses/items?verification_status=pending")
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("total") == 0

    def test_admin_yoga_filter_verified(self, admin_session):
        """Admin yoga filter verification_status=verified returns 78"""
        resp = admin_session.get(f"{BASE_URL}/api/admin/yoga_poses/items?verification_status=verified")
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("total") == 78

    def test_admin_yoga_filter_priority_high(self, admin_session):
        """Admin yoga filter verification_priority=high returns 0 (all verified)"""
        resp = admin_session.get(f"{BASE_URL}/api/admin/yoga_poses/items?verification_priority=high")
        assert resp.status_code == 200
        data = resp.json()
        # Since all are verified, priority filter returns 0
        assert data.get("total") == 0

    def test_admin_yoga_combined_filter(self, admin_session):
        """Admin yoga combined filter pending+high returns 0"""
        resp = admin_session.get(
            f"{BASE_URL}/api/admin/yoga_poses/items?verification_status=pending&verification_priority=high"
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("total") == 0


class TestAdminCollectionsYogaCounts:
    """Test admin collections endpoint shows correct yoga verification counts"""

    def test_admin_collections_yoga_count(self, admin_session):
        """Admin collections shows yoga_poses count=78"""
        resp = admin_session.get(f"{BASE_URL}/api/admin/collections")
        assert resp.status_code == 200
        data = resp.json()
        yoga = next((c for c in data if c.get("id") == "yoga_poses"), None)
        assert yoga is not None
        assert yoga.get("count") == 78

    def test_admin_collections_yoga_verified_count(self, admin_session):
        """Admin collections shows yoga_poses verified_count=78"""
        resp = admin_session.get(f"{BASE_URL}/api/admin/collections")
        assert resp.status_code == 200
        data = resp.json()
        yoga = next((c for c in data if c.get("id") == "yoga_poses"), None)
        assert yoga is not None
        assert yoga.get("verified_count") == 78

    def test_admin_collections_yoga_pending_count(self, admin_session):
        """Admin collections shows yoga_poses pending_count=0"""
        resp = admin_session.get(f"{BASE_URL}/api/admin/collections")
        assert resp.status_code == 200
        data = resp.json()
        yoga = next((c for c in data if c.get("id") == "yoga_poses"), None)
        assert yoga is not None
        assert yoga.get("pending_count") == 0


class TestRegressionChecks:
    """Regression checks for previously verified poses"""

    def test_mountain_pose_still_verified(self):
        """Mountain Pose still verified"""
        resp = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = resp.json()
        pose = next((p for p in poses if p.get("name", "").lower() == "mountain pose"), None)
        assert pose is not None
        assert pose.get("image_source") == "wikimedia_commons_verified"

    def test_tree_pose_still_verified(self):
        """Tree Pose still verified"""
        resp = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = resp.json()
        pose = next((p for p in poses if p.get("name", "").lower() == "tree pose"), None)
        assert pose is not None
        assert pose.get("image_source") == "wikimedia_commons_verified"

    def test_downward_dog_still_verified(self):
        """Downward Dog still verified"""
        resp = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = resp.json()
        pose = next((p for p in poses if "downward" in p.get("name", "").lower()), None)
        assert pose is not None
        assert pose.get("image_source") == "wikimedia_commons_verified"

    def test_all_verified_have_source_references(self):
        """All verified poses have source references"""
        resp = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = resp.json()
        for pose in poses:
            if pose.get("image_source") == "wikimedia_commons_verified":
                refs = pose.get("source_references", [])
                assert len(refs) >= 1, f"{pose.get('name')} missing source_references"

    def test_all_verified_have_wikimedia_urls(self):
        """All verified poses have Wikimedia URLs"""
        resp = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = resp.json()
        for pose in poses:
            if pose.get("image_source") == "wikimedia_commons_verified":
                url = pose.get("image_url", "")
                assert "wikimedia.org" in url, f"{pose.get('name')} missing Wikimedia URL"
