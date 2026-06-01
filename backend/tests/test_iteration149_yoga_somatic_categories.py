"""
Iteration 149 - Yoga Image Corrections & Somatic Movement Track Categories

Tests:
1. GET /api/yoga/poses - Verified image URLs for key poses (Downward Dog, Warrior II, Tree Pose, etc.)
2. GET /api/yoga/poses - New fields: somatic_fascia_focus, breath_hybrid_cue, mindfulness_prompt, source_references
3. GET /api/somatic - Separated movement_track categories: Somatic Movement, Tai Chi, Chi Gong
4. GET /api/somatic - Somatic Movement entries have fascia focus and breath hybrid metadata
"""
import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

class TestYogaPosesImageCorrections:
    """Test yoga poses endpoint returns corrected verified image URLs and new fields"""

    def test_yoga_poses_endpoint_returns_data(self):
        """GET /api/yoga/poses returns a list of poses"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of poses"
        assert len(data) > 0, "Expected at least one pose"
        print(f"PASS: /api/yoga/poses returned {len(data)} poses")

    def test_downward_dog_has_verified_image(self):
        """Downward Dog pose has verified Wikimedia Commons image URL"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        poses = response.json()
        
        # Find Downward Dog (could be "Downward Dog" or "Downward Facing Dog")
        downward_dog = None
        for pose in poses:
            name_lower = pose.get("name", "").lower()
            if "downward" in name_lower and "dog" in name_lower:
                downward_dog = pose
                break
        
        assert downward_dog is not None, "Downward Dog pose not found"
        assert "image_url" in downward_dog, "Downward Dog missing image_url"
        assert "wikimedia" in downward_dog["image_url"].lower() or "upload.wikimedia.org" in downward_dog["image_url"], \
            f"Expected Wikimedia image URL, got: {downward_dog['image_url']}"
        print(f"PASS: Downward Dog has verified image: {downward_dog['image_url'][:80]}...")

    def test_warrior_ii_has_verified_image(self):
        """Warrior II pose has verified Wikimedia Commons image URL"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        poses = response.json()
        
        warrior_ii = None
        for pose in poses:
            name_lower = pose.get("name", "").lower()
            if "warrior" in name_lower and ("ii" in name_lower or "2" in name_lower):
                warrior_ii = pose
                break
        
        assert warrior_ii is not None, "Warrior II pose not found"
        assert "image_url" in warrior_ii, "Warrior II missing image_url"
        assert "wikimedia" in warrior_ii["image_url"].lower() or "upload.wikimedia.org" in warrior_ii["image_url"], \
            f"Expected Wikimedia image URL, got: {warrior_ii['image_url']}"
        print(f"PASS: Warrior II has verified image: {warrior_ii['image_url'][:80]}...")

    def test_tree_pose_has_verified_image(self):
        """Tree Pose has verified Wikimedia Commons image URL"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        poses = response.json()
        
        tree_pose = None
        for pose in poses:
            name_lower = pose.get("name", "").lower()
            if "tree" in name_lower:
                tree_pose = pose
                break
        
        assert tree_pose is not None, "Tree Pose not found"
        assert "image_url" in tree_pose, "Tree Pose missing image_url"
        assert "wikimedia" in tree_pose["image_url"].lower() or "upload.wikimedia.org" in tree_pose["image_url"], \
            f"Expected Wikimedia image URL, got: {tree_pose['image_url']}"
        print(f"PASS: Tree Pose has verified image: {tree_pose['image_url'][:80]}...")

    def test_poses_have_somatic_fascia_focus_field(self):
        """Yoga poses include somatic_fascia_focus field"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        poses = response.json()
        
        poses_with_fascia = [p for p in poses if p.get("somatic_fascia_focus")]
        assert len(poses_with_fascia) > 0, "No poses have somatic_fascia_focus field"
        
        # Check a sample pose
        sample = poses_with_fascia[0]
        assert isinstance(sample["somatic_fascia_focus"], str), "somatic_fascia_focus should be a string"
        assert len(sample["somatic_fascia_focus"]) > 10, "somatic_fascia_focus should have meaningful content"
        print(f"PASS: {len(poses_with_fascia)} poses have somatic_fascia_focus field")
        print(f"  Sample: {sample['name']} -> {sample['somatic_fascia_focus'][:60]}...")

    def test_poses_have_breath_hybrid_cue_field(self):
        """Yoga poses include breath_hybrid_cue field"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        poses = response.json()
        
        poses_with_breath = [p for p in poses if p.get("breath_hybrid_cue")]
        assert len(poses_with_breath) > 0, "No poses have breath_hybrid_cue field"
        
        sample = poses_with_breath[0]
        assert isinstance(sample["breath_hybrid_cue"], str), "breath_hybrid_cue should be a string"
        assert len(sample["breath_hybrid_cue"]) > 10, "breath_hybrid_cue should have meaningful content"
        print(f"PASS: {len(poses_with_breath)} poses have breath_hybrid_cue field")
        print(f"  Sample: {sample['name']} -> {sample['breath_hybrid_cue'][:60]}...")

    def test_poses_have_mindfulness_prompt_field(self):
        """Yoga poses include mindfulness_prompt field"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        poses = response.json()
        
        poses_with_mindfulness = [p for p in poses if p.get("mindfulness_prompt")]
        assert len(poses_with_mindfulness) > 0, "No poses have mindfulness_prompt field"
        
        sample = poses_with_mindfulness[0]
        assert isinstance(sample["mindfulness_prompt"], str), "mindfulness_prompt should be a string"
        print(f"PASS: {len(poses_with_mindfulness)} poses have mindfulness_prompt field")
        print(f"  Sample: {sample['name']} -> {sample['mindfulness_prompt'][:60]}...")

    def test_verified_poses_have_source_references(self):
        """Verified poses include source_references array"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        poses = response.json()
        
        poses_with_refs = [p for p in poses if p.get("source_references") and len(p["source_references"]) > 0]
        assert len(poses_with_refs) > 0, "No poses have source_references"
        
        sample = poses_with_refs[0]
        assert isinstance(sample["source_references"], list), "source_references should be a list"
        assert all(ref.startswith("http") for ref in sample["source_references"]), "References should be URLs"
        print(f"PASS: {len(poses_with_refs)} poses have source_references")
        print(f"  Sample: {sample['name']} -> {sample['source_references'][0][:60]}...")


