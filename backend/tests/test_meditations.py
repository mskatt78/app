"""
Backend tests for Meditations feature (iteration 32)
Tests: GET /meditations, image_url presence, visualization text, all 6 items
"""
import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

EXPECTED_MEDITATION_IDS = ["1", "2", "3", "4", "5", "6"]


class TestMeditationsAPI:
    """Tests for GET /api/meditations endpoint"""

    def test_get_meditations_status_200(self):
        """Meditations endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: GET /api/meditations returns 200")

    def test_get_meditations_returns_list(self):
        """Response is a list"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"PASS: Response is a list")

    def test_get_meditations_returns_6(self):
        """Exactly 6 meditations are returned"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        data = response.json()
        assert len(data) == 6, f"Expected 6 meditations, got {len(data)}"
        print(f"PASS: 6 meditations returned")

    def test_all_meditations_have_image_url(self):
        """All 6 meditations must have image_url populated (not None/empty)"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        data = response.json()
        missing = []
        for m in data:
            img = m.get("image_url")
            if not img or not img.startswith("http"):
                missing.append(m.get("name", m.get("id")))
        assert len(missing) == 0, f"Meditations missing image_url: {missing}"
        print(f"PASS: All {len(data)} meditations have image_url")

    def test_all_meditations_have_visualization(self):
        """All 6 meditations must have visualization text"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        data = response.json()
        missing = []
        for m in data:
            viz = m.get("visualization")
            if not viz or len(viz) < 10:
                missing.append(m.get("name", m.get("id")))
        assert len(missing) == 0, f"Meditations missing visualization: {missing}"
        print(f"PASS: All {len(data)} meditations have visualization text")

    def test_all_meditations_have_required_fields(self):
        """Each meditation has id, name, duration_minutes, description, element, category"""
        required_fields = ["id", "name", "duration_minutes", "description",
                           "element", "category", "benefits", "visualization", "image_url"]
        response = requests.get(f"{BASE_URL}/api/meditations")
        data = response.json()
        for m in data:
            for field in required_fields:
                assert field in m, f"Meditation '{m.get('name')}' missing field: {field}"
        print(f"PASS: All meditations have required fields")

    def test_meditation_ids_are_1_through_6(self):
        """Meditation IDs are 1 through 6"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        data = response.json()
        ids = sorted([m["id"] for m in data])
        assert ids == EXPECTED_MEDITATION_IDS, f"Expected IDs {EXPECTED_MEDITATION_IDS}, got {ids}"
        print(f"PASS: Meditation IDs are 1-6: {ids}")

    def test_meditation_duration_positive(self):
        """All meditations have positive duration_minutes"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        data = response.json()
        for m in data:
            dur = m.get("duration_minutes", 0)
            assert dur > 0, f"Meditation '{m.get('name')}' has invalid duration: {dur}"
        print("PASS: All meditations have positive duration")

    def test_image_urls_are_real_http_urls(self):
        """image_url values should be valid http/https URLs"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        data = response.json()
        for m in data:
            url = m.get("image_url", "")
            assert url.startswith("https://"), f"'{m['name']}' image_url not https: {url}"
            # Should not be a Star icon placeholder or empty
            assert "star" not in url.lower(), f"image_url looks like an icon placeholder: {url}"
        print("PASS: All image_urls are valid https URLs")

    def test_specific_meditation_mountain(self):
        """Mountain Meditation (id=2) has correct data including visualization"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        data = response.json()
        mountain = next((m for m in data if m["id"] == "2"), None)
        assert mountain is not None, "Mountain Meditation (id=2) not found"
        assert mountain["name"] == "Mountain Meditation"
        assert mountain["category"] == "grounding"
        assert mountain["element"] == "Earth"
        assert "mountain" in mountain["visualization"].lower()
        assert mountain["image_url"].startswith("https://")
        print(f"PASS: Mountain Meditation data correct - image: {mountain['image_url'][:60]}")

    def test_specific_meditation_inner_peace(self):
        """Inner Peace Journey (id=1) has correct data"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        data = response.json()
        peace = next((m for m in data if m["id"] == "1"), None)
        assert peace is not None, "Inner Peace Journey (id=1) not found"
        assert peace["name"] == "Inner Peace Journey"
        assert peace["image_url"].startswith("https://")
        assert len(peace["visualization"]) > 20
        print(f"PASS: Inner Peace Journey data correct - image: {peace['image_url'][:60]}")
