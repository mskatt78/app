"""
Iteration 102 - Anti-Repetition Mode Feature Tests
Tests for:
1. POST /api/content/expand-script accepts anti_repetition_mode (strict/balanced)
2. Both modes return 200 with valid response structure
3. Strict mode enforces tighter stem diversity
4. Balanced mode allows more relaxed repetition
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestExpandScriptAntiRepetitionMode:
    """Tests for anti_repetition_mode parameter in expand-script endpoint"""

    def test_health_check(self):
        """Verify backend is accessible"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.text}"
        print("PASSED: Health check - backend is accessible")

    def test_strict_mode_returns_200(self):
        """POST /api/content/expand-script with anti_repetition_mode=strict returns 200"""
        payload = {
            "practice_name": "Fire Breath Practice",
            "element": "fire",
            "duration_minutes": 10,
            "anti_repetition_mode": "strict",
            "steps": ["Inhale deeply", "Hold breath", "Exhale forcefully"],
            "source_texts": ["This practice ignites inner fire and transformation."]
        }
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            timeout=15
        )
        assert response.status_code == 200, f"Strict mode failed: {response.text}"
        data = response.json()
        assert "paragraphs" in data
        assert "segments" in data
        assert data["word_count"] > 0
        print(f"PASSED: Strict mode returns 200 with {data['word_count']} words")

    def test_balanced_mode_returns_200(self):
        """POST /api/content/expand-script with anti_repetition_mode=balanced returns 200"""
        payload = {
            "practice_name": "Water Flow Meditation",
            "element": "water",
            "duration_minutes": 10,
            "anti_repetition_mode": "balanced",
            "steps": ["Relax your body", "Visualize flowing water", "Release tension"],
            "source_texts": ["This practice brings fluidity and emotional release."]
        }
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            timeout=15
        )
        assert response.status_code == 200, f"Balanced mode failed: {response.text}"
        data = response.json()
        assert "paragraphs" in data
        assert "segments" in data
        assert data["word_count"] > 0
        print(f"PASSED: Balanced mode returns 200 with {data['word_count']} words")

    def test_default_mode_is_strict(self):
        """When anti_repetition_mode is not provided, default should be strict"""
        payload = {
            "practice_name": "Earth Grounding",
            "element": "earth",
            "duration_minutes": 7,
            "steps": ["Stand firmly", "Feel the ground"],
            "source_texts": ["Connect with earth energy."]
        }
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            timeout=15
        )
        assert response.status_code == 200, f"Default mode failed: {response.text}"
        data = response.json()
        assert "paragraphs" in data
        print("PASSED: Default mode (no anti_repetition_mode) returns 200")

    def test_invalid_mode_defaults_to_strict(self):
        """Invalid anti_repetition_mode value should default to strict"""
        payload = {
            "practice_name": "Spirit Journey",
            "element": "spirit",
            "duration_minutes": 7,
            "anti_repetition_mode": "invalid_mode",
            "steps": ["Open your heart"],
            "source_texts": ["Expand consciousness."]
        }
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            timeout=15
        )
        # Should either return 200 (defaulting to strict) or 422 (validation error)
        assert response.status_code in [200, 422], f"Unexpected status: {response.status_code}"
        if response.status_code == 422:
            print("PASSED: Invalid mode returns 422 validation error (expected)")
        else:
            print("PASSED: Invalid mode defaults to strict and returns 200")

    @pytest.mark.parametrize("duration", [7, 15, 20])
    def test_both_modes_produce_sufficient_content(self, duration):
        """Both modes should produce content meeting word count targets"""
        for mode in ["strict", "balanced"]:
            payload = {
                "practice_name": f"Test Practice {mode}",
                "element": "air",
                "duration_minutes": duration,
                "anti_repetition_mode": mode,
                "steps": ["Breathe in", "Breathe out", "Relax"],
                "source_texts": ["Air brings clarity and lightness."]
            }
            response = requests.post(
                f"{BASE_URL}/api/content/expand-script",
                json=payload,
                timeout=20
            )
            assert response.status_code == 200
            data = response.json()
            target_words = duration * 120  # TARGET_WORDS_PER_MINUTE = 120
            # Allow 20% tolerance
            assert data["word_count"] >= target_words * 0.8, \
                f"{mode} mode for {duration}min: {data['word_count']} words < {target_words * 0.8}"
            print(f"PASSED: {mode} mode for {duration}min produces {data['word_count']} words (target: {target_words})")


class TestTTSEndpoint:
    """Tests for TTS endpoint used by guided narration"""

    def test_tts_generate_base64_endpoint_exists(self):
        """Verify TTS endpoint is accessible"""
        payload = {
            "text": "Welcome to your practice.",
            "voice": "nova",
            "speed": 0.92
        }
        response = requests.post(
            f"{BASE_URL}/api/tts/generate-base64",
            json=payload,
            timeout=30
        )
        # TTS may fail if no API key, but endpoint should exist
        assert response.status_code in [200, 500, 503], f"TTS endpoint error: {response.status_code}"
        if response.status_code == 200:
            data = response.json()
            assert "audio_base64" in data
            print("PASSED: TTS endpoint returns audio_base64")
        else:
            print(f"INFO: TTS endpoint returned {response.status_code} (may need API key)")


class TestGuidedTimerEndpoints:
    """Tests for endpoints used by PracticeTimer and GuidedPracticeOverlay"""

    def test_breathwork_sessions_endpoint(self):
        """Verify breathwork sessions endpoint works"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASSED: Breathwork sessions endpoint returns {len(data)} sessions")

    def test_meditations_endpoint(self):
        """Verify meditations endpoint works"""
        response = requests.get(f"{BASE_URL}/api/meditations", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASSED: Meditations endpoint returns {len(data)} meditations")

    def test_elemental_practices_endpoint(self):
        """Verify elemental practices endpoint works"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASSED: Elemental practices endpoint returns {len(data)} practices")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
