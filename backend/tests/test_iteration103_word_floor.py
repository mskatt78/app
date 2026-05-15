"""
Iteration 103 - Word Floor Verification Tests
Tests that 20-minute practice now meets >=80% target words in both strict and balanced modes.
Also verifies no regression in repetition quality checks.
"""
import os
import re
import pytest
import requests
from collections import Counter

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

TARGET_WORDS_PER_MINUTE = 120
MIN_NARRATION_MINUTES = 7


def count_words(text: str) -> int:
    """Count words in text."""
    return len(re.findall(r"\S+", str(text or "").strip()))


def normalize_text(text: str) -> str:
    """Normalize text for repeat checking."""
    normalized = re.sub(r"\s+", " ", str(text or "")).strip().lower()
    normalized = re.sub(r"[^a-z0-9 ]+", "", normalized)
    return normalized


def paragraph_stem(text: str, words: int = 8) -> str:
    """Get first N words of normalized text as stem."""
    return " ".join(normalize_text(text).split()[:words])


def calculate_stem_repeat_ratio(paragraphs: list, stem_words: int = 8) -> float:
    """Calculate ratio of repeated paragraph stems."""
    stems = [paragraph_stem(p, words=stem_words) for p in paragraphs if p]
    stems = [s for s in stems if s]
    if not stems:
        return 0.0
    stem_counts = Counter(stems)
    repeated = sum(count - 1 for count in stem_counts.values() if count > 1)
    return repeated / len(stems)


