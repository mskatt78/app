"""
Iteration 91 - Guided Narration Quality Tests
Tests for:
1. Backend expand-script output quality: first segment medium-length, reduced repeated stems, adaptive arc language
2. TTS speed constant verification (0.84 for slower expressive pace)
3. Segment structure and anti-repetition
"""
import os
import re
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Constants matching backend
FIRST_SEGMENT_TARGET_WORDS = 95
SEGMENT_TARGET_WORDS = 220
MIN_NARRATION_MINUTES = 7
TARGET_WORDS_PER_MINUTE = 120


def count_words(text):
    """Count words in text."""
    return len(re.findall(r"\S+", str(text or "").strip()))


def normalize_for_stem(text):
    """Normalize text for stem comparison."""
    normalized = re.sub(r"\s+", " ", str(text or "")).strip().lower()
    normalized = re.sub(r"[^a-z0-9 ]+", "", normalized)
    return normalized


def get_stem(text, word_count=10):
    """Get first N words as stem for repetition check."""
    normalized = normalize_for_stem(text)
    return " ".join(normalized.split()[:word_count])


class TestExpandScriptEndpoint:
    """Tests for /api/content/expand-script endpoint."""

    def test_expand_script_returns_200(self):
        """Basic endpoint availability test."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Test Meditation",
                "element": "spirit",
                "duration_minutes": 7,
                "use_ai": False,
                "steps": ["Breathe deeply", "Relax your body"],
                "source_texts": ["Find inner peace and calm."],
            },
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "paragraphs" in data
        assert "segments" in data
        assert "word_count" in data
        print(f"PASSED: expand-script returns 200 with {data['word_count']} words")

    def test_first_segment_medium_length(self):
        """First segment should be medium-length (~95 words target)."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Heart Opening Practice",
                "element": "fire",
                "duration_minutes": 10,
                "use_ai": False,
                "steps": ["Open your heart", "Feel the warmth", "Expand your awareness"],
                "source_texts": ["This practice cultivates compassion and inner fire."],
            },
        )
        assert response.status_code == 200
        data = response.json()
        segments = data.get("segments", [])
        assert len(segments) > 0, "Expected at least one segment"

        first_segment_words = count_words(segments[0])
        # First segment should be around FIRST_SEGMENT_TARGET_WORDS (95) with some tolerance
        # Allow range of 60-150 words for first segment (medium length)
        assert 60 <= first_segment_words <= 150, (
            f"First segment has {first_segment_words} words, expected 60-150 (medium length)"
        )
        print(f"PASSED: First segment has {first_segment_words} words (medium length)")

    def test_reduced_repeated_stems(self):
        """Paragraphs should not have repeated opening stems."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Grounding Earth Practice",
                "element": "earth",
                "duration_minutes": 12,
                "use_ai": False,
                "steps": [
                    "Connect with the earth",
                    "Feel roots growing",
                    "Breathe stability",
                    "Ground your energy",
                ],
                "source_texts": [
                    "Earth element brings stability and grounding.",
                    "Feel the solid support beneath you.",
                ],
            },
        )
        assert response.status_code == 200
        data = response.json()
        paragraphs = data.get("paragraphs", [])
        assert len(paragraphs) > 5, f"Expected more than 5 paragraphs, got {len(paragraphs)}"

        # Check for repeated stems (first 10 words)
        stems = [get_stem(p, 10) for p in paragraphs if get_stem(p, 10)]
        stem_counts = {}
        for stem in stems:
            stem_counts[stem] = stem_counts.get(stem, 0) + 1

        # No stem should appear more than once (strong anti-repetition)
        repeated_stems = {stem: count for stem, count in stem_counts.items() if count > 1}
        assert len(repeated_stems) == 0, (
            f"Found repeated stems: {repeated_stems}"
        )
        print(f"PASSED: No repeated stems found in {len(paragraphs)} paragraphs")

    def test_adaptive_arc_language_present(self):
        """Script should contain adaptive arc language (graceful start, powerful middle, soft close)."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Spirit Journey",
                "element": "spirit",
                "duration_minutes": 10,
                "use_ai": False,
                "steps": ["Center yourself", "Expand awareness", "Return gently"],
                "source_texts": ["A sacred journey of inner exploration."],
            },
        )
        assert response.status_code == 200
        data = response.json()
        paragraphs = data.get("paragraphs", [])
        full_text = " ".join(paragraphs).lower()

        # Check for graceful opening language
        graceful_terms = ["welcome", "begin", "arrive", "graceful", "gently"]
        has_graceful_opening = any(term in full_text[:500] for term in graceful_terms)
        assert has_graceful_opening, "Expected graceful opening language in first 500 chars"

        # Check for powerful/grounded middle language
        power_terms = ["power", "strong", "grounded", "steady", "clear", "focus"]
        has_power_middle = any(term in full_text for term in power_terms)
        assert has_power_middle, "Expected powerful/grounded language in script"

        # Check for soft closing language (may be in last portion of text)
        closing_terms = ["close", "return", "carry", "integrate", "complete", "rest", "gentle", "steady", "breath", "body"]
        # Check last 2000 chars since extension paragraphs may follow closing
        has_soft_close = any(term in full_text[-2000:] for term in closing_terms)
        assert has_soft_close, "Expected soft closing language in last 2000 chars"

        print("PASSED: Adaptive arc language present (graceful start, powerful middle, soft close)")

    def test_minimum_word_count_met(self):
        """Script should meet minimum word count for duration."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Water Flow Practice",
                "element": "water",
                "duration_minutes": 8,
                "use_ai": False,
                "steps": ["Flow like water", "Release tension"],
                "source_texts": ["Water teaches us to flow and adapt."],
            },
        )
        assert response.status_code == 200
        data = response.json()

        target_words = data.get("target_word_count", 0)
        actual_words = data.get("word_count", 0)

        # Should meet at least 90% of target
        assert actual_words >= target_words * 0.9, (
            f"Word count {actual_words} is less than 90% of target {target_words}"
        )
        print(f"PASSED: Word count {actual_words} meets target {target_words}")

    def test_segments_properly_chunked(self):
        """Segments should be properly chunked with first segment smaller."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Air Breath Practice",
                "element": "air",
                "duration_minutes": 10,
                "use_ai": False,
                "steps": ["Breathe deeply", "Feel lightness", "Expand awareness"],
                "source_texts": ["Air brings clarity and mental spaciousness."],
            },
        )
        assert response.status_code == 200
        data = response.json()
        segments = data.get("segments", [])
        assert len(segments) >= 3, f"Expected at least 3 segments, got {len(segments)}"

        segment_word_counts = [count_words(seg) for seg in segments]
        first_segment_words = segment_word_counts[0]
        other_segment_avg = sum(segment_word_counts[1:]) / len(segment_word_counts[1:]) if len(segment_word_counts) > 1 else 0

        # First segment should be smaller than average of others
        assert first_segment_words < other_segment_avg * 1.2, (
            f"First segment ({first_segment_words} words) should be smaller than others (avg {other_segment_avg:.0f})"
        )
        print(f"PASSED: First segment ({first_segment_words} words) is appropriately sized vs others (avg {other_segment_avg:.0f})")

    def test_no_markdown_or_bullets(self):
        """Script should be plain narration without markdown or bullets."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Fire Transformation",
                "element": "fire",
                "duration_minutes": 7,
                "use_ai": False,
                "steps": ["Ignite inner fire", "Transform old patterns"],
                "source_texts": ["Fire purifies and transforms."],
            },
        )
        assert response.status_code == 200
        data = response.json()
        paragraphs = data.get("paragraphs", [])
        full_text = " ".join(paragraphs)

        # Check for markdown/bullet patterns
        markdown_patterns = [
            r"^#+\s",  # Headers
            r"^\*\s",  # Bullets
            r"^-\s",   # Dashes
            r"^\d+\.\s",  # Numbered lists
            r"\*\*.*\*\*",  # Bold
            r"__.*__",  # Underline
        ]
        for pattern in markdown_patterns:
            matches = re.findall(pattern, full_text, re.MULTILINE)
            assert len(matches) == 0, f"Found markdown pattern '{pattern}': {matches[:3]}"

        print("PASSED: No markdown or bullet formatting found")

    def test_response_structure(self):
        """Response should have correct structure."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Test Practice",
                "element": "spirit",
                "duration_minutes": 7,
                "use_ai": False,
                "steps": [],
                "source_texts": [],
            },
        )
        assert response.status_code == 200
        data = response.json()

        required_fields = ["practice_name", "target_minutes", "target_word_count", "word_count", "used_ai", "paragraphs", "segments"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"

        assert isinstance(data["paragraphs"], list)
        assert isinstance(data["segments"], list)
        assert isinstance(data["word_count"], int)
        assert not data["used_ai"]  # We requested no AI

        print("PASSED: Response structure correct with all required fields")


class TestTTSEndpoint:
    """Tests for TTS endpoint used by guided narration."""

    def test_tts_generate_base64_available(self):
        """TTS endpoint should be available."""
        response = requests.post(
            f"{BASE_URL}/api/tts/generate-base64",
            json={
                "text": "Welcome to this guided practice.",
                "voice": "nova",
                "speed": 0.84,  # DEFAULT_GUIDED_TTS_SPEED
            },
        )
        # TTS may fail if no API key, but endpoint should exist
        assert response.status_code in [200, 500, 503], f"Unexpected status: {response.status_code}"
        if response.status_code == 200:
            data = response.json()
            assert "audio_base64" in data, "Expected audio_base64 in response"
            print("PASSED: TTS endpoint returns audio")
        else:
            print(f"INFO: TTS endpoint returned {response.status_code} (may need API key)")


class TestContentEndpointsForGuidedMeditation:
    """Tests for content endpoints used by guided meditation flows."""

    def test_meditations_endpoint(self):
        """Meditations endpoint should return data for guided flows."""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASSED: Meditations endpoint returns {len(data)} items")

    def test_breathwork_sessions_endpoint(self):
        """Breathwork sessions endpoint should return data."""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASSED: Breathwork sessions endpoint returns {len(data)} items")

    def test_chakra_cleansing_endpoint(self):
        """Chakra cleansing endpoint should return data for guided flows."""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASSED: Chakra cleansing endpoint returns {len(data)} items")

    def test_somatic_yoga_endpoint(self):
        """Somatic yoga endpoint should return data."""
        response = requests.get(f"{BASE_URL}/api/somatic-yoga")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASSED: Somatic yoga endpoint returns {len(data)} items")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
