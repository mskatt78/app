"""
Test Mystery School Teachings API - Iteration 243
Tests for Egyptian Mystery, Priestess & Rose, Emerald Tablet, and Merlin Alchemy streams
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

class TestMysterySchoolEndpoint:
    """Tests for /api/mystery-school endpoint"""

    def test_mystery_school_all_streams(self):
        """Test fetching all mystery school teachings without stream filter"""
        response = requests.get(f"{BASE_URL}/api/mystery-school")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        # With tiering: 4 free + 10 premium = 14 items per stream, but all streams combined
        # The tiering applies to the combined list, so we get 14 total (not per stream)
        assert len(data) == 14, f"Expected 14 teachings (tiered), got {len(data)}"
        print(f"✓ All streams returned {len(data)} teachings (tiered)")

    def test_mystery_school_egyptian_stream(self):
        """Test fetching Egyptian Mystery School teachings"""
        response = requests.get(f"{BASE_URL}/api/mystery-school", params={"stream": "egyptian_mystery"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # With tiering: 4 free + 10 premium = 14 items visible
        assert len(data) == 14, f"Expected 14 Egyptian teachings (tiered), got {len(data)}"
        
        # Verify all items have correct stream
        for item in data:
            assert item.get("stream") == "egyptian_mystery", f"Item {item.get('id')} has wrong stream"
        
        # Verify data structure
        first_item = data[0]
        assert "id" in first_item
        assert "name" in first_item
        assert "title" in first_item
        assert "description" in first_item
        assert "alchemy" in first_item
        assert "ritual" in first_item
        assert "ceremony" in first_item
        assert "guided_practice" in first_item
        print(f"✓ Egyptian Mystery stream returned {len(data)} teachings with correct structure")

    def test_mystery_school_priestess_rose_stream(self):
        """Test fetching Priestess & Rose Lineage teachings"""
        response = requests.get(f"{BASE_URL}/api/mystery-school", params={"stream": "priestess_rose"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 14, f"Expected 14 Priestess Rose teachings (tiered), got {len(data)}"
        
        for item in data:
            assert item.get("stream") == "priestess_rose"
        print(f"✓ Priestess & Rose stream returned {len(data)} teachings")

    def test_mystery_school_emerald_tablet_stream(self):
        """Test fetching Emerald Tablet Alchemy teachings"""
        response = requests.get(f"{BASE_URL}/api/mystery-school", params={"stream": "emerald_tablet"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 14, f"Expected 14 Emerald Tablet teachings (tiered), got {len(data)}"
        
        for item in data:
            assert item.get("stream") == "emerald_tablet"
        print(f"✓ Emerald Tablet stream returned {len(data)} teachings")

    def test_mystery_school_merlin_alchemy_stream(self):
        """Test fetching Merlin Teachings & Alchemy"""
        response = requests.get(f"{BASE_URL}/api/mystery-school", params={"stream": "merlin_alchemy"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 14, f"Expected 14 Merlin teachings (tiered), got {len(data)}"
        
        for item in data:
            assert item.get("stream") == "merlin_alchemy"
        print(f"✓ Merlin Alchemy stream returned {len(data)} teachings")

    def test_mystery_school_premium_tiering(self):
        """Test that premium tiering is applied correctly (4 free / 10 premium visible)"""
        response = requests.get(f"{BASE_URL}/api/mystery-school", params={"stream": "egyptian_mystery"})
        assert response.status_code == 200
        data = response.json()
        
        free_count = sum(1 for item in data if not item.get("is_premium", False))
        premium_count = sum(1 for item in data if item.get("is_premium", False))
        
        assert free_count == 4, f"Expected 4 free teachings, got {free_count}"
        assert premium_count == 10, f"Expected 10 premium teachings (visible), got {premium_count}"
        print(f"✓ Premium tiering correct: {free_count} free, {premium_count} premium")

    def test_mystery_school_single_teaching(self):
        """Test fetching a single mystery school teaching by ID"""
        response = requests.get(f"{BASE_URL}/api/mystery-school/mystery-egyptian-001")
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("id") == "mystery-egyptian-001"
        assert data.get("name") == "House of Life Initiation"
        assert data.get("stream") == "egyptian_mystery"
        assert "alchemy" in data
        assert "ritual" in data
        assert "ceremony" in data
        assert "guided_practice" in data
        print(f"✓ Single teaching fetch works: {data.get('name')}")

    def test_mystery_school_invalid_teaching_id(self):
        """Test 404 for invalid teaching ID"""
        response = requests.get(f"{BASE_URL}/api/mystery-school/invalid-teaching-id-xyz")
        assert response.status_code == 404
        print("✓ Invalid teaching ID returns 404")

    def test_mystery_school_enrichment_fields(self):
        """Test that enrichment fields are present"""
        response = requests.get(f"{BASE_URL}/api/mystery-school", params={"stream": "egyptian_mystery"})
        assert response.status_code == 200
        data = response.json()
        
        first_item = data[0]
        # Check enrichment fields
        assert "stream_label" in first_item, "Missing stream_label"
        assert "category" in first_item, "Missing category"
        assert first_item.get("category") == "mystery_school"
        # Note: premium_unlock_id is only added to premium items, not free items
        # Check a premium item (index 4+)
        if len(data) > 4:
            premium_item = data[4]
            assert premium_item.get("is_premium") == True
        print(f"✓ Enrichment fields present: stream_label={first_item.get('stream_label')}, category={first_item.get('category')}")


class TestAncientWisdomMysterySchoolIntegration:
    """Tests for Mystery School integration in Ancient Wisdom"""

    def test_ancient_wisdom_includes_mystery_school(self):
        """Test that Ancient Wisdom endpoint includes Mystery School entries"""
        response = requests.get(f"{BASE_URL}/api/ancient-wisdom")
        assert response.status_code == 200
        data = response.json()
        
        # Check for mystery school related entries
        mystery_related = [
            item for item in data 
            if "mystery" in str(item.get("name", "")).lower() 
            or "priestess" in str(item.get("name", "")).lower()
            or "emerald" in str(item.get("name", "")).lower()
            or "merlin" in str(item.get("name", "")).lower()
        ]
        
        assert len(mystery_related) > 0, "Ancient Wisdom should include Mystery School entries"
        print(f"✓ Ancient Wisdom includes {len(mystery_related)} Mystery School related entries")


class TestAlchemyHubMysterySchoolIntegration:
    """Tests for Mystery School integration in Alchemy Hub"""

    def test_sacred_ally_alchemy_endpoint(self):
        """Test Sacred Ally Alchemy endpoint works"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Sacred Ally Alchemy returned {len(data)} items")

    def test_angelic_alchemy_endpoint(self):
        """Test Angelic Alchemy endpoint works"""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Angelic Alchemy returned {len(data)} items")