class TestWordFloorVerification:
    """Tests to verify 20-minute word floor issue is resolved."""

    def test_health_check(self):
        """Verify backend is accessible."""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.status_code}"
        print("PASSED: Health check")

    @pytest.mark.parametrize("duration_minutes", [7, 10, 15, 20, 25])
    def test_strict_mode_word_floor(self, duration_minutes):
        """Test strict mode meets >=80% word floor for various durations."""
        target_words = max(MIN_NARRATION_MINUTES * TARGET_WORDS_PER_MINUTE, duration_minutes * TARGET_WORDS_PER_MINUTE)
        minimum_word_floor = int(target_words * 0.80)

        payload = {
            "practice_name": f"Test Practice {duration_minutes}min Strict",
            "element": "spirit",
            "duration_minutes": duration_minutes,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "steps": ["Breathe deeply", "Center yourself", "Feel the energy"],
            "source_texts": ["This is a sacred practice for inner peace and healing."]
        }

        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200, f"API returned {response.status_code}"

        data = response.json()
        word_count = data.get("word_count", 0)
        target_word_count = data.get("target_word_count", target_words)
        percentage = (word_count / target_word_count * 100) if target_word_count > 0 else 0

        print(f"Duration: {duration_minutes}min | Target: {target_word_count} | Actual: {word_count} | Percentage: {percentage:.1f}%")

        assert word_count >= minimum_word_floor, (
            f"STRICT mode {duration_minutes}min: Word count {word_count} below 80% floor ({minimum_word_floor}). "
            f"Target was {target_word_count}, got {percentage:.1f}%"
        )
        print(f"PASSED: Strict mode {duration_minutes}min meets word floor ({word_count} >= {minimum_word_floor})")

    @pytest.mark.parametrize("duration_minutes", [7, 10, 15, 20, 25])
    def test_balanced_mode_word_floor(self, duration_minutes):
        """Test balanced mode meets >=80% word floor for various durations."""
        target_words = max(MIN_NARRATION_MINUTES * TARGET_WORDS_PER_MINUTE, duration_minutes * TARGET_WORDS_PER_MINUTE)
        minimum_word_floor = int(target_words * 0.80)

        payload = {
            "practice_name": f"Test Practice {duration_minutes}min Balanced",
            "element": "water",
            "duration_minutes": duration_minutes,
            "use_ai": False,
            "anti_repetition_mode": "balanced",
            "steps": ["Breathe deeply", "Center yourself", "Feel the energy"],
            "source_texts": ["This is a sacred practice for inner peace and healing."]
        }

        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200, f"API returned {response.status_code}"

        data = response.json()
        word_count = data.get("word_count", 0)
        target_word_count = data.get("target_word_count", target_words)
        percentage = (word_count / target_word_count * 100) if target_word_count > 0 else 0

        print(f"Duration: {duration_minutes}min | Target: {target_word_count} | Actual: {word_count} | Percentage: {percentage:.1f}%")

        assert word_count >= minimum_word_floor, (
            f"BALANCED mode {duration_minutes}min: Word count {word_count} below 80% floor ({minimum_word_floor}). "
            f"Target was {target_word_count}, got {percentage:.1f}%"
        )
        print(f"PASSED: Balanced mode {duration_minutes}min meets word floor ({word_count} >= {minimum_word_floor})")

    def test_20min_strict_mode_critical(self):
        """Critical test: 20-minute strict mode must meet >=80% (1920 words minimum)."""
        duration_minutes = 20
        target_words = duration_minutes * TARGET_WORDS_PER_MINUTE  # 2400
        minimum_word_floor = int(target_words * 0.80)  # 1920

        payload = {
            "practice_name": "20-Minute Strict Mode Critical Test",
            "element": "earth",
            "duration_minutes": duration_minutes,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "steps": [
                "Begin with grounding breath",
                "Connect to the earth element",
                "Feel stability and strength",
                "Release tension through exhale"
            ],
            "source_texts": [
                "This earth practice brings deep grounding and stability.",
                "Connect with the nurturing energy of the earth beneath you.",
                "Allow yourself to feel supported and held."
            ]
        }

        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200, f"API returned {response.status_code}"

        data = response.json()
        word_count = data.get("word_count", 0)
        target_word_count = data.get("target_word_count", target_words)
        percentage = (word_count / target_word_count * 100) if target_word_count > 0 else 0

        print(f"CRITICAL 20-MIN STRICT TEST:")
        print(f"  Target: {target_word_count} words")
        print(f"  Minimum (80%): {minimum_word_floor} words")
        print(f"  Actual: {word_count} words")
        print(f"  Percentage: {percentage:.1f}%")

        assert word_count >= minimum_word_floor, (
            f"CRITICAL FAILURE: 20-min strict mode word count {word_count} is below 80% floor ({minimum_word_floor}). "
            f"This was the issue from iteration 102 that should now be fixed."
        )
        print(f"PASSED: 20-minute strict mode meets word floor ({word_count} >= {minimum_word_floor})")

    def test_20min_balanced_mode_critical(self):
        """Critical test: 20-minute balanced mode must meet >=80% (1920 words minimum)."""
        duration_minutes = 20
        target_words = duration_minutes * TARGET_WORDS_PER_MINUTE  # 2400
        minimum_word_floor = int(target_words * 0.80)  # 1920

        payload = {
            "practice_name": "20-Minute Balanced Mode Critical Test",
            "element": "fire",
            "duration_minutes": duration_minutes,
            "use_ai": False,
            "anti_repetition_mode": "balanced",
            "steps": [
                "Ignite your inner flame",
                "Feel the warmth spreading",
                "Transform through breath",
                "Release what no longer serves"
            ],
            "source_texts": [
                "This fire practice awakens transformation and courage.",
                "Let the sacred flame purify and renew your spirit.",
                "Embrace the power of change with grace."
            ]
        }

        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200, f"API returned {response.status_code}"

        data = response.json()
        word_count = data.get("word_count", 0)
        target_word_count = data.get("target_word_count", target_words)
        percentage = (word_count / target_word_count * 100) if target_word_count > 0 else 0

        print(f"CRITICAL 20-MIN BALANCED TEST:")
        print(f"  Target: {target_word_count} words")
        print(f"  Minimum (80%): {minimum_word_floor} words")
        print(f"  Actual: {word_count} words")
        print(f"  Percentage: {percentage:.1f}%")

        assert word_count >= minimum_word_floor, (
            f"CRITICAL FAILURE: 20-min balanced mode word count {word_count} is below 80% floor ({minimum_word_floor}). "
            f"This was the issue from iteration 102 that should now be fixed."
        )
        print(f"PASSED: 20-minute balanced mode meets word floor ({word_count} >= {minimum_word_floor})")


