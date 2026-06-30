"""
Test Mystery School 21 entries per stream after SECTION_UNCAPPED_UNLOCK_IDS update.
Verifies that each stream returns exactly 21 teachings with correct premium tiering.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

STREAMS = ["egyptian_mystery", "priestess_rose", "emerald_tablet", "merlin_alchemy"]
EXPECTED_FREE_COUNT = 4
EXPECTED_TOTAL_COUNT = 21


class TestMysterySchool21Entries:
    """Verify 21 entries per stream with correct tiering"""

    @pytest.mark.parametrize("stream", STREAMS)
    def test_stream_returns_21_entries(self, stream):
        """Each stream should return exactly 21 teachings"""
        response = requests.get(f"{BASE_URL}/api/mystery-school", params={"stream": stream})
        assert response.status_code == 200, f"Stream {stream} returned {response.status_code}"
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        assert len(data) == EXPECTED_TOTAL_COUNT, f"Stream {stream}: expected {EXPECTED_TOTAL_COUNT}, got {len(data)}"

    @pytest.mark.parametrize("stream", STREAMS)
    def test_stream_has_4_free_items_at_top(self, stream):
        """First 4 items should be free (is_premium=False)"""
        response = requests.get(f"{BASE_URL}/api/mystery-school", params={"stream": stream})
        assert response.status_code == 200
        data = response.json()
        
        # Check first 4 are free
        for i in range(EXPECTED_FREE_COUNT):
            assert not data[i].get("is_premium", True), f"Stream {stream}: item {i} should be free"
        
        # Check remaining are premium
        for i in range(EXPECTED_FREE_COUNT, len(data)):
            assert data[i].get("is_premium", False), f"Stream {stream}: item {i} should be premium"

    @pytest.mark.parametrize("stream", STREAMS)
    def test_stream_items_have_required_fields(self, stream):
        """Each item should have id, name, description, is_premium"""
        response = requests.get(f"{BASE_URL}/api/mystery-school", params={"stream": stream})
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["id", "name", "description", "is_premium"]
        for item in data:
            for field in required_fields:
                assert field in item, f"Stream {stream}: item {item.get('id', '?')} missing {field}"

    def test_egyptian_mystery_count(self):
        """Explicit test for egyptian_mystery stream"""
        response = requests.get(f"{BASE_URL}/api/mystery-school", params={"stream": "egyptian_mystery"})
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 21, f"Expected 21, got {len(data)}"
        free_count = sum(1 for i in data if not i.get("is_premium", False))
        assert free_count == 4, f"Expected 4 free, got {free_count}"

    def test_priestess_rose_count(self):
        """Explicit test for priestess_rose stream"""
        response = requests.get(f"{BASE_URL}/api/mystery-school", params={"stream": "priestess_rose"})
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 21, f"Expected 21, got {len(data)}"
        free_count = sum(1 for i in data if not i.get("is_premium", False))
        assert free_count == 4, f"Expected 4 free, got {free_count}"

    def test_emerald_tablet_count(self):
        """Explicit test for emerald_tablet stream"""
        response = requests.get(f"{BASE_URL}/api/mystery-school", params={"stream": "emerald_tablet"})
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 21, f"Expected 21, got {len(data)}"
        free_count = sum(1 for i in data if not i.get("is_premium", False))
        assert free_count == 4, f"Expected 4 free, got {free_count}"

    def test_merlin_alchemy_count(self):
        """Explicit test for merlin_alchemy stream"""
        response = requests.get(f"{BASE_URL}/api/mystery-school", params={"stream": "merlin_alchemy"})
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 21, f"Expected 21, got {len(data)}"
        free_count = sum(1 for i in data if not i.get("is_premium", False))
        assert free_count == 4, f"Expected 4 free, got {free_count}"

    def test_default_stream_returns_all_84(self):
        """Default stream (no param) returns all 84 items (21 x 4 streams)"""
        response = requests.get(f"{BASE_URL}/api/mystery-school")
        assert response.status_code == 200
        data = response.json()
        # Without stream filter, all 84 teachings are returned (21 per stream x 4 streams)
        assert len(data) == 84, f"Default stream: expected 84, got {len(data)}"
