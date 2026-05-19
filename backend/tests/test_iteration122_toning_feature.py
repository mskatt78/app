"""
Iteration 122 - Toning Feature Testing
Tests for combined toning across all guided practices:
- Backend script-level toning cues via include_toning parameter
- POST /api/content/expand-script with include_toning support
- Expanded scripts satisfy long-duration behavior (>=7-minute target via word floor)
- TTS endpoint /api/tts/generate-base64 works with expanded script output
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

class TestExpandScriptToningFeature:
    """Tests for expand-script endpoint with toning support"""

    def test_expand_script_basic_with_toning(self):
        """Test expand-script returns long-form segments with include_toning=true"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Grounding Meditation",
                "element": "earth",
                "duration_minutes": 7,
                "use_ai": False,
                "include_toning": True,
                "steps": ["Ground your feet", "Breathe deeply", "Feel the earth"],
                "source_texts": ["This practice connects you to the earth element"]
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "paragraphs" in data
        assert "segments" in data
        assert "word_count" in data
        assert "target_word_count" in data
        assert "target_minutes" in data
        
        # Verify minimum 7-minute target
        assert data["target_minutes"] >= 7
        
        # Verify word count meets floor (84% of target for strict mode)
        minimum_floor = int(data["target_word_count"] * 0.84)
        assert data["word_count"] >= minimum_floor, f"Word count {data['word_count']} below floor {minimum_floor}"
        
        # Verify toning cues are injected in paragraphs
        all_text = " ".join(data["paragraphs"])
        toning_indicators = ["tone", "hum", "ahh", "ooh", "mmm", "syllable", "LAM", "VAM", "RAM", "YAM", "OM"]
        has_toning = any(indicator.lower() in all_text.lower() for indicator in toning_indicators)
        assert has_toning, "Expected toning cues in paragraphs when include_toning=True"
        
        print(f"PASS: expand-script with toning - {data['word_count']} words, {len(data['segments'])} segments")

    def test_expand_script_without_toning(self):
        """Test expand-script works without toning (include_toning=false)"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Silent Meditation",
                "element": "spirit",
                "duration_minutes": 7,
                "use_ai": False,
                "include_toning": False,
                "steps": ["Sit quietly", "Observe breath"],
                "source_texts": ["A silent practice for inner peace"]
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["target_minutes"] >= 7
        assert len(data["paragraphs"]) > 0
        assert len(data["segments"]) > 0
        
        print(f"PASS: expand-script without toning - {data['word_count']} words")

    def test_expand_script_default_toning_true(self):
        """Test expand-script defaults to include_toning=true when not specified"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Default Toning Test",
                "element": "water",
                "duration_minutes": 7,
                "use_ai": False,
                "steps": ["Flow with breath"],
                "source_texts": ["Water element practice"]
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        all_text = " ".join(data["paragraphs"])
        toning_indicators = ["tone", "hum", "ahh", "ooh", "mmm", "syllable", "VAM"]
        has_toning = any(indicator.lower() in all_text.lower() for indicator in toning_indicators)
        assert has_toning, "Expected toning cues by default (include_toning defaults to True)"
        
        print("PASS: expand-script defaults to toning enabled")

    def test_expand_script_element_specific_seed_syllables(self):
        """Test that element-specific seed syllables are used"""
        elements_seeds = {
            "earth": "LAM",
            "water": "VAM", 
            "fire": "RAM",
            "air": "YAM",
            "spirit": "OM"
        }
        
        for element, expected_seed in elements_seeds.items():
            response = requests.post(
                f"{BASE_URL}/api/content/expand-script",
                json={
                    "practice_name": f"{element.title()} Element Practice",
                    "element": element,
                    "duration_minutes": 7,
                    "use_ai": False,
                    "include_toning": True,
                    "steps": [f"Connect with {element}"],
                    "source_texts": [f"A {element} element practice"]
                }
            )
            assert response.status_code == 200
            
            data = response.json()
            all_text = " ".join(data["paragraphs"])
            
            # Check for seed syllable in text
            assert expected_seed in all_text, f"Expected seed syllable {expected_seed} for {element} element"
            
            print(f"PASS: {element} element uses {expected_seed} seed syllable")

    def test_expand_script_strict_anti_repetition_mode(self):
        """Test expand-script with strict anti-repetition mode"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Strict Mode Test",
                "element": "spirit",
                "duration_minutes": 10,
                "use_ai": False,
                "include_toning": True,
                "anti_repetition_mode": "strict",
                "steps": ["Breathe", "Relax", "Focus"],
                "source_texts": ["Deep meditation practice"]
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        # Strict mode should have 84% word floor
        minimum_floor = int(data["target_word_count"] * 0.84)
        assert data["word_count"] >= minimum_floor
        
        print(f"PASS: strict anti-repetition mode - {data['word_count']} words")

    def test_expand_script_balanced_anti_repetition_mode(self):
        """Test expand-script with balanced anti-repetition mode"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Balanced Mode Test",
                "element": "fire",
                "duration_minutes": 10,
                "use_ai": False,
                "include_toning": True,
                "anti_repetition_mode": "balanced",
                "steps": ["Ignite inner fire", "Build energy"],
                "source_texts": ["Fire element activation"]
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        # Balanced mode should have 80% word floor
        minimum_floor = int(data["target_word_count"] * 0.80)
        assert data["word_count"] >= minimum_floor
        
        print(f"PASS: balanced anti-repetition mode - {data['word_count']} words")

    def test_expand_script_long_duration(self):
        """Test expand-script handles longer durations (15+ minutes)"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Extended Practice",
                "element": "spirit",
                "duration_minutes": 15,
                "use_ai": False,
                "include_toning": True,
                "steps": ["Begin", "Deepen", "Integrate", "Complete"],
                "source_texts": ["An extended spiritual practice for deep transformation"]
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["target_minutes"] >= 15
        # 15 min * 120 wpm = 1800 words target
        assert data["target_word_count"] >= 1800
        
        print(f"PASS: long duration - {data['target_minutes']} min, {data['word_count']} words")

    def test_expand_script_minimum_duration_enforced(self):
        """Test that minimum 7-minute duration is enforced"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Short Practice",
                "element": "air",
                "duration_minutes": 3,  # Below minimum
                "use_ai": False,
                "include_toning": True,
                "steps": ["Quick breath"],
                "source_texts": ["Brief practice"]
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        # Should be enforced to minimum 7 minutes
        assert data["target_minutes"] >= 7
        
        print(f"PASS: minimum duration enforced - {data['target_minutes']} min")