class TestSomaticMovementTrackCategories:
    """Test somatic endpoint returns separated movement track categories"""

    def test_somatic_endpoint_returns_data(self):
        """GET /api/somatic returns a list of practices"""
        response = requests.get(f"{BASE_URL}/api/somatic")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of practices"
        assert len(data) > 0, "Expected at least one practice"
        print(f"PASS: /api/somatic returned {len(data)} practices")

    def test_somatic_practices_have_movement_track_field(self):
        """Somatic practices include movement_track field"""
        response = requests.get(f"{BASE_URL}/api/somatic")
        assert response.status_code == 200
        practices = response.json()
        
        practices_with_track = [p for p in practices if p.get("movement_track")]
        assert len(practices_with_track) > 0, "No practices have movement_track field"
        print(f"PASS: {len(practices_with_track)} practices have movement_track field")

    def test_movement_tracks_include_somatic_movement(self):
        """At least one practice has movement_track = 'Somatic Movement'"""
        response = requests.get(f"{BASE_URL}/api/somatic")
        assert response.status_code == 200
        practices = response.json()
        
        somatic_movement = [p for p in practices if p.get("movement_track") == "Somatic Movement"]
        assert len(somatic_movement) > 0, "No practices with movement_track='Somatic Movement'"
        print(f"PASS: {len(somatic_movement)} practices have movement_track='Somatic Movement'")

    def test_movement_tracks_include_tai_chi(self):
        """At least one practice has movement_track = 'Tai Chi'"""
        response = requests.get(f"{BASE_URL}/api/somatic")
        assert response.status_code == 200
        practices = response.json()
        
        tai_chi = [p for p in practices if p.get("movement_track") == "Tai Chi"]
        assert len(tai_chi) > 0, "No practices with movement_track='Tai Chi'"
        print(f"PASS: {len(tai_chi)} practices have movement_track='Tai Chi'")

    def test_movement_tracks_include_chi_gong(self):
        """At least one practice has movement_track = 'Chi Gong'"""
        response = requests.get(f"{BASE_URL}/api/somatic")
        assert response.status_code == 200
        practices = response.json()
        
        chi_gong = [p for p in practices if p.get("movement_track") == "Chi Gong"]
        assert len(chi_gong) > 0, "No practices with movement_track='Chi Gong'"
        print(f"PASS: {len(chi_gong)} practices have movement_track='Chi Gong'")

    def test_somatic_movement_has_fascia_focus(self):
        """Somatic Movement entries have somatic_fascia_focus field"""
        response = requests.get(f"{BASE_URL}/api/somatic")
        assert response.status_code == 200
        practices = response.json()
        
        somatic_movement = [p for p in practices if p.get("movement_track") == "Somatic Movement"]
        assert len(somatic_movement) > 0, "No Somatic Movement practices found"
        
        with_fascia = [p for p in somatic_movement if p.get("somatic_fascia_focus")]
        assert len(with_fascia) > 0, "No Somatic Movement practices have somatic_fascia_focus"
        
        sample = with_fascia[0]
        assert isinstance(sample["somatic_fascia_focus"], str), "somatic_fascia_focus should be a string"
        print(f"PASS: {len(with_fascia)} Somatic Movement practices have somatic_fascia_focus")
        print(f"  Sample: {sample['name']} -> {sample['somatic_fascia_focus'][:60]}...")

    def test_somatic_movement_has_breath_hybrid_sequence(self):
        """Somatic Movement entries have breath_hybrid_sequence field"""
        response = requests.get(f"{BASE_URL}/api/somatic")
        assert response.status_code == 200
        practices = response.json()
        
        somatic_movement = [p for p in practices if p.get("movement_track") == "Somatic Movement"]
        assert len(somatic_movement) > 0, "No Somatic Movement practices found"
        
        with_sequence = [p for p in somatic_movement if p.get("breath_hybrid_sequence")]
        assert len(with_sequence) > 0, "No Somatic Movement practices have breath_hybrid_sequence"
        
        sample = with_sequence[0]
        assert isinstance(sample["breath_hybrid_sequence"], list), "breath_hybrid_sequence should be a list"
        assert len(sample["breath_hybrid_sequence"]) > 0, "breath_hybrid_sequence should not be empty"
        print(f"PASS: {len(with_sequence)} Somatic Movement practices have breath_hybrid_sequence")
        print(f"  Sample: {sample['name']} -> {len(sample['breath_hybrid_sequence'])} cues")

    def test_somatic_movement_has_breath_hybrid_mode(self):
        """Somatic Movement entries have breath_hybrid_mode field"""
        response = requests.get(f"{BASE_URL}/api/somatic")
        assert response.status_code == 200
        practices = response.json()
        
        somatic_movement = [p for p in practices if p.get("movement_track") == "Somatic Movement"]
        assert len(somatic_movement) > 0, "No Somatic Movement practices found"
        
        with_mode = [p for p in somatic_movement if p.get("breath_hybrid_mode")]
        assert len(with_mode) > 0, "No Somatic Movement practices have breath_hybrid_mode"
        
        sample = with_mode[0]
        assert "Somatic" in sample["breath_hybrid_mode"] or "Fascia" in sample["breath_hybrid_mode"], \
            f"breath_hybrid_mode should mention Somatic or Fascia, got: {sample['breath_hybrid_mode']}"
        print(f"PASS: {len(with_mode)} Somatic Movement practices have breath_hybrid_mode")
        print(f"  Sample: {sample['name']} -> {sample['breath_hybrid_mode']}")


