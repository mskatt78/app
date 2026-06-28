"""
Test edge library depth enrichment for iteration 230.
Verifies that all edge libraries include ritual-depth fields:
- alchemy, ritual, ceremony, guided_practice
while preserving existing schema fields.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Edge library endpoints to test
EDGE_LIBRARY_ENDPOINTS = [
    "/api/sound-frequencies",
    "/api/tarot/cards",
    "/api/sacred-guardians",
    "/api/videos",
    "/api/courses",
    "/api/runes",
    "/api/i-ching",
    "/api/retreats",
]

# Mudras and Mantras endpoints
CORE_DEPTH_ENDPOINTS = [
    "/api/mudras",
    "/api/mantras",
]

DEPTH_FIELDS = ["alchemy", "ritual", "ceremony", "guided_practice"]


class TestEdgeLibraryDepthEnrichment:
    """Test that edge libraries include ritual-depth fields."""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})

    @pytest.mark.parametrize("endpoint", EDGE_LIBRARY_ENDPOINTS)
    def test_edge_library_returns_data(self, endpoint):
        """Verify edge library endpoints return 200 and data."""
        response = self.session.get(f"{BASE_URL}{endpoint}")
        assert response.status_code == 200, f"{endpoint} returned {response.status_code}"
        data = response.json()
        # Some endpoints may return empty arrays (e.g., retreats)
        assert isinstance(data, list), f"{endpoint} should return a list"
        print(f"PASS: {endpoint} returns {len(data)} items")

    def test_sound_frequencies_depth_fields(self):
        """Verify sound-frequencies includes depth fields."""
        response = self.session.get(f"{BASE_URL}/api/sound-frequencies")
        assert response.status_code == 200
        data = response.json()
        if len(data) == 0:
            pytest.skip("No sound frequencies data")
        
        item = data[0]
        for field in DEPTH_FIELDS:
            assert field in item or f"{field}s" in item or f"{field}_teachings" in item, \
                f"sound-frequencies missing depth field: {field}"
        
        # Check existing schema preserved
        assert "name" in item, "sound-frequencies missing 'name'"
        assert "element" in item or "category" in item, "sound-frequencies missing element/category"
        print(f"PASS: sound-frequencies has depth fields and preserves schema ({len(data)} items)")

    def test_tarot_cards_depth_fields(self):
        """Verify tarot cards include depth fields."""
        response = self.session.get(f"{BASE_URL}/api/tarot/cards")
        assert response.status_code == 200
        data = response.json()
        if len(data) == 0:
            pytest.skip("No tarot cards data")
        
        item = data[0]
        for field in DEPTH_FIELDS:
            assert field in item or f"{field}s" in item or f"{field}_teachings" in item, \
                f"tarot cards missing depth field: {field}"
        
        # Check existing schema preserved
        assert "name" in item, "tarot cards missing 'name'"
        assert "upright_meaning" in item or "keywords" in item, "tarot cards missing meaning fields"
        print(f"PASS: tarot cards has depth fields and preserves schema ({len(data)} items)")

    def test_sacred_guardians_depth_fields(self):
        """Verify sacred guardians include depth fields."""
        response = self.session.get(f"{BASE_URL}/api/sacred-guardians")
        assert response.status_code == 200
        data = response.json()
        if len(data) == 0:
            pytest.skip("No sacred guardians data")
        
        item = data[0]
        for field in DEPTH_FIELDS:
            assert field in item or f"{field}s" in item or f"{field}_teachings" in item, \
                f"sacred guardians missing depth field: {field}"
        
        # Check existing schema preserved
        assert "name" in item, "sacred guardians missing 'name'"
        assert "category" in item or "element" in item, "sacred guardians missing category/element"
        print(f"PASS: sacred guardians has depth fields and preserves schema ({len(data)} items)")

    def test_videos_depth_fields(self):
        """Verify videos include depth fields."""
        response = self.session.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        data = response.json()
        if len(data) == 0:
            pytest.skip("No videos data")
        
        item = data[0]
        for field in DEPTH_FIELDS:
            assert field in item or f"{field}s" in item or f"{field}_teachings" in item, \
                f"videos missing depth field: {field}"
        
        # Check existing schema preserved
        assert "title" in item or "name" in item, "videos missing title/name"
        assert "video_url" in item or "url" in item, "videos missing video_url"
        print(f"PASS: videos has depth fields and preserves schema ({len(data)} items)")

    def test_courses_depth_fields(self):
        """Verify courses include depth fields."""
        response = self.session.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        if len(data) == 0:
            pytest.skip("No courses data")
        
        item = data[0]
        for field in DEPTH_FIELDS:
            assert field in item or f"{field}s" in item or f"{field}_teachings" in item, \
                f"courses missing depth field: {field}"
        
        # Check existing schema preserved
        assert "title" in item or "name" in item, "courses missing title/name"
        print(f"PASS: courses has depth fields and preserves schema ({len(data)} items)")

    def test_runes_depth_fields(self):
        """Verify runes include depth fields."""
        response = self.session.get(f"{BASE_URL}/api/runes")
        assert response.status_code == 200
        data = response.json()
        if len(data) == 0:
            pytest.skip("No runes data")
        
        item = data[0]
        for field in DEPTH_FIELDS:
            assert field in item or f"{field}s" in item or f"{field}_teachings" in item, \
                f"runes missing depth field: {field}"
        
        # Check existing schema preserved
        assert "name" in item, "runes missing 'name'"
        print(f"PASS: runes has depth fields and preserves schema ({len(data)} items)")

    def test_i_ching_depth_fields(self):
        """Verify i-ching hexagrams include depth fields."""
        response = self.session.get(f"{BASE_URL}/api/i-ching")
        assert response.status_code == 200
        data = response.json()
        if len(data) == 0:
            pytest.skip("No i-ching data")
        
        item = data[0]
        for field in DEPTH_FIELDS:
            assert field in item or f"{field}s" in item or f"{field}_teachings" in item, \
                f"i-ching missing depth field: {field}"
        
        # Check existing schema preserved
        assert "name" in item or "title" in item, "i-ching missing name/title"
        print(f"PASS: i-ching has depth fields and preserves schema ({len(data)} items)")

    def test_retreats_endpoint(self):
        """Verify retreats endpoint works (may return empty array)."""
        response = self.session.get(f"{BASE_URL}/api/retreats")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "retreats should return a list"
        print(f"PASS: retreats returns {len(data)} items (empty is expected)")


class TestMudrasMantrasDepthConsistency:
    """Test that mudras and mantras maintain depth consistency."""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})

    def test_mudras_depth_fields(self):
        """Verify mudras include all depth fields."""
        response = self.session.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "No mudras returned"
        
        item = data[0]
        for field in DEPTH_FIELDS:
            assert field in item or f"{field}s" in item or f"{field}_teachings" in item, \
                f"mudras missing depth field: {field}"
        
        # Check existing schema preserved
        assert "name" in item, "mudras missing 'name'"
        assert "element" in item, "mudras missing 'element'"
        assert "benefits" in item or "description" in item, "mudras missing benefits/description"
        print(f"PASS: mudras has depth fields and preserves schema ({len(data)} items)")

    def test_mantras_depth_fields(self):
        """Verify mantras include all depth fields."""
        response = self.session.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "No mantras returned"
        
        item = data[0]
        for field in DEPTH_FIELDS:
            assert field in item or f"{field}s" in item or f"{field}_teachings" in item, \
                f"mantras missing depth field: {field}"
        
        # Check existing schema preserved
        assert "name" in item, "mantras missing 'name'"
        assert "element" in item or "chakra" in item, "mantras missing element/chakra"
        print(f"PASS: mantras has depth fields and preserves schema ({len(data)} items)")

    def test_mudras_no_regression(self):
        """Verify mudras load without regression."""
        response = self.session.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 5, f"Expected at least 5 mudras, got {len(data)}"
        
        # Verify all items have required fields
        for mudra in data[:5]:
            assert "id" in mudra, "mudra missing 'id'"
            assert "name" in mudra, "mudra missing 'name'"
        print(f"PASS: mudras loads without regression ({len(data)} items)")

    def test_mantras_no_regression(self):
        """Verify mantras load without regression."""
        response = self.session.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 5, f"Expected at least 5 mantras, got {len(data)}"
        
        # Verify all items have required fields
        for mantra in data[:5]:
            assert "id" in mantra, "mantra missing 'id'"
            assert "name" in mantra, "mantra missing 'name'"
        print(f"PASS: mantras loads without regression ({len(data)} items)")


class TestAppStoreReadinessPage:
    """Test App Store readiness page functionality."""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()

    def test_app_store_readiness_page_loads(self):
        """Verify /app-store-readiness page is accessible."""
        response = self.session.get(f"{BASE_URL}/app-store-readiness")
        # Frontend route - should return 200 (SPA routing)
        assert response.status_code == 200, f"app-store-readiness returned {response.status_code}"
        print("PASS: /app-store-readiness page loads")


class TestSubmissionKitDocs:
    """Test submission kit docs exist and contain real-device language."""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()

    def test_readme_exists(self):
        """Verify README.md exists in submission_kit."""
        response = self.session.get(f"{BASE_URL}/submission_kit/README.md")
        assert response.status_code == 200, "README.md not found"
        content = response.text
        assert "real-device" in content.lower() or "physical" in content.lower(), \
            "README.md should mention real-device capture"
        print("PASS: README.md exists and mentions real-device workflow")

    def test_screenshot_shotlist_exists(self):
        """Verify SCREENSHOT_SHOTLIST.md exists."""
        response = self.session.get(f"{BASE_URL}/submission_kit/SCREENSHOT_SHOTLIST.md")
        assert response.status_code == 200, "SCREENSHOT_SHOTLIST.md not found"
        content = response.text
        assert "real-device" in content.lower() or "physical" in content.lower(), \
            "SCREENSHOT_SHOTLIST.md should mention real-device capture"
        print("PASS: SCREENSHOT_SHOTLIST.md exists and mentions real-device workflow")

    def test_store_copy_pack_exists(self):
        """Verify STORE_COPY_PACK.md exists."""
        response = self.session.get(f"{BASE_URL}/submission_kit/STORE_COPY_PACK.md")
        assert response.status_code == 200, "STORE_COPY_PACK.md not found"
        print("PASS: STORE_COPY_PACK.md exists")

    def test_submission_forms_cheatsheet_exists(self):
        """Verify SUBMISSION_FORMS_CHEATSHEET.md exists."""
        response = self.session.get(f"{BASE_URL}/submission_kit/SUBMISSION_FORMS_CHEATSHEET.md")
        assert response.status_code == 200, "SUBMISSION_FORMS_CHEATSHEET.md not found"
        content = response.text
        assert "real-device" in content.lower() or "6.7" in content or "12.9" in content, \
            "SUBMISSION_FORMS_CHEATSHEET.md should mention device sizes"
        print("PASS: SUBMISSION_FORMS_CHEATSHEET.md exists and mentions device specs")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
