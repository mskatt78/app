"""
Iteration 245 - Testing image alignment, narration floor, and retreat normalization
Tests:
1. Mystery School image relevance per stream
2. Alchemy/Ancient/Sacred endpoints image alignment
3. Narration expansion duration floor (15 min minimum)
4. Retreat API normalization
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

class TestMysterySchoolImages:
    """Test Mystery School streams return themed, non-blank images"""
    
    STREAMS = ["egyptian_mystery", "priestess_rose", "merlin_alchemy", "emerald_tablet"]
    
    def test_mystery_school_all_streams_have_images(self):
        """Each stream should return entries with non-blank image_url values"""
        response = requests.get(f"{BASE_URL}/api/mystery-school")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should return at least some teachings"
        
        # Check that entries have image_url
        entries_with_images = [e for e in data if e.get("image_url")]
        assert len(entries_with_images) > 0, "At least some entries should have image_url"
        
    @pytest.mark.parametrize("stream", STREAMS)
    def test_stream_specific_images(self, stream):
        """Each stream should return entries with themed images, not all the same"""
        response = requests.get(f"{BASE_URL}/api/mystery-school?stream={stream}")
        assert response.status_code == 200, f"Stream {stream} failed with {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), f"Stream {stream} should return a list"
        assert len(data) > 0, f"Stream {stream} should have entries"
        
        # Collect image URLs
        image_urls = [e.get("image_url") for e in data if e.get("image_url")]
        assert len(image_urls) > 0, f"Stream {stream} should have entries with image_url"
        
        # Check images are not all blank
        non_blank_images = [url for url in image_urls if url and url.strip()]
        assert len(non_blank_images) > 0, f"Stream {stream} should have non-blank image URLs"
        
    def test_streams_have_different_images(self):
        """Different streams should not all collapse to a single generic image"""
        stream_images = {}
        
        for stream in self.STREAMS:
            response = requests.get(f"{BASE_URL}/api/mystery-school?stream={stream}")
            assert response.status_code == 200
            data = response.json()
            
            # Get first image from each stream
            images = [e.get("image_url") for e in data[:3] if e.get("image_url")]
            stream_images[stream] = images
        
        # Verify we got images from each stream
        for stream, images in stream_images.items():
            assert len(images) > 0, f"Stream {stream} should have images"
        
        # Check that not all streams have identical first images
        first_images = [imgs[0] if imgs else None for imgs in stream_images.values()]
        unique_images = set(img for img in first_images if img)
        # At least 2 different images across 4 streams
        assert len(unique_images) >= 2, f"Streams should have varied images, got: {unique_images}"


class TestAlchemyAndAncientEndpointsImages:
    """Test that alchemy and ancient wisdom endpoints return valid images"""
    
    def test_sacred_ally_alchemy_images(self):
        """Sacred ally alchemy should return entries with valid images"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        if len(data) > 0:
            entries_with_images = [e for e in data if e.get("image_url")]
            assert len(entries_with_images) > 0, "Should have entries with image_url"
            
            # Verify images are valid URLs
            for entry in entries_with_images[:5]:
                url = entry.get("image_url", "")
                assert url.startswith("http"), f"Image URL should be valid: {url}"
    
    def test_angelic_alchemy_images(self):
        """Angelic alchemy should return entries with valid images"""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        if len(data) > 0:
            entries_with_images = [e for e in data if e.get("image_url")]
            assert len(entries_with_images) > 0, "Should have entries with image_url"
    
    def test_ancient_wisdom_images(self):
        """Ancient wisdom should return entries with valid images"""
        response = requests.get(f"{BASE_URL}/api/ancient-wisdom")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        if len(data) > 0:
            entries_with_images = [e for e in data if e.get("image_url")]
            assert len(entries_with_images) > 0, "Should have entries with image_url"


