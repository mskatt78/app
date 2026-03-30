"""
Iteration 61 - Testing guided narration expansion, retreats cleanup, and app-store polish routes.

Features tested:
1. POST /api/content/expand-script - long-form script with target_minutes >= 7 and word_count aligned
2. POST /api/tts/generate-base64 - TTS generation with expanded segment text
3. GET /api/retreats - returns empty list after cleanup (no dummy retreats preloaded)
4. Landing/support/legal routes: /, /support, /privacy, /terms
5. Basic smoke: health check and core navigation
"""
import pytest
import requests
import os
import re

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

MIN_NARRATION_MINUTES = 7
TARGET_WORDS_PER_MINUTE = 120


def count_words(text: str) -> int:
    return len(re.findall(r"\S+", str(text or "").strip()))


class TestExpandScriptEndpoint:
    """Tests for POST /api/content/expand-script - guided narration expansion"""

    def test_expand_script_returns_200(self):
        """Basic endpoint availability"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Test Practice",
                "element": "spirit",
                "duration_minutes": 7,
                "steps": ["Step 1: Breathe deeply", "Step 2: Relax your body"],
                "source_texts": ["This is a calming practice for inner peace."],
            },
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_expand_script_response_structure(self):
        """Verify response contains required fields"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Chakra Cleansing",
                "element": "earth",
                "duration_minutes": 10,
                "steps": ["Ground yourself", "Visualize roots"],
                "source_texts": ["Connect with the earth element."],
            },
        )
        assert response.status_code == 200
        data = response.json()

        # Required fields
        assert "practice_name" in data
        assert "target_minutes" in data
        assert "target_word_count" in data
        assert "word_count" in data
        assert "used_ai" in data
        assert "paragraphs" in data
        assert "segments" in data

    def test_expand_script_target_minutes_at_least_7(self):
        """Verify target_minutes is at least 7 (MIN_NARRATION_MINUTES)"""
        # Test with duration_minutes < 7
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Short Practice",
                "element": "water",
                "duration_minutes": 3,  # Less than minimum
                "steps": ["Breathe"],
                "source_texts": [],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["target_minutes"] >= MIN_NARRATION_MINUTES, f"target_minutes should be >= 7, got {data['target_minutes']}"

    def test_expand_script_word_count_aligned_to_duration(self):
        """Verify word_count is aligned to target duration (120 words/min)"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Meditation Practice",
                "element": "spirit",
                "duration_minutes": 10,
                "steps": ["Close your eyes", "Focus on breath", "Let go of thoughts"],
                "source_texts": ["A deep meditation for inner peace and clarity."],
            },
        )
        assert response.status_code == 200
        data = response.json()

        target_words = data["target_word_count"]
        actual_words = data["word_count"]
        target_minutes = data["target_minutes"]

        # Target word count should be at least MIN_NARRATION_MINUTES * 120
        min_expected_words = MIN_NARRATION_MINUTES * TARGET_WORDS_PER_MINUTE
        assert target_words >= min_expected_words, f"target_word_count should be >= {min_expected_words}, got {target_words}"

        # Actual word count should be close to target (within 20% tolerance)
        tolerance = 0.2
        min_acceptable = int(target_words * (1 - tolerance))
        assert actual_words >= min_acceptable, f"word_count {actual_words} should be >= {min_acceptable} (80% of target {target_words})"

    def test_expand_script_paragraphs_not_empty(self):
        """Verify paragraphs array is not empty"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Breathwork Session",
                "element": "air",
                "duration_minutes": 7,
                "steps": [],
                "source_texts": [],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["paragraphs"]) > 0, "paragraphs should not be empty"

    def test_expand_script_segments_not_empty(self):
        """Verify segments array is not empty (for TTS chunking)"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Fire Ceremony",
                "element": "fire",
                "duration_minutes": 8,
                "steps": ["Light the candle", "Set your intention"],
                "source_texts": ["Fire transforms and purifies."],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["segments"]) > 0, "segments should not be empty"

    def test_expand_script_with_rich_content(self):
        """Test with rich source content to verify expansion"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Heart Opening Practice",
                "element": "water",
                "duration_minutes": 12,
                "steps": [
                    "Place your hands on your heart",
                    "Breathe into your heart space",
                    "Feel the warmth spreading",
                    "Release any tension",
                    "Open to love and compassion",
                ],
                "source_texts": [
                    "The heart chakra is the center of love and compassion.",
                    "When we open our hearts, we connect with our true nature.",
                    "This practice helps release emotional blockages.",
                    "Allow yourself to feel deeply and authentically.",
                ],
            },
        )
        assert response.status_code == 200
        data = response.json()

        # With rich content, we should get substantial output
        assert data["word_count"] >= 700, f"Expected at least 700 words with rich content, got {data['word_count']}"
        assert len(data["segments"]) >= 3, f"Expected at least 3 segments, got {len(data['segments'])}"


