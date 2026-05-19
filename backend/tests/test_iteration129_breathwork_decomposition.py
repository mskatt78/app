"""
Iteration 129 - Testing Breathwork decomposition, GuidedAudioButton hook extraction,
InstallPrompt extraction, AmbientSoundPlayer refactor, and backend TTS/content helpers.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestBreathworkEndpoints:
    """Test breathwork sessions API after decomposition"""

    def test_get_breathwork_sessions(self):
        """Test GET /api/breathwork/sessions returns sessions list"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Check session structure
        session = data[0]
        assert "id" in session
        assert "name" in session
        assert "element" in session
        assert "pattern" in session
        assert "duration_minutes" in session
        print(f"✓ Found {len(data)} breathwork sessions")

    def test_get_breathwork_session_by_id(self):
        """Test GET /api/breathwork/sessions/{id} returns specific session"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions/1")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "1"
        assert "pattern" in data
        assert "inhale" in data["pattern"]
        assert "exhale" in data["pattern"]
        print(f"✓ Retrieved session: {data['name']}")

    def test_breathwork_session_filter_by_element(self):
        """Test filtering breathwork sessions by element"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions?element=Earth")
        assert response.status_code == 200
        data = response.json()
        for session in data:
            assert session["element"] == "Earth"
        print(f"✓ Filtered {len(data)} Earth element sessions")


class TestTTSEndpoints:
    """Test TTS endpoints after helper decomposition"""

    def test_tts_generate_base64(self):
        """Test POST /api/tts/generate-base64 returns audio"""
        response = requests.post(
            f"{BASE_URL}/api/tts/generate-base64",
            json={"text": "Test audio generation", "voice": "nova", "speed": 0.85}
        )
        assert response.status_code == 200
        data = response.json()
        assert "audio_base64" in data
        assert "format" in data
        assert data["format"] == "mp3"
        assert len(data["audio_base64"]) > 100  # Should have actual audio data
        print("✓ TTS generate-base64 returns valid audio")

    def test_tts_meditation_parts_info(self):
        """Test GET /api/tts/meditation/{id}/parts returns parts info"""
        response = requests.get(f"{BASE_URL}/api/tts/meditation/1/parts")
        assert response.status_code == 200
        data = response.json()
        assert data["meditation_id"] == "1"
        assert data["total_parts"] == 4
        print("✓ TTS meditation parts info returns 4 parts")

    def test_tts_meditation_audio_generation(self):
        """Test POST /api/tts/meditation/{id} generates audio for valid meditation"""
        response = requests.post(f"{BASE_URL}/api/tts/meditation/1?voice=nova&part=1")
        assert response.status_code == 200
        data = response.json()
        assert "audio_base64" in data
        assert "format" in data
        print("✓ TTS meditation audio generation works")

    def test_tts_meditation_not_found(self):
        """Test POST /api/tts/meditation/{id} returns 404 for non-existent meditation"""
        response = requests.post(f"{BASE_URL}/api/tts/meditation/nonexistent?voice=nova&part=1")
        assert response.status_code == 404
        print("✓ TTS meditation returns 404 for non-existent ID")


class TestContentExpandScript:
    """Test /api/content/expand-script after helper decomposition"""

    def test_expand_script_basic(self):
        """Test basic script expansion"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Test Practice",
                "element": "earth",
                "duration_minutes": 7,
                "steps": ["Step 1: Breathe deeply"],
                "source_texts": ["This is a grounding practice"],
                "use_ai": False,
                "anti_repetition_mode": "strict",
                "include_toning": True
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["practice_name"] == "Test Practice"
        assert data["target_minutes"] >= 7
        assert data["word_count"] > 0
        assert len(data["segments"]) > 0
        assert data["used_ai"] == False
        print(f"✓ Script expansion: {data['word_count']} words, {len(data['segments'])} segments")

    def test_expand_script_minimum_duration(self):
        """Test that minimum 7-minute duration is enforced"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Short Practice",
                "element": "water",
                "duration_minutes": 3,  # Below minimum
                "steps": [],
                "source_texts": [],
                "use_ai": False,
                "anti_repetition_mode": "strict",
                "include_toning": False
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["target_minutes"] >= 7  # Should be enforced to minimum
        print(f"✓ Minimum duration enforced: {data['target_minutes']} minutes")

    def test_expand_script_all_elements(self):
        """Test script expansion works for all elements"""
        elements = ["earth", "water", "fire", "air", "spirit"]
        for element in elements:
            response = requests.post(
                f"{BASE_URL}/api/content/expand-script",
                json={
                    "practice_name": f"{element.title()} Practice",
                    "element": element,
                    "duration_minutes": 7,
                    "steps": [],
                    "source_texts": [],
                    "use_ai": False,
                    "anti_repetition_mode": "strict",
                    "include_toning": True
                }
            )
            assert response.status_code == 200
            data = response.json()
            assert data["word_count"] > 0
        print(f"✓ Script expansion works for all {len(elements)} elements")

    def test_expand_script_balanced_mode(self):
        """Test balanced anti-repetition mode"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Balanced Practice",
                "element": "spirit",
                "duration_minutes": 10,
                "steps": ["Step 1: Center yourself", "Step 2: Breathe deeply"],
                "source_texts": ["A spiritual practice for inner peace"],
                "use_ai": False,
                "anti_repetition_mode": "balanced",
                "include_toning": True
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["word_count"] > 0
        print(f"✓ Balanced mode: {data['word_count']} words")


class TestYogaEndpoints:
    """Test yoga endpoints after console/empty-catch cleanup"""

    def test_get_yoga_poses(self):
        """Test GET /api/yoga/poses returns poses list"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        pose = data[0]
        assert "id" in pose
        assert "name" in pose
        assert "element" in pose
        print(f"✓ Found {len(data)} yoga poses")

    def test_get_yoga_pose_by_id(self):
        """Test GET /api/yoga/poses/{id} returns specific pose"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses/1")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "1"
        assert "instructions" in data
        print(f"✓ Retrieved pose: {data['name']}")


class TestMeditationsEndpoints:
    """Test meditations endpoints"""

    def test_get_meditations(self):
        """Test GET /api/meditations returns meditations list"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        meditation = data[0]
        assert "id" in meditation
        assert "name" in meditation
        print(f"✓ Found {len(data)} meditations")


class TestHealthEndpoint:
    """Test health endpoint"""

    def test_health_check(self):
        """Test GET /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
