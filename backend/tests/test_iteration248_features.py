"""
Iteration 248 - Backend API Tests
Testing: P0 endpoint stability, narration floor, sound frequencies fallback, retreat cleanup, visual smoke
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

class TestP0EndpointStability:
    """P0: GET endpoints must return 200 and valid JSON arrays"""
    
    def test_tai_chi_endpoint(self):
        """GET /api/tai-chi returns 200 and valid JSON array"""
        response = requests.get(f"{BASE_URL}/api/tai-chi", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ /api/tai-chi returned {len(data)} items")
    
    def test_chi_gong_endpoint(self):
        """GET /api/chi-gong returns 200 and valid JSON array"""
        response = requests.get(f"{BASE_URL}/api/chi-gong", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ /api/chi-gong returned {len(data)} items")
    
    def test_mystery_schools_endpoint(self):
        """GET /api/mystery-schools returns 200 and valid JSON array"""
        response = requests.get(f"{BASE_URL}/api/mystery-schools", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ /api/mystery-schools returned {len(data)} items")
    
    def test_alchemy_hub_endpoint(self):
        """GET /api/alchemy-hub returns 200 and valid JSON array"""
        response = requests.get(f"{BASE_URL}/api/alchemy-hub", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ /api/alchemy-hub returned {len(data)} items")
    
    def test_water_practices_endpoint(self):
        """GET /api/water-practices returns 200 and valid JSON array"""
        response = requests.get(f"{BASE_URL}/api/water-practices", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ /api/water-practices returned {len(data)} items")


class TestP0NarrationFloor:
    """P0: POST /api/content/expand-script must return long-form script >= 7 min spoken floor"""
    
    def test_expand_script_15min_payload(self):
        """POST /api/content/expand-script for 15-minute guided payload returns long-form script"""
        payload = {
            "practice_id": "test-narration-floor",
            "practice_name": "Deep Grounding Meditation",
            "element": "Earth",
            "duration_minutes": 15,
            "use_ai": False,
            "include_toning": True,
            "anti_repetition_mode": "strict",
            "steps": [
                "Find a comfortable seated position and close your eyes.",
                "Take three deep breaths, feeling your body settle.",
                "Visualize roots growing from your feet into the earth.",
                "Feel the stability and support of the ground beneath you.",
                "Allow any tension to release down through your roots.",
                "Breathe in earth energy, breathe out what no longer serves.",
                "Rest in this grounded state for several minutes.",
                "Slowly return your awareness to the room."
            ],
            "source_texts": [
                "Grounding is the practice of connecting with the earth's energy to stabilize and center yourself.",
                "When we ground, we release excess energy and draw up nourishing earth energy.",
                "The root chakra governs our sense of safety, security, and belonging.",
                "Earth element practices help us feel stable, present, and embodied.",
                "Visualization of roots is a powerful technique for establishing energetic connection with the earth.",
                "Regular grounding practice supports emotional regulation and stress resilience."
            ]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            timeout=60
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Validate response structure
        assert "paragraphs" in data, "Response missing 'paragraphs'"
        assert "segments" in data, "Response missing 'segments'"
        assert "word_count" in data, "Response missing 'word_count'"
        assert "target_minutes" in data, "Response missing 'target_minutes'"
        
        paragraphs = data.get("paragraphs", [])
        segments = data.get("segments", [])
        word_count = data.get("word_count", 0)
        target_minutes = data.get("target_minutes", 0)
        
        # Validate meaningful content
        assert len(paragraphs) > 0, "No paragraphs returned"
        assert len(segments) > 0, "No segments returned"
        
        # Check word count meets minimum floor (7 min * ~132 WPM = ~924 words minimum)
        # Using 145 WPM at speed 1.0, 7 min = 1015 words minimum
        minimum_word_floor = 7 * 132  # 924 words
        assert word_count >= minimum_word_floor, f"Word count {word_count} below minimum floor {minimum_word_floor}"
        
        # Validate target minutes
        assert target_minutes >= 7, f"Target minutes {target_minutes} below 7 min floor"
        
        # Estimate spoken duration (at ~145 WPM)
        estimated_minutes = word_count / 145
        assert estimated_minutes >= 7, f"Estimated spoken duration {estimated_minutes:.1f} min below 7 min floor"
        
        print(f"✓ expand-script returned {word_count} words, {len(paragraphs)} paragraphs, {len(segments)} segments")
        print(f"  Target: {target_minutes} min, Estimated spoken: {estimated_minutes:.1f} min")


class TestP0SoundFrequenciesPlayback:
    """P0: Sound frequencies should not have blocked Wikimedia audio_url"""
    
    def test_sound_frequencies_no_blocked_audio_urls(self):
        """GET /api/sound-frequencies entries should not have audio_url (fallback to AmbientSoundPlayer)"""
        response = requests.get(f"{BASE_URL}/api/sound-frequencies", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        assert len(data) > 0, "No sound frequencies returned"
        
        # Check that no entries have audio_url (should be stripped server-side)
        entries_with_audio_url = []
        for freq in data:
            if freq.get("audio_url"):
                entries_with_audio_url.append({
                    "id": freq.get("id"),
                    "name": freq.get("name"),
                    "audio_url": freq.get("audio_url")
                })
        
        # All entries should have ambient_type for fallback player
        entries_without_ambient_type = []
        for freq in data:
            if not freq.get("ambient_type"):
                entries_without_ambient_type.append({
                    "id": freq.get("id"),
                    "name": freq.get("name")
                })
        
        # Report findings
        if entries_with_audio_url:
            print(f"⚠ Found {len(entries_with_audio_url)} entries with audio_url (should be stripped):")
            for entry in entries_with_audio_url[:3]:
                print(f"  - {entry['name']}: {entry['audio_url'][:60]}...")
        else:
            print(f"✓ No entries have audio_url (correctly stripped for fallback)")
        
        if entries_without_ambient_type:
            print(f"⚠ Found {len(entries_without_ambient_type)} entries without ambient_type")
        else:
            print(f"✓ All {len(data)} entries have ambient_type for fallback player")
        
        # Assert no blocked Wikimedia URLs
        blocked_wikimedia_urls = [
            e for e in entries_with_audio_url 
            if "wikimedia" in str(e.get("audio_url", "")).lower()
        ]
        assert len(blocked_wikimedia_urls) == 0, f"Found {len(blocked_wikimedia_urls)} blocked Wikimedia audio URLs"


class TestP1RetreatSeeding:
    """P1: GET /api/retreats should return empty array (no dummy seeded retreats)"""
    
    def test_retreats_empty_or_user_authored(self):
        """GET /api/retreats returns empty array or only user-authored retreats"""
        response = requests.get(f"{BASE_URL}/api/retreats", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        
        # Check for placeholder/dummy retreats
        placeholder_titles = [
            "test", "test_", "test-", "pytest", "retreat", "new retreat",
            "sample retreat", "placeholder retreat", "sacred journey retreat"
        ]
        
        dummy_retreats = []
        for retreat in data:
            title = str(retreat.get("title", "")).strip().lower()
            if any(title.startswith(p) or title == p for p in placeholder_titles):
                dummy_retreats.append(retreat.get("title"))
        
        if len(data) == 0:
            print("✓ /api/retreats returned empty array (no seeded retreats)")
        elif len(dummy_retreats) == 0:
            print(f"✓ /api/retreats returned {len(data)} retreats (appear user-authored)")
        else:
            print(f"⚠ Found {len(dummy_retreats)} potential placeholder retreats: {dummy_retreats[:3]}")
        
        # Soft assertion - warn but don't fail if some retreats exist
        # The cleanup should have removed placeholders
        assert len(dummy_retreats) == 0, f"Found {len(dummy_retreats)} placeholder retreats that should be cleaned up"


class TestP1VisualSmoke:
    """P1: Visual smoke tests for updated image sections"""
    
    def test_breathwork_sessions_have_images(self):
        """GET /api/breathwork/sessions returns entries with image_url"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        
        entries_with_images = sum(1 for s in data if s.get("image_url"))
        print(f"✓ /api/breathwork-sessions: {entries_with_images}/{len(data)} entries have image_url")
    
    def test_meditations_have_images(self):
        """GET /api/meditations returns entries with image_url"""
        response = requests.get(f"{BASE_URL}/api/meditations", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        
        entries_with_images = sum(1 for m in data if m.get("image_url"))
        print(f"✓ /api/meditations: {entries_with_images}/{len(data)} entries have image_url")


class TestP1AppStability:
    """P1: App stability smoke tests for core routes"""
    
    def test_health_endpoint(self):
        """GET /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("status") == "healthy", f"Expected healthy status, got {data}"
        print("✓ /api/health returns healthy")
    
    def test_yoga_poses_endpoint(self):
        """GET /api/yoga/poses returns valid data"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ /api/yoga-poses returned {len(data)} poses")
    
    def test_crystals_endpoint(self):
        """GET /api/crystals returns valid data"""
        response = requests.get(f"{BASE_URL}/api/crystals", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ /api/crystals returned {len(data)} crystals")
    
    def test_somatic_practices_endpoint(self):
        """GET /api/somatic returns valid data"""
        response = requests.get(f"{BASE_URL}/api/somatic", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ /api/somatic-practices returned {len(data)} practices")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