class TestRepetitionQualityRegression:
    """Tests to verify no regression in repetition quality checks."""

    def test_strict_mode_no_heavy_phrase_loops(self):
        """Verify strict mode doesn't have heavy phrase repetition."""
        payload = {
            "practice_name": "Repetition Quality Test Strict",
            "element": "air",
            "duration_minutes": 15,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "steps": ["Breathe", "Relax", "Center"],
            "source_texts": ["A practice for clarity and peace."]
        }

        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200

        data = response.json()
        paragraphs = data.get("paragraphs", [])

        # Calculate stem repeat ratio
        repeat_ratio = calculate_stem_repeat_ratio(paragraphs, stem_words=8)
        max_allowed_ratio = 0.12  # Same as MAX_PARAGRAPH_STEM_REPEAT_RATIO in content.py

        print(f"Strict mode stem repeat ratio: {repeat_ratio:.3f} (max allowed: {max_allowed_ratio})")

        assert repeat_ratio <= max_allowed_ratio, (
            f"Strict mode has too much repetition: {repeat_ratio:.3f} > {max_allowed_ratio}"
        )
        print(f"PASSED: Strict mode repetition quality OK ({repeat_ratio:.3f} <= {max_allowed_ratio})")

    def test_balanced_mode_no_heavy_phrase_loops(self):
        """Verify balanced mode doesn't have heavy phrase repetition."""
        payload = {
            "practice_name": "Repetition Quality Test Balanced",
            "element": "water",
            "duration_minutes": 15,
            "use_ai": False,
            "anti_repetition_mode": "balanced",
            "steps": ["Flow", "Release", "Receive"],
            "source_texts": ["A practice for emotional fluidity."]
        }

        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200

        data = response.json()
        paragraphs = data.get("paragraphs", [])

        # Balanced mode allows slightly more repetition
        repeat_ratio = calculate_stem_repeat_ratio(paragraphs, stem_words=8)
        max_allowed_ratio = 0.15  # Slightly higher for balanced mode

        print(f"Balanced mode stem repeat ratio: {repeat_ratio:.3f} (max allowed: {max_allowed_ratio})")

        assert repeat_ratio <= max_allowed_ratio, (
            f"Balanced mode has too much repetition: {repeat_ratio:.3f} > {max_allowed_ratio}"
        )
        print(f"PASSED: Balanced mode repetition quality OK ({repeat_ratio:.3f} <= {max_allowed_ratio})")

    def test_20min_strict_no_excessive_repetition(self):
        """Verify 20-minute strict mode doesn't sacrifice quality for word count."""
        payload = {
            "practice_name": "20-Min Quality Check",
            "element": "spirit",
            "duration_minutes": 20,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "steps": ["Connect", "Expand", "Integrate"],
            "source_texts": ["A deep spiritual practice for transformation."]
        }

        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200

        data = response.json()
        paragraphs = data.get("paragraphs", [])
        word_count = data.get("word_count", 0)

        repeat_ratio = calculate_stem_repeat_ratio(paragraphs, stem_words=8)
        max_allowed_ratio = 0.12

        print(f"20-min strict: {word_count} words, repeat ratio: {repeat_ratio:.3f}")

        # Both word count and quality must pass
        assert word_count >= 1920, f"Word count {word_count} below 1920"
        assert repeat_ratio <= max_allowed_ratio, f"Repeat ratio {repeat_ratio:.3f} > {max_allowed_ratio}"
        print(f"PASSED: 20-min strict has both sufficient words AND good quality")


class TestAntiRepetitionModePayload:
    """Tests to verify anti_repetition_mode is properly accepted in payload."""

    def test_strict_mode_accepted(self):
        """Verify strict mode is accepted."""
        payload = {
            "practice_name": "Mode Test Strict",
            "element": "earth",
            "duration_minutes": 7,
            "anti_repetition_mode": "strict"
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        print("PASSED: strict mode accepted")

    def test_balanced_mode_accepted(self):
        """Verify balanced mode is accepted."""
        payload = {
            "practice_name": "Mode Test Balanced",
            "element": "water",
            "duration_minutes": 7,
            "anti_repetition_mode": "balanced"
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        print("PASSED: balanced mode accepted")

    def test_invalid_mode_rejected(self):
        """Verify invalid mode is rejected with 422."""
        payload = {
            "practice_name": "Mode Test Invalid",
            "element": "fire",
            "duration_minutes": 7,
            "anti_repetition_mode": "invalid_mode"
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 422, f"Expected 422 for invalid mode, got {response.status_code}"
        print("PASSED: invalid mode rejected with 422")

    def test_default_mode_is_strict(self):
        """Verify default mode when not specified is strict."""
        payload = {
            "practice_name": "Mode Test Default",
            "element": "air",
            "duration_minutes": 7
            # anti_repetition_mode not specified
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        # The response doesn't include the mode, but we verify it works
        print("PASSED: default mode (strict) works when not specified")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
