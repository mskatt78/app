"""
Backend tests for TTS Meditation 4-Part Audio Generation (iteration 37)
Tests: 
- GET /api/meditations returns meditation list
- POST /api/tts/meditation/{id}?part=1-4 returns audio_base64 within 58s
- POST /api/tts/meditation/{id}?part=5 returns 400 (invalid part)
- GET /api/tts/meditation/{id}/parts returns total_parts=4
- POST /api/tts/meditation/nonexistent?part=1 returns 404
"""
import requests
import os
import time

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# TTS generation takes ~18-20 seconds per part, use 58s timeout
TTS_TIMEOUT = 58


class TestMeditationsListAPI:
    """Tests for GET /api/meditations endpoint"""

    def test_get_meditations_status_200(self):
        """Meditations endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/meditations", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: GET /api/meditations returns 200")

    def test_get_meditations_returns_list(self):
        """Response is a list with meditation data"""
        response = requests.get(f"{BASE_URL}/api/meditations", timeout=10)
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        assert len(data) >= 1, "Expected at least 1 meditation"
        # Verify meditation ID 1 exists (used in TTS tests)
        ids = [m["id"] for m in data]
        assert "1" in ids, f"Meditation ID '1' not found in {ids}"
        print(f"PASS: Response is a list with {len(data)} meditations, ID '1' exists")


class TestTTSMeditationPartsInfo:
    """Tests for GET /api/tts/meditation/{id}/parts endpoint"""

    def test_get_meditation_parts_info(self):
        """GET /api/tts/meditation/1/parts returns total_parts=4"""
        response = requests.get(f"{BASE_URL}/api/tts/meditation/1/parts", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "total_parts" in data, f"Missing 'total_parts' in response: {data}"
        assert data["total_parts"] == 4, f"Expected total_parts=4, got {data['total_parts']}"
        assert data["meditation_id"] == "1", f"Expected meditation_id='1', got {data['meditation_id']}"
        print("PASS: GET /api/tts/meditation/1/parts returns total_parts=4")


class TestTTSMeditationPart1:
    """Test TTS generation for Part 1 (Welcome + Breathing)"""

    def test_tts_meditation_part1_returns_audio(self):
        """POST /api/tts/meditation/1?voice=nova&part=1 returns audio_base64 within 58s"""
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/api/tts/meditation/1",
            params={"voice": "nova", "part": 1},
            timeout=TTS_TIMEOUT
        )
        elapsed = time.time() - start_time
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text[:200]}"
        data = response.json()
        assert "audio_base64" in data, "Missing 'audio_base64' in response"
        assert len(data["audio_base64"]) > 1000, f"audio_base64 too short: {len(data['audio_base64'])} chars"
        assert data.get("format") == "mp3", f"Expected format='mp3', got {data.get('format')}"
        assert elapsed < TTS_TIMEOUT, f"Request took {elapsed:.1f}s, exceeds {TTS_TIMEOUT}s timeout"
        print(f"PASS: Part 1 returned {len(data['audio_base64'])} chars in {elapsed:.1f}s")


class TestTTSMeditationPart2:
    """Test TTS generation for Part 2 (Body Scan)"""

    def test_tts_meditation_part2_returns_audio(self):
        """POST /api/tts/meditation/1?voice=nova&part=2 returns audio_base64 within 58s"""
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/api/tts/meditation/1",
            params={"voice": "nova", "part": 2},
            timeout=TTS_TIMEOUT
        )
        elapsed = time.time() - start_time
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text[:200]}"
        data = response.json()
        assert "audio_base64" in data, "Missing 'audio_base64' in response"
        assert len(data["audio_base64"]) > 1000, "audio_base64 too short"
        assert elapsed < TTS_TIMEOUT, f"Request took {elapsed:.1f}s, exceeds {TTS_TIMEOUT}s timeout"
        print(f"PASS: Part 2 returned {len(data['audio_base64'])} chars in {elapsed:.1f}s")


class TestTTSMeditationPart3:
    """Test TTS generation for Part 3 (Visualization + Deepening)"""

    def test_tts_meditation_part3_returns_audio(self):
        """POST /api/tts/meditation/1?voice=nova&part=3 returns audio_base64 within 58s"""
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/api/tts/meditation/1",
            params={"voice": "nova", "part": 3},
            timeout=TTS_TIMEOUT
        )
        elapsed = time.time() - start_time
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text[:200]}"
        data = response.json()
        assert "audio_base64" in data, "Missing 'audio_base64' in response"
        assert len(data["audio_base64"]) > 1000, "audio_base64 too short"
        assert elapsed < TTS_TIMEOUT, f"Request took {elapsed:.1f}s, exceeds {TTS_TIMEOUT}s timeout"
        print(f"PASS: Part 3 returned {len(data['audio_base64'])} chars in {elapsed:.1f}s")


class TestTTSMeditationPart4:
    """Test TTS generation for Part 4 (Affirmations + Return + Closing)"""

    def test_tts_meditation_part4_returns_audio(self):
        """POST /api/tts/meditation/1?voice=nova&part=4 returns audio_base64 within 58s"""
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/api/tts/meditation/1",
            params={"voice": "nova", "part": 4},
            timeout=TTS_TIMEOUT
        )
        elapsed = time.time() - start_time
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text[:200]}"
        data = response.json()
        assert "audio_base64" in data, "Missing 'audio_base64' in response"
        assert len(data["audio_base64"]) > 1000, "audio_base64 too short"
        assert elapsed < TTS_TIMEOUT, f"Request took {elapsed:.1f}s, exceeds {TTS_TIMEOUT}s timeout"
        print(f"PASS: Part 4 returned {len(data['audio_base64'])} chars in {elapsed:.1f}s")


class TestTTSMeditationErrorCases:
    """Test error handling for TTS meditation endpoint"""

    def test_tts_meditation_invalid_part_returns_400(self):
        """POST /api/tts/meditation/1?voice=nova&part=5 returns 400 error"""
        response = requests.post(
            f"{BASE_URL}/api/tts/meditation/1",
            params={"voice": "nova", "part": 5},
            timeout=10
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "detail" in data, f"Missing 'detail' in error response: {data}"
        assert "invalid" in data["detail"].lower() or "1-4" in data["detail"], f"Error message unclear: {data['detail']}"
        print(f"PASS: Part 5 returns 400 with message: {data['detail']}")

    def test_tts_meditation_part_zero_returns_400(self):
        """POST /api/tts/meditation/1?voice=nova&part=0 returns 400 error"""
        response = requests.post(
            f"{BASE_URL}/api/tts/meditation/1",
            params={"voice": "nova", "part": 0},
            timeout=10
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("PASS: Part 0 returns 400")

    def test_tts_meditation_nonexistent_returns_404(self):
        """POST /api/tts/meditation/nonexistent?part=1 returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/tts/meditation/nonexistent",
            params={"voice": "nova", "part": 1},
            timeout=10
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        data = response.json()
        assert "detail" in data, f"Missing 'detail' in error response: {data}"
        assert "not found" in data["detail"].lower(), f"Error message unclear: {data['detail']}"
        print(f"PASS: Nonexistent meditation returns 404: {data['detail']}")

    def test_tts_meditation_invalid_id_returns_404(self):
        """POST /api/tts/meditation/999?part=1 returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/tts/meditation/999",
            params={"voice": "nova", "part": 1},
            timeout=10
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: Invalid meditation ID 999 returns 404")


class TestTTSMeditationDifferentVoices:
    """Test TTS with different voice options"""

    def test_tts_meditation_default_voice(self):
        """POST /api/tts/meditation/1?part=1 (no voice param) uses default nova"""
        response = requests.post(
            f"{BASE_URL}/api/tts/meditation/1",
            params={"part": 1},
            timeout=TTS_TIMEOUT
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "audio_base64" in data, "Missing 'audio_base64'"
        print(f"PASS: Default voice works, returned {len(data['audio_base64'])} chars")