class TestTTSEndpoint:
    """Tests for TTS endpoint with expanded script output"""

    def test_tts_generate_base64_basic(self):
        """Test TTS endpoint generates audio for text"""
        response = requests.post(
            f"{BASE_URL}/api/tts/generate-base64",
            json={
                "text": "Welcome to this guided meditation. Take a deep breath.",
                "voice": "nova",
                "speed": 0.82
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "audio_base64" in data
        assert len(data["audio_base64"]) > 100  # Should have substantial audio data
        
        print(f"PASS: TTS generates audio - {len(data['audio_base64'])} chars base64")

    def test_tts_with_expanded_script_segment(self):
        """Test TTS works with a segment from expand-script"""
        # First get an expanded script
        expand_response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "TTS Test Practice",
                "element": "spirit",
                "duration_minutes": 7,
                "use_ai": False,
                "include_toning": True,
                "steps": ["Breathe deeply"],
                "source_texts": ["A calming practice"]
            }
        )
        assert expand_response.status_code == 200
        
        expand_data = expand_response.json()
        assert len(expand_data["segments"]) > 0
        
        # Use first segment for TTS
        first_segment = expand_data["segments"][0]
        
        tts_response = requests.post(
            f"{BASE_URL}/api/tts/generate-base64",
            json={
                "text": first_segment,
                "voice": "nova",
                "speed": 0.82
            }
        )
        assert tts_response.status_code == 200
        
        tts_data = tts_response.json()
        assert "audio_base64" in tts_data
        assert len(tts_data["audio_base64"]) > 100
        
        print("PASS: TTS works with expanded script segment")

    def test_tts_with_toning_cue_text(self):
        """Test TTS handles text containing toning cues"""
        toning_text = (
            "If it feels supportive, add a soft vocal tone under the breath. "
            "Try gentle sounds like ahh, ooh, or mmm. "
            "You can weave in a light seed syllable: OM."
        )
        
        response = requests.post(
            f"{BASE_URL}/api/tts/generate-base64",
            json={
                "text": toning_text,
                "voice": "nova",
                "speed": 0.82
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "audio_base64" in data
        
        print("PASS: TTS handles toning cue text")


class TestExpandScriptNoRegressions:
    """Regression tests to ensure no breaking changes"""

    def test_expand_script_returns_all_required_fields(self):
        """Test expand-script response has all required fields"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Field Test",
                "element": "spirit",
                "duration_minutes": 7,
                "use_ai": False,
                "include_toning": True,
                "steps": ["Test step"],
                "source_texts": ["Test source"]
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        required_fields = ["practice_name", "target_minutes", "target_word_count", "word_count", "used_ai", "paragraphs", "segments"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        print("PASS: All required fields present")

    def test_expand_script_segments_are_strings(self):
        """Test that segments are strings (not nested objects)"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Segment Type Test",
                "element": "earth",
                "duration_minutes": 7,
                "use_ai": False,
                "include_toning": True,
                "steps": ["Ground yourself"],
                "source_texts": ["Earth practice"]
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        for segment in data["segments"]:
            assert isinstance(segment, str), f"Segment should be string, got {type(segment)}"
        
        print("PASS: All segments are strings")

    def test_expand_script_paragraphs_are_strings(self):
        """Test that paragraphs are strings"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Paragraph Type Test",
                "element": "water",
                "duration_minutes": 7,
                "use_ai": False,
                "include_toning": True,
                "steps": ["Flow with water"],
                "source_texts": ["Water practice"]
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        for paragraph in data["paragraphs"]:
            assert isinstance(paragraph, str), f"Paragraph should be string, got {type(paragraph)}"
        
        print("PASS: All paragraphs are strings")

    def test_expand_script_empty_steps_handled(self):
        """Test expand-script handles empty steps gracefully"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "No Steps Practice",
                "element": "spirit",
                "duration_minutes": 7,
                "use_ai": False,
                "include_toning": True,
                "steps": [],
                "source_texts": ["A practice without explicit steps"]
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["paragraphs"]) > 0
        assert len(data["segments"]) > 0
        
        print("PASS: Empty steps handled gracefully")

    def test_expand_script_empty_source_texts_handled(self):
        """Test expand-script handles empty source_texts gracefully"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "No Source Practice",
                "element": "fire",
                "duration_minutes": 7,
                "use_ai": False,
                "include_toning": True,
                "steps": ["Ignite your inner fire"],
                "source_texts": []
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["paragraphs"]) > 0
        assert len(data["segments"]) > 0
        
        print("PASS: Empty source_texts handled gracefully")


class TestHealthAndBasicEndpoints:
    """Basic health and endpoint availability tests"""

    def test_health_endpoint(self):
        """Test health endpoint is available"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("PASS: Health endpoint available")

    def test_yoga_poses_endpoint(self):
        """Test yoga poses endpoint works"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Yoga poses endpoint - {len(data)} poses")

    def test_breathwork_sessions_endpoint(self):
        """Test breathwork sessions endpoint works"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Breathwork sessions endpoint - {len(data)} sessions")

    def test_meditations_endpoint(self):
        """Test meditations endpoint works"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Meditations endpoint - {len(data)} meditations")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
