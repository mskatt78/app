"""
Iteration 67 - Test narration consistency across entire app
Tests GuidedAudioButton and PracticeTimer integration with /api/content/expand-script
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

class TestExpandScriptEndpoint:
    """Test /api/content/expand-script endpoint for narration generation"""
    
    def test_expand_script_basic_request(self):
        """Test basic expand-script request returns valid response"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Test Practice",
                "element": "Spirit",
                "duration_minutes": 10,
                "use_ai": False,
                "steps": ["Step 1: Breathe deeply", "Step 2: Relax your body"],
                "source_texts": ["This is a calming practice for inner peace."]
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify response structure
        assert "practice_name" in data
        assert "target_minutes" in data
        assert "word_count" in data
        assert "paragraphs" in data
        assert "segments" in data
        assert isinstance(data["paragraphs"], list)
        assert isinstance(data["segments"], list)
        assert len(data["paragraphs"]) > 0
        assert len(data["segments"]) > 0
        print(f"PASS: expand-script returned {len(data['paragraphs'])} paragraphs, {len(data['segments'])} segments")
    
    def test_expand_script_minimum_duration(self):
        """Test that minimum 7 minutes is enforced"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Short Practice",
                "element": "Earth",
                "duration_minutes": 3,  # Below minimum
                "use_ai": False,
                "steps": [],
                "source_texts": []
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["target_minutes"] >= 7, f"Expected target_minutes >= 7, got {data['target_minutes']}"
        print(f"PASS: Minimum duration enforced - target_minutes={data['target_minutes']}")
    
    def test_expand_script_word_count_meets_target(self):
        """Test that word count meets minimum target for duration"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Long Practice",
                "element": "Fire",
                "duration_minutes": 15,
                "use_ai": False,
                "steps": ["Step 1: Ground yourself", "Step 2: Activate your core"],
                "source_texts": ["Fire element brings transformation and courage."]
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # 120 words per minute target
        expected_min_words = data["target_minutes"] * 120 * 0.8  # Allow 20% tolerance
        assert data["word_count"] >= expected_min_words, f"Word count {data['word_count']} below expected {expected_min_words}"
        print(f"PASS: Word count {data['word_count']} meets target for {data['target_minutes']} minutes")
    
    def test_expand_script_segments_for_tts(self):
        """Test that segments are properly chunked for TTS playback"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Segmented Practice",
                "element": "Water",
                "duration_minutes": 10,
                "use_ai": False,
                "steps": ["Step 1: Flow with breath", "Step 2: Release tension"],
                "source_texts": ["Water element brings emotional healing and fluidity."]
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Each segment should be reasonable length for TTS
        for i, segment in enumerate(data["segments"]):
            word_count = len(segment.split())
            assert word_count > 50, f"Segment {i} too short: {word_count} words"
            assert word_count < 500, f"Segment {i} too long: {word_count} words"
        print(f"PASS: {len(data['segments'])} segments all within TTS-friendly length")
    
    def test_expand_script_no_repetitive_stems(self):
        """Test that paragraphs don't have excessive repetitive sentence stems"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Variety Test",
                "element": "Air",
                "duration_minutes": 12,
                "use_ai": False,
                "steps": ["Step 1: Clear your mind", "Step 2: Expand awareness"],
                "source_texts": ["Air element brings clarity and mental spaciousness."]
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check for repetitive stems
        all_text = " ".join(data["paragraphs"]).lower()
        
        # These stems were problematic in iteration 65
        problematic_stems = [
            "as this journey continues",
            "let this round nourish",
            "keep awareness near"
        ]
        
        for stem in problematic_stems:
            count = all_text.count(stem)
            assert count <= 2, f"Stem '{stem}' appears {count} times (max 2 allowed)"
        
        print("PASS: No excessive repetitive stems found")