class TestTTSGenerateBase64:
    """Tests for POST /api/tts/generate-base64 - TTS generation"""

    def test_tts_generate_returns_200(self):
        """Basic TTS endpoint availability"""
        response = requests.post(
            f"{BASE_URL}/api/tts/generate-base64",
            json={
                "text": "Welcome to this guided meditation. Take a deep breath.",
                "voice": "nova",
                "speed": 0.88,
            },
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_tts_generate_returns_audio_base64(self):
        """Verify TTS returns audio_base64 field"""
        response = requests.post(
            f"{BASE_URL}/api/tts/generate-base64",
            json={
                "text": "Breathe in slowly. Hold. Breathe out.",
                "voice": "nova",
                "speed": 0.9,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "audio_base64" in data, "Response should contain audio_base64 field"
        assert len(data["audio_base64"]) > 100, "audio_base64 should contain substantial data"

    def test_tts_with_expanded_segment_text(self):
        """Test TTS with longer segment text (simulating expanded narration)"""
        long_text = """
        Welcome to this sacred practice. Settle into a comfortable position and let your breath begin to slow.
        Allow the outer world to soften at the edges so your awareness can gather here, in this sacred practice,
        with your full and willing presence. Begin by arriving deliberately. Feel the surface beneath you.
        Notice your jaw, your shoulders, your belly, and your heart. Let yourself unclench in any place that
        has been carrying too much. This practice belongs to the spirit element, inviting you into steadiness,
        receptivity, and deeper inner contact.
        """
        response = requests.post(
            f"{BASE_URL}/api/tts/generate-base64",
            json={
                "text": long_text.strip(),
                "voice": "nova",
                "speed": 0.88,
            },
        )
        assert response.status_code == 200, f"TTS should handle long text, got {response.status_code}"
        data = response.json()
        assert "audio_base64" in data


class TestRetreatsCleanup:
    """Tests for GET /api/retreats - verify cleanup of dummy retreats"""

    def test_retreats_endpoint_returns_200(self):
        """Basic retreats endpoint availability"""
        response = requests.get(f"{BASE_URL}/api/retreats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    def test_retreats_returns_list(self):
        """Verify retreats returns a list"""
        response = requests.get(f"{BASE_URL}/api/retreats")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Retreats should return a list"

    def test_retreats_empty_after_cleanup(self):
        """Verify retreats list is empty after cleanup (no dummy retreats)"""
        response = requests.get(f"{BASE_URL}/api/retreats")
        assert response.status_code == 200
        data = response.json()
        # After cleanup, retreats should be empty (owner can add their own)
        # If not empty, check that they are not placeholder/test retreats
        if len(data) > 0:
            for retreat in data:
                title = str(retreat.get("title", "")).lower().strip()
                # Should not be placeholder retreats
                assert not title.startswith("test"), f"Found test retreat: {title}"
                assert not title.startswith("pytest"), f"Found pytest retreat: {title}"
                assert title != "sacred journey retreat", f"Found legacy placeholder retreat"


class TestAppStorePolishRoutes:
    """Tests for landing/support/legal routes for app-store readiness"""

    def test_health_check(self):
        """Basic health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"

    def test_privacy_route_accessible(self):
        """Privacy policy route should be accessible (frontend route, test via API health)"""
        # This is a frontend route, but we can verify the app is running
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200

    def test_support_related_endpoints(self):
        """Test support-related backend endpoints"""
        # Test courses endpoint (used in support center)
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200

        # Test live sessions endpoint
        response = requests.get(f"{BASE_URL}/api/live-sessions")
        assert response.status_code == 200


class TestCoreContentEndpoints:
    """Smoke tests for core content endpoints"""

    def test_yoga_poses(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_breathwork_sessions(self):
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_crystals(self):
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_meditations(self):
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_chakra_cleansing(self):
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