class TestNarrationExpansionDurationFloor:
    """Test that narration expansion enforces 15-minute minimum"""
    
    def test_expand_script_with_10_minutes_enforces_15_min_floor(self):
        """Request for 10 minutes should be elevated to 15 minutes minimum"""
        payload = {
            "practice_name": "Test Grounding Practice",
            "duration_minutes": 10,
            "element": "earth",
            "source_texts": ["Ground into the earth and breathe deeply."]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            timeout=60
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Check that target_minutes is at least 15
        target_minutes = data.get("target_minutes", 0)
        assert target_minutes >= 15, f"Target minutes should be >= 15, got {target_minutes}"
        
        # Check word count is substantial (15 min * ~120 wpm = ~1800 words minimum)
        word_count = data.get("word_count", 0)
        assert word_count >= 1000, f"Word count should be substantial, got {word_count}"
    
    def test_expand_script_with_15_minutes_preserves_15(self):
        """Request for 15 minutes should preserve 15 minutes"""
        payload = {
            "practice_name": "Test Water Practice",
            "duration_minutes": 15,
            "element": "water",
            "source_texts": ["Flow with the water element."]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            timeout=60
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        target_minutes = data.get("target_minutes", 0)
        assert target_minutes >= 15, f"Target minutes should be >= 15, got {target_minutes}"
    
    def test_expand_script_with_20_minutes_preserves_20(self):
        """Request for 20 minutes should preserve 20 minutes"""
        payload = {
            "practice_name": "Test Fire Practice",
            "duration_minutes": 20,
            "element": "fire",
            "source_texts": ["Ignite the inner fire."]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            timeout=60
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        target_minutes = data.get("target_minutes", 0)
        assert target_minutes >= 20, f"Target minutes should be >= 20 for 20-min request, got {target_minutes}"
        
        # 20 min * ~120 wpm = ~2400 words
        word_count = data.get("word_count", 0)
        assert word_count >= 1500, f"Word count for 20 min should be substantial, got {word_count}"


class TestRetreatAPINormalization:
    """Test retreat API returns normalized fields"""
    
    def test_retreats_endpoint_healthy(self):
        """Retreats endpoint should return 200 even if empty"""
        response = requests.get(f"{BASE_URL}/api/retreats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
    
    def test_retreats_have_normalized_fields(self):
        """If retreats exist, they should have normalized fields"""
        response = requests.get(f"{BASE_URL}/api/retreats")
        assert response.status_code == 200
        
        data = response.json()
        
        if len(data) > 0:
            retreat = data[0]
            
            # Check title/name compatibility
            has_title_or_name = retreat.get("title") or retreat.get("name")
            assert has_title_or_name, "Retreat should have title or name"
            
            # Check retreat_mode field exists
            assert "retreat_mode" in retreat, "Retreat should have retreat_mode field"
            mode = retreat.get("retreat_mode", "")
            assert mode in ["physical", "online", "hybrid"], f"Invalid retreat_mode: {mode}"
            
            # Check social_media_links is a list
            social_links = retreat.get("social_media_links")
            assert isinstance(social_links, list), "social_media_links should be a list"
    
    def test_retreats_social_links_structure(self):
        """Social media links should have proper structure"""
        response = requests.get(f"{BASE_URL}/api/retreats")
        assert response.status_code == 200
        
        data = response.json()
        
        for retreat in data:
            social_links = retreat.get("social_media_links", [])
            for link in social_links:
                assert isinstance(link, dict), "Each social link should be a dict"
                assert "platform" in link or "url" in link, "Social link should have platform or url"


class TestGeneralRegression:
    """General regression checks for key endpoints"""
    
    def test_health_endpoint(self):
        """Health endpoint should work"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
    
    def test_yoga_poses_endpoint(self):
        """Yoga poses should load"""
        response = requests.get(f"{BASE_URL}/api/yoga-poses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_breathwork_endpoint(self):
        """Breathwork should load"""
        response = requests.get(f"{BASE_URL}/api/breathwork")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_meditations_endpoint(self):
        """Meditations should load"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_crystals_endpoint(self):
        """Crystals should load"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