class TestTTSEndpoint:
    """Test TTS endpoint used by GuidedAudioButton and PracticeTimer"""
    
    def test_tts_generate_base64(self):
        """Test TTS generation returns valid audio base64"""
        response = requests.post(
            f"{BASE_URL}/api/tts/generate-base64",
            json={
                "text": "Welcome to this guided practice. Take a deep breath.",
                "voice": "nova",
                "speed": 0.88
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert "audio_base64" in data, "Missing audio_base64 in response"
        assert len(data["audio_base64"]) > 100, "Audio base64 too short"
        print(f"PASS: TTS returned audio_base64 of length {len(data['audio_base64'])}")
    
    def test_tts_with_long_text(self):
        """Test TTS handles longer narration segments"""
        long_text = """
        Welcome to this sacred practice. Settle into a comfortable position and let your breath begin to slow.
        Allow the outer world to soften at the edges so your awareness can gather here, in this sacred practice,
        with your full and willing presence. Begin by arriving deliberately. Feel the surface beneath you.
        Notice your jaw, your shoulders, your belly, and your heart.
        """
        response = requests.post(
            f"{BASE_URL}/api/tts/generate-base64",
            json={
                "text": long_text.strip(),
                "voice": "nova",
                "speed": 0.88
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "audio_base64" in data
        print(f"PASS: TTS handled long text, returned {len(data['audio_base64'])} chars")


class TestLegacyPageEndpoints:
    """Test endpoints used by legacy pages with GuidedAudioButton/PracticeTimer"""
    
    def test_elemental_practices_endpoint(self):
        """Test elemental practices data for ElementalPractices page"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Check practice has required fields for narration
        practice = data[0]
        assert "name" in practice
        assert "element" in practice
        print(f"PASS: elemental-practices returned {len(data)} practices")
    
    def test_shamanic_practices_endpoint(self):
        """Test shamanic practices data for ShamanicPractices page"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"PASS: shamanic-practices returned {len(data)} practices")
    
    def test_daily_practice_endpoint(self):
        """Test daily practice data for DailySacredPractice page"""
        response = requests.get(f"{BASE_URL}/api/daily-practice")
        assert response.status_code == 200
        data = response.json()
        
        assert "morning_practice" in data
        assert "evening_practice" in data
        assert "moon_phase" in data
        print("PASS: daily-practice returned morning and evening practices")
    
    def test_ancient_wisdom_endpoint(self):
        """Test ancient wisdom data for AncientWisdom page"""
        response = requests.get(f"{BASE_URL}/api/ancient-wisdom")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: ancient-wisdom returned {len(data)} entries")
    
    def test_feminine_embodiment_endpoint(self):
        """Test feminine embodiment data for RoseTemple page"""
        response = requests.get(f"{BASE_URL}/api/feminine-embodiment")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"PASS: feminine-embodiment returned {len(data)} practices")
    
    def test_masculine_embodiment_endpoint(self):
        """Test masculine embodiment data for MasculineTemple page"""
        response = requests.get(f"{BASE_URL}/api/masculine-embodiment")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"PASS: masculine-embodiment returned {len(data)} practices")


class TestExpandScriptIntegration:
    """Test expand-script with realistic data from legacy pages"""
    
    def test_expand_script_with_elemental_practice_data(self):
        """Test expand-script with data similar to ElementalPractices page"""
        # First get an elemental practice
        practices_response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert practices_response.status_code == 200
        practices = practices_response.json()
        
        if practices:
            practice = practices[0]
            
            # Build request similar to GuidedAudioButton
            response = requests.post(
                f"{BASE_URL}/api/content/expand-script",
                json={
                    "practice_name": practice.get("name", "Elemental Practice"),
                    "element": practice.get("element", "Spirit"),
                    "duration_minutes": practice.get("duration_minutes", 10),
                    "use_ai": False,
                    "steps": practice.get("steps", []),
                    "source_texts": [
                        practice.get("description", ""),
                        practice.get("guidance", "")
                    ]
                }
            )
            assert response.status_code == 200
            data = response.json()
            assert len(data["segments"]) > 0
            print(f"PASS: expand-script works with elemental practice '{practice.get('name')}'")
    
    def test_expand_script_with_shamanic_practice_data(self):
        """Test expand-script with data similar to ShamanicPractices page"""
        practices_response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert practices_response.status_code == 200
        practices = practices_response.json()
        
        if practices:
            practice = practices[0]
            
            response = requests.post(
                f"{BASE_URL}/api/content/expand-script",
                json={
                    "practice_name": practice.get("name", "Shamanic Practice"),
                    "element": practice.get("element", "Spirit"),
                    "duration_minutes": practice.get("duration_minutes", 15),
                    "use_ai": False,
                    "steps": practice.get("steps", []),
                    "source_texts": [
                        practice.get("description", ""),
                        practice.get("guidance", "")
                    ]
                }
            )
            assert response.status_code == 200
            data = response.json()
            assert len(data["segments"]) > 0
            print(f"PASS: expand-script works with shamanic practice '{practice.get('name')}'")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
