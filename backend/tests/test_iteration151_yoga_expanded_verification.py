"""
Iteration 151 - Test expanded yoga Wikimedia override coverage
Tests for additional beginner/high-mismatch poses verification
"""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestYogaExpandedVerification:
    """Test expanded yoga Wikimedia override coverage"""
    
    def test_health_check(self):
        """Verify API is accessible"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
    
    def test_yoga_poses_endpoint_returns_200(self):
        """Verify yoga poses endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_yoga_poses_count(self):
        """Verify total pose count is 78"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        assert len(poses) == 78, f"Expected 78 poses, got {len(poses)}"
    
    def test_verified_count_is_55(self):
        """Verify 55 poses are verified (expanded from previous iteration)"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        verified = [p for p in poses if p.get('image_source') == 'wikimedia_commons_verified']
        assert len(verified) == 55, f"Expected 55 verified poses, got {len(verified)}"
    
    def test_unverified_count_is_23(self):
        """Verify 23 poses remain unverified"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        unverified = [p for p in poses if p.get('image_source') != 'wikimedia_commons_verified']
        assert len(unverified) == 23, f"Expected 23 unverified poses, got {len(unverified)}"
    
    # Test newly verified beginner/high-mismatch poses
    def test_bridge_pose_verified(self):
        """Bridge Pose should be verified with Wikimedia image"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        bridge = [p for p in poses if p.get('name', '').lower() == 'bridge pose']
        assert len(bridge) > 0, "Bridge Pose not found"
        pose = bridge[0]
        assert pose.get('image_source') == 'wikimedia_commons_verified'
        assert len(pose.get('source_references', [])) >= 2
        assert 'wikimedia' in pose.get('image_url', '').lower() or 'wikipedia' in pose.get('image_url', '').lower()
    
    def test_cat_cow_flow_verified(self):
        """Cat-Cow Flow should be verified with Wikimedia image"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        cat_cow = [p for p in poses if 'cat-cow' in p.get('name', '').lower() or 'cat cow' in p.get('name', '').lower()]
        assert len(cat_cow) > 0, "Cat-Cow Flow not found"
        pose = cat_cow[0]
        assert pose.get('image_source') == 'wikimedia_commons_verified'
        assert len(pose.get('source_references', [])) >= 2
    
    def test_corpse_pose_verified(self):
        """Corpse Pose should be verified with Wikimedia image"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        corpse = [p for p in poses if p.get('name', '').lower() == 'corpse pose']
        assert len(corpse) > 0, "Corpse Pose not found"
        pose = corpse[0]
        assert pose.get('image_source') == 'wikimedia_commons_verified'
        assert len(pose.get('source_references', [])) >= 2
    
    def test_easy_pose_verified(self):
        """Easy Pose should be verified with Wikimedia image"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        easy = [p for p in poses if p.get('name', '').lower() == 'easy pose']
        assert len(easy) > 0, "Easy Pose not found"
        pose = easy[0]
        assert pose.get('image_source') == 'wikimedia_commons_verified'
        assert len(pose.get('source_references', [])) >= 2
    
    def test_extended_side_angle_verified(self):
        """Extended Side Angle should be verified"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        pose_list = [p for p in poses if 'extended side angle' in p.get('name', '').lower()]
        assert len(pose_list) > 0, "Extended Side Angle not found"
        pose = pose_list[0]
        assert pose.get('image_source') == 'wikimedia_commons_verified'
    
    def test_extended_triangle_verified(self):
        """Extended Triangle should be verified"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        pose_list = [p for p in poses if 'extended triangle' in p.get('name', '').lower()]
        assert len(pose_list) > 0, "Extended Triangle not found"
        pose = pose_list[0]
        assert pose.get('image_source') == 'wikimedia_commons_verified'
    
    def test_garland_pose_verified(self):
        """Garland Pose should be verified"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        pose_list = [p for p in poses if 'garland' in p.get('name', '').lower()]
        assert len(pose_list) > 0, "Garland Pose not found"
        pose = pose_list[0]
        assert pose.get('image_source') == 'wikimedia_commons_verified'
    
    def test_goddess_pose_verified(self):
        """Goddess Pose should be verified"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        pose_list = [p for p in poses if 'goddess' in p.get('name', '').lower()]
        assert len(pose_list) > 0, "Goddess Pose not found"
        pose = pose_list[0]
        assert pose.get('image_source') == 'wikimedia_commons_verified'
    
    def test_locust_pose_verified(self):
        """Locust Pose should be verified"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        pose_list = [p for p in poses if 'locust' in p.get('name', '').lower()]
        assert len(pose_list) > 0, "Locust Pose not found"
        pose = pose_list[0]
        assert pose.get('image_source') == 'wikimedia_commons_verified'
    
    def test_thunderbolt_pose_verified(self):
        """Thunderbolt Pose should be verified"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        pose_list = [p for p in poses if 'thunderbolt' in p.get('name', '').lower()]
        assert len(pose_list) > 0, "Thunderbolt Pose not found"
        pose = pose_list[0]
        assert pose.get('image_source') == 'wikimedia_commons_verified'
    
    def test_prayer_pose_verified(self):
        """Prayer Pose should be verified"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        pose_list = [p for p in poses if 'prayer' in p.get('name', '').lower()]
        assert len(pose_list) > 0, "Prayer Pose not found"
        pose = pose_list[0]
        assert pose.get('image_source') == 'wikimedia_commons_verified'
    
    def test_wide_legged_forward_fold_verified(self):
        """Wide-Legged Forward Fold should be verified"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        pose_list = [p for p in poses if 'wide-legged' in p.get('name', '').lower() or 'wide legged' in p.get('name', '').lower()]
        assert len(pose_list) > 0, "Wide-Legged Forward Fold not found"
        pose = pose_list[0]
        assert pose.get('image_source') == 'wikimedia_commons_verified'
    
    # Test verified poses have correct structure
    def test_verified_poses_have_content_integrity(self):
        """Verified poses should have content_integrity.verified=True"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        verified = [p for p in poses if p.get('image_source') == 'wikimedia_commons_verified']
        for pose in verified:
            assert pose.get('content_integrity', {}).get('verified') == True, f"{pose.get('name')} missing content_integrity.verified"
    
    def test_verified_poses_have_image_validation(self):
        """Verified poses should have image_validation.status='verified'"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        verified = [p for p in poses if p.get('image_source') == 'wikimedia_commons_verified']
        for pose in verified:
            assert pose.get('image_validation', {}).get('status') == 'verified', f"{pose.get('name')} missing image_validation.status"
    
    def test_verified_poses_have_source_references(self):
        """Verified poses should have at least 2 source references"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        verified = [p for p in poses if p.get('image_source') == 'wikimedia_commons_verified']
        for pose in verified:
            refs = pose.get('source_references', [])
            assert len(refs) >= 2, f"{pose.get('name')} has only {len(refs)} source references"
    
    def test_verified_poses_have_wikimedia_image_url(self):
        """Verified poses should have Wikimedia image URLs"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        verified = [p for p in poses if p.get('image_source') == 'wikimedia_commons_verified']
        for pose in verified:
            image_url = pose.get('image_url', '').lower()
            assert 'wikimedia' in image_url or 'wikipedia' in image_url, f"{pose.get('name')} has non-Wikimedia image URL: {image_url}"
    
    # Test previously verified poses still work (no regression)
    def test_mountain_pose_still_verified(self):
        """Mountain Pose should still be verified (regression check)"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        mountain = [p for p in poses if p.get('name', '').lower() == 'mountain pose']
        assert len(mountain) > 0
        assert mountain[0].get('image_source') == 'wikimedia_commons_verified'
    
    def test_tree_pose_still_verified(self):
        """Tree Pose should still be verified (regression check)"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        tree = [p for p in poses if p.get('name', '').lower() == 'tree pose']
        assert len(tree) > 0
        assert tree[0].get('image_source') == 'wikimedia_commons_verified'
    
    def test_warrior_poses_still_verified(self):
        """Warrior I, II, III should still be verified (regression check)"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        # Only check Warrior I, II, III (not Reverse Warrior which is a different pose)
        warrior_names = ['warrior i', 'warrior ii', 'warrior iii']
        for name in warrior_names:
            warriors = [p for p in poses if p.get('name', '').lower() == name]
            assert len(warriors) > 0, f"{name} not found"
            assert warriors[0].get('image_source') == 'wikimedia_commons_verified', f"{name} not verified"