class TestKeyPagesNoRegression:
    """Test key pages don't regress - landing, yoga library, somatic movement"""

    def test_landing_page_health(self):
        """Landing page API health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.status_code}"
        print("PASS: /api/health returns 200")

    def test_yoga_poses_no_regression(self):
        """Yoga poses endpoint returns expected structure"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        poses = response.json()
        
        # Check basic structure
        assert len(poses) >= 5, f"Expected at least 5 poses, got {len(poses)}"
        
        sample = poses[0]
        required_fields = ["id", "name", "element", "description"]
        for field in required_fields:
            assert field in sample, f"Pose missing required field: {field}"
        
        print(f"PASS: Yoga poses endpoint returns {len(poses)} poses with correct structure")

    def test_somatic_no_regression(self):
        """Somatic endpoint returns expected structure"""
        response = requests.get(f"{BASE_URL}/api/somatic")
        assert response.status_code == 200
        practices = response.json()
        
        assert len(practices) >= 3, f"Expected at least 3 practices, got {len(practices)}"
        
        sample = practices[0]
        required_fields = ["id", "name", "element", "description"]
        for field in required_fields:
            assert field in sample, f"Practice missing required field: {field}"
        
        print(f"PASS: Somatic endpoint returns {len(practices)} practices with correct structure")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