class TestMysterySchoolDataQuality:
    """Tests for data quality in Mystery School teachings"""

    def test_all_streams_have_14_visible_teachings(self):
        """Verify each stream has 14 visible teachings (4 free + 10 premium)"""
        streams = ["egyptian_mystery", "priestess_rose", "emerald_tablet", "merlin_alchemy"]
        
        for stream in streams:
            response = requests.get(f"{BASE_URL}/api/mystery-school", params={"stream": stream})
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 14, f"Stream {stream} should have 14 visible teachings, got {len(data)}"
        
        print("✓ All 4 streams have exactly 14 visible teachings each (tiered)")

    def test_teachings_have_ritual_layers(self):
        """Verify teachings have full ritual layers (alchemy, ritual, ceremony, guided_practice)"""
        response = requests.get(f"{BASE_URL}/api/mystery-school", params={"stream": "egyptian_mystery"})
        assert response.status_code == 200
        data = response.json()
        
        for item in data:
            assert "alchemy" in item and len(item["alchemy"]) > 0, f"Missing alchemy in {item.get('id')}"
            assert "ritual" in item and len(item["ritual"]) > 0, f"Missing ritual in {item.get('id')}"
            assert "ceremony" in item and len(item["ceremony"]) > 0, f"Missing ceremony in {item.get('id')}"
            assert "guided_practice" in item and len(item["guided_practice"]) > 0, f"Missing guided_practice in {item.get('id')}"
        
        print("✓ All visible teachings have complete ritual layers")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
