"""
Iteration 128 - Regression tests for P1 refactors:
- GuidedAudioButton logic extraction to useGuidedAudioPlayback
- InstallPrompt state logic extraction to useInstallPromptState
- AmbientSoundPlayer sound dispatch refactor
- Backend TTS endpoints (meditation/somatic) after helper extraction
- Backend content/expand-script after helper decomposition
- Centralized logger utility usage
"""
import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

class TestTTSEndpointsAfterHelperExtraction:
    """Test TTS endpoints still work after helper function extraction in routers/tts.py"""
    
    def test_tts_generate_base64_endpoint(self):
        """Test /api/tts/generate-base64 returns audio base64"""
        response = requests.post(
            f"{BASE_URL}/api/tts/generate-base64",
            json={"text": "Test meditation audio generation.", "voice": "nova", "speed": 0.85},
            timeout=30
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "audio_base64" in data, "Response should contain audio_base64"
        assert "format" in data, "Response should contain format"
        assert data["format"] == "mp3", "Format should be mp3"
        assert len(data["audio_base64"]) > 100, "audio_base64 should have substantial content"
        print(f"PASS: TTS generate-base64 returned {len(data['audio_base64'])} chars of base64 audio")
    
    def test_tts_meditation_parts_info(self):
        """Test /api/tts/meditation/{id}/parts returns part count"""
        response = requests.get(
            f"{BASE_URL}/api/tts/meditation/test-meditation-id/parts",
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "meditation_id" in data, "Response should contain meditation_id"
        assert "total_parts" in data, "Response should contain total_parts"
        assert data["total_parts"] == 4, "Should have 4 parts"
        print(f"PASS: Meditation parts info returned total_parts={data['total_parts']}")
    
    def test_tts_meditation_endpoint_with_valid_meditation(self):
        """Test /api/tts/meditation/{id} generates audio for existing meditation"""
        # First get a meditation ID from the database
        meditations_response = requests.get(f"{BASE_URL}/api/meditations", timeout=10)
        if meditations_response.status_code != 200 or not meditations_response.json():
            pytest.skip("No meditations available in database")
        
        meditations = meditations_response.json()
        meditation_id = meditations[0].get("id")
        if not meditation_id:
            pytest.skip("Meditation has no ID")
        
        # Test meditation TTS generation (part 1)
        response = requests.post(
            f"{BASE_URL}/api/tts/meditation/{meditation_id}",
            params={"voice": "nova", "part": 1},
            timeout=60
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "audio_base64" in data, "Response should contain audio_base64"
        assert len(data["audio_base64"]) > 100, "audio_base64 should have content"
        print(f"PASS: Meditation TTS for '{meditation_id}' part 1 generated successfully")
    
    def test_tts_meditation_invalid_part(self):
        """Test /api/tts/meditation/{id} rejects invalid part numbers"""
        meditations_response = requests.get(f"{BASE_URL}/api/meditations", timeout=10)
        if meditations_response.status_code != 200 or not meditations_response.json():
            pytest.skip("No meditations available")
        
        meditation_id = meditations_response.json()[0].get("id")
        response = requests.post(
            f"{BASE_URL}/api/tts/meditation/{meditation_id}",
            params={"voice": "nova", "part": 5},  # Invalid part
            timeout=30
        )
        assert response.status_code == 400, f"Expected 400 for invalid part, got {response.status_code}"
        print("PASS: Invalid part number correctly rejected with 400")
    
    def test_tts_somatic_endpoint_with_valid_practice(self):
        """Test /api/tts/somatic/{id} generates audio for existing somatic practice"""
        # First get a somatic practice ID
        somatic_response = requests.get(f"{BASE_URL}/api/somatic-practices", timeout=10)
        if somatic_response.status_code != 200 or not somatic_response.json():
            pytest.skip("No somatic practices available")
        
        practices = somatic_response.json()
        practice_id = practices[0].get("id")
        if not practice_id:
            pytest.skip("Somatic practice has no ID")
        
        response = requests.post(
            f"{BASE_URL}/api/tts/somatic/{practice_id}",
            params={"voice": "nova"},
            timeout=60
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "audio_base64" in data, "Response should contain audio_base64"
        assert len(data["audio_base64"]) > 100, "audio_base64 should have content"
        print(f"PASS: Somatic TTS for '{practice_id}' generated successfully")
    
    def test_tts_meditation_not_found(self):
        """Test /api/tts/meditation/{id} returns 404 for non-existent meditation"""
        response = requests.post(
            f"{BASE_URL}/api/tts/meditation/non-existent-meditation-xyz",
            params={"voice": "nova", "part": 1},
            timeout=30
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: Non-existent meditation correctly returns 404")
    
    def test_tts_somatic_not_found(self):
        """Test /api/tts/somatic/{id} returns 404 for non-existent practice"""
        response = requests.post(
            f"{BASE_URL}/api/tts/somatic/non-existent-practice-xyz",
            params={"voice": "nova"},
            timeout=30
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: Non-existent somatic practice correctly returns 404")


class TestContentExpandScriptAfterHelperDecomposition:
    """Test /api/content/expand-script endpoint after helper decomposition in routers/content.py"""
    
    def test_expand_script_basic(self):
        """Test basic expand-script functionality"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Test Grounding Practice",
                "element": "earth",
                "duration_minutes": 7,
                "steps": ["Stand with feet hip-width apart", "Feel your connection to the ground"],
                "source_texts": ["Grounding helps stabilize the nervous system"],
                "use_ai": False,
                "anti_repetition_mode": "strict",
                "include_toning": True
            },
            timeout=30
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Validate response structure
        assert "practice_name" in data, "Response should contain practice_name"
        assert "target_minutes" in data, "Response should contain target_minutes"
        assert "target_word_count" in data, "Response should contain target_word_count"
        assert "word_count" in data, "Response should contain word_count"
        assert "used_ai" in data, "Response should contain used_ai"
        assert "paragraphs" in data, "Response should contain paragraphs"
        assert "segments" in data, "Response should contain segments"
        
        # Validate content
        assert data["practice_name"] == "Test Grounding Practice"
        assert data["target_minutes"] >= 7, "Target minutes should be at least 7"
        assert data["word_count"] > 0, "Word count should be positive"
        assert len(data["paragraphs"]) > 0, "Should have paragraphs"
        assert len(data["segments"]) > 0, "Should have segments"
        assert not data["used_ai"], "Should not use AI when use_ai=False"
        
        print(f"PASS: expand-script returned {data['word_count']} words in {len(data['segments'])} segments")
    
    def test_expand_script_minimum_duration(self):
        """Test that expand-script enforces minimum 7 minute duration"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Short Practice",
                "element": "water",
                "duration_minutes": 3,  # Below minimum
                "steps": ["Breathe deeply"],
                "source_texts": [],
                "use_ai": False,
                "anti_repetition_mode": "strict",
                "include_toning": False
            },
            timeout=30
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["target_minutes"] >= 7, "Should enforce minimum 7 minutes"
        print(f"PASS: Minimum duration enforced, target_minutes={data['target_minutes']}")
    
    def test_expand_script_balanced_mode(self):
        """Test expand-script with balanced anti-repetition mode"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Balanced Mode Test",
                "element": "fire",
                "duration_minutes": 10,
                "steps": ["Ignite your inner fire", "Feel the warmth spreading"],
                "source_texts": ["Fire element brings transformation"],
                "use_ai": False,
                "anti_repetition_mode": "balanced",
                "include_toning": True
            },
            timeout=30
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert len(data["paragraphs"]) > 0, "Should have paragraphs"
        print(f"PASS: Balanced mode returned {len(data['paragraphs'])} paragraphs")
    
    def test_expand_script_without_toning(self):
        """Test expand-script without toning cues"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "No Toning Practice",
                "element": "air",
                "duration_minutes": 8,
                "steps": ["Breathe in clarity"],
                "source_texts": [],
                "use_ai": False,
                "anti_repetition_mode": "strict",
                "include_toning": False
            },
            timeout=30
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert len(data["segments"]) > 0, "Should have segments"
        print(f"PASS: No-toning mode returned {len(data['segments'])} segments")
    
    def test_expand_script_all_elements(self):
        """Test expand-script works for all element types"""
        elements = ["earth", "water", "fire", "air", "spirit"]
        for element in elements:
            response = requests.post(
                f"{BASE_URL}/api/content/expand-script",
                json={
                    "practice_name": f"{element.title()} Element Practice",
                    "element": element,
                    "duration_minutes": 7,
                    "steps": [f"Connect with {element} energy"],
                    "source_texts": [],
                    "use_ai": False,
                    "anti_repetition_mode": "strict",
                    "include_toning": True
                },
                timeout=30
            )
            assert response.status_code == 200, f"Failed for element '{element}': {response.status_code}"
            data = response.json()
            assert data["word_count"] > 0, f"No words generated for element '{element}'"
        print(f"PASS: All {len(elements)} elements work correctly")
    
    def test_expand_script_long_duration(self):
        """Test expand-script with longer duration (15 minutes)"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Extended Practice",
                "element": "spirit",
                "duration_minutes": 15,
                "steps": ["Open to divine guidance", "Receive spiritual wisdom", "Integrate the experience"],
                "source_texts": ["Spirit connects us to the infinite"],
                "use_ai": False,
                "anti_repetition_mode": "strict",
                "include_toning": True
            },
            timeout=45
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["target_minutes"] == 15, "Target should be 15 minutes"
        # 15 min * 120 words/min = 1800 target words
        assert data["target_word_count"] >= 1800, "Target word count should be at least 1800"
        print(f"PASS: 15-minute practice generated {data['word_count']} words")


class TestHealthAndBasicEndpoints:
    """Basic health and endpoint availability tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns 200"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200, f"Health check failed: {response.status_code}"
        print("PASS: Health endpoint returns 200")
    
    def test_meditations_endpoint(self):
        """Test /api/meditations returns list"""
        response = requests.get(f"{BASE_URL}/api/meditations", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Should return a list"
        print(f"PASS: Meditations endpoint returned {len(data)} items")
    
    def test_somatic_practices_endpoint(self):
        """Test /api/somatic-practices returns list"""
        response = requests.get(f"{BASE_URL}/api/somatic-practices", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Should return a list"
        print(f"PASS: Somatic practices endpoint returned {len(data)} items")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
