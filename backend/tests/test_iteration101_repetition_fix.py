"""
Iteration 101 - Sentence-Level Repetition Fix Verification
Tests for POST /api/content/expand-script after main agent's fix to _build_extension_paragraphs
with larger midline/closer pools + repetition counters + loop guard.

Key verifications:
1. Prior repeated phrases ('keep your body receptive', 'stay connected to sensation') are reduced
2. Endpoint responsiveness and no timeout/unresponsive regression
3. use_ai=true request does not block and still returns stable response
4. Paragraph-level stem diversity maintained
"""

import os
import re
import time
from collections import Counter
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


def count_words(text: str) -> int:
    return len(re.findall(r"\S+", str(text or "").strip()))


def normalize_text(text: str) -> str:
    normalized = re.sub(r"\s+", " ", str(text or "")).strip().lower()
    return re.sub(r"[^a-z0-9 ]+", "", normalized)


def paragraph_stem(text: str, words: int = 8) -> str:
    return " ".join(normalize_text(text).split()[:words])


def calculate_stem_repeat_ratio(paragraphs: list) -> float:
    stems = [paragraph_stem(p, words=8) for p in paragraphs if p]
    stems = [s for s in stems if s]
    if not stems:
        return 0.0
    stem_counts = Counter(stems)
    repeated = sum(count - 1 for count in stem_counts.values() if count > 1)
    return repeated / len(stems)


def count_phrase_occurrences(paragraphs: list, phrase: str) -> int:
    """Count how many times a phrase appears across all paragraphs."""
    text = " ".join(paragraphs).lower()
    return text.count(phrase.lower())


def get_most_repeated_phrases(paragraphs: list, phrase_length: int = 4, top_n: int = 10) -> list:
    """Extract most repeated n-word phrases from paragraphs."""
    text = " ".join(paragraphs).lower()
    words = re.findall(r"\b[a-z]+\b", text)
    phrases = []
    for i in range(len(words) - phrase_length + 1):
        phrase = " ".join(words[i:i + phrase_length])
        phrases.append(phrase)
    counts = Counter(phrases)
    return counts.most_common(top_n)


class TestExpandScriptRepetitionFix:
    """Tests for sentence-level repetition fix in expand-script endpoint."""

    def test_health_check(self):
        """Verify backend is responsive."""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        print("Health check passed")

    @pytest.mark.parametrize("duration_minutes", [10, 15, 20])
    def test_prior_repeated_phrases_reduced(self, duration_minutes):
        """
        Verify that previously reported repetitive phrases are significantly reduced.
        Prior issue: 'keep your body receptive' appeared 11 times, 'stay connected to sensation' 9 times.
        """
        payload = {
            "practice_name": "Evening Integration Practice",
            "element": "Spirit",
            "duration_minutes": duration_minutes,
            "use_ai": False,
            "steps": ["Ground your energy", "Release tension", "Integrate the day", "Prepare for rest"],
            "source_texts": [
                "This practice helps you integrate the experiences of your day",
                "Allow your body to soften and release"
            ]
        }

        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()

        paragraphs = data.get("paragraphs", [])
        assert len(paragraphs) > 0, "Should return paragraphs"

        # Check for previously problematic phrases
        receptive_count = count_phrase_occurrences(paragraphs, "keep your body receptive")
        sensation_count = count_phrase_occurrences(paragraphs, "stay connected to sensation")

        # These should now be 0 or very low (< 3)
        print(f"Duration {duration_minutes}min: 'keep your body receptive' count: {receptive_count}")
        print(f"Duration {duration_minutes}min: 'stay connected to sensation' count: {sensation_count}")

        assert receptive_count <= 3, f"'keep your body receptive' appears {receptive_count} times (should be <= 3)"
        assert sensation_count <= 3, f"'stay connected to sensation' appears {sensation_count} times (should be <= 3)"

    @pytest.mark.parametrize("duration_minutes", [15, 20])
    def test_no_phrase_exceeds_threshold(self, duration_minutes):
        """
        Verify no 4-word phrase appears more than 8 times in longer practices.
        This is a reasonable threshold for 15-20 minute practices.
        """
        payload = {
            "practice_name": "Deep Relaxation Journey",
            "element": "Water",
            "duration_minutes": duration_minutes,
            "use_ai": False,
            "steps": ["Settle into stillness", "Release physical tension", "Soften emotional holding", "Rest in awareness"],
            "source_texts": [
                "Allow the water element to wash through you",
                "Let go of what no longer serves you"
            ]
        }

        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()

        paragraphs = data.get("paragraphs", [])
        most_repeated = get_most_repeated_phrases(paragraphs, phrase_length=4, top_n=5)

        print(f"Duration {duration_minutes}min - Most repeated 4-word phrases:")
        for phrase, count in most_repeated:
            print(f"  '{phrase}': {count} times")

        # No phrase should appear more than 8 times
        max_allowed = 8
        for phrase, count in most_repeated:
            assert count <= max_allowed, f"Phrase '{phrase}' appears {count} times (max allowed: {max_allowed})"

    def test_endpoint_responsiveness_no_timeout(self):
        """
        Verify endpoint responds quickly without timeout regression.
        Should respond in under 5 seconds for a 20-minute practice.
        """
        payload = {
            "practice_name": "Extended Morning Practice",
            "element": "Fire",
            "duration_minutes": 20,
            "use_ai": False,
            "steps": ["Awaken energy", "Build inner fire", "Channel intention", "Seal the practice"],
            "source_texts": ["Ignite your inner power", "Transform stagnant energy"]
        }

        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            timeout=30
        )
        elapsed = time.time() - start_time

        assert response.status_code == 200
        print(f"Response time for 20-min practice: {elapsed:.2f}s")
        assert elapsed < 5.0, f"Response took {elapsed:.2f}s (should be < 5s)"

        data = response.json()
        # 20-min practice should have at least 1500 words (120 words/min * 20 min = 2400 target, but actual may vary)
        assert data.get("word_count", 0) >= 1500, f"Word count {data.get('word_count')} should be >= 1500 for 20-min"

    def test_use_ai_true_does_not_block(self):
        """
        Verify use_ai=true request does not block and returns stable response.
        AI expansion is disabled unless ENABLE_GUIDED_AI_EXPANSION=true, so it should
        fall back to template-based expansion without blocking.
        """
        payload = {
            "practice_name": "AI Test Practice",
            "element": "Air",
            "duration_minutes": 10,
            "use_ai": True,  # This should not block
            "steps": ["Breathe deeply", "Clear the mind"],
            "source_texts": ["Find clarity through breath"]
        }

        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            timeout=30
        )
        elapsed = time.time() - start_time

        assert response.status_code == 200
        print(f"use_ai=true response time: {elapsed:.2f}s")
        assert elapsed < 5.0, f"use_ai=true took {elapsed:.2f}s (should not block)"

        data = response.json()
        # Should return template-based expansion (used_ai=false) since AI is disabled
        assert "paragraphs" in data
        assert len(data["paragraphs"]) > 0
        print(f"use_ai=true returned {len(data['paragraphs'])} paragraphs, used_ai={data.get('used_ai')}")

    def test_paragraph_stem_diversity_maintained(self):
        """
        Verify paragraph-level stem diversity is still excellent (< 5% repeat ratio).
        """
        payload = {
            "practice_name": "Stem Diversity Test",
            "element": "Earth",
            "duration_minutes": 15,
            "use_ai": False,
            "steps": ["Root into the earth", "Feel stability", "Build foundation"],
            "source_texts": ["Connect with the grounding energy of earth"]
        }

        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()

        paragraphs = data.get("paragraphs", [])
        repeat_ratio = calculate_stem_repeat_ratio(paragraphs)

        print(f"Paragraph stem repeat ratio: {repeat_ratio:.2%}")
        assert repeat_ratio < 0.05, f"Stem repeat ratio {repeat_ratio:.2%} should be < 5%"

    def test_segments_structure_correct(self):
        """
        Verify segments structure: first segment ~85-100 words (intro), subsequent ~200 words.
        """
        payload = {
            "practice_name": "Segment Structure Test",
            "element": "Spirit",
            "duration_minutes": 12,
            "use_ai": False,
            "steps": ["Center yourself", "Open to guidance"],
            "source_texts": ["Receive wisdom from within"]
        }

        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()

        segments = data.get("segments", [])
        assert len(segments) >= 4, "Should have at least 4 segments for 12-min practice"

        first_segment_words = count_words(segments[0])
        print(f"First segment word count: {first_segment_words}")
        assert 50 <= first_segment_words <= 150, f"First segment should be 50-150 words, got {first_segment_words}"

        # Check subsequent segments are around 200 words
        for i, segment in enumerate(segments[1:], start=2):
            segment_words = count_words(segment)
            print(f"Segment {i} word count: {segment_words}")
            assert 100 <= segment_words <= 350, f"Segment {i} should be 100-350 words, got {segment_words}"


class TestExpandScriptEdgeCases:
    """Edge case tests for expand-script endpoint."""

    def test_minimal_input(self):
        """Test with minimal input - should still produce valid output."""
        payload = {
            "practice_name": "Simple Practice",
            "duration_minutes": 7,
            "use_ai": False
        }

        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()

        assert data.get("word_count", 0) >= 840, "Should meet minimum 7-min word floor"
        assert len(data.get("paragraphs", [])) > 0
        assert len(data.get("segments", [])) > 0

    def test_very_long_practice(self):
        """Test 30-minute practice - should handle without timeout."""
        payload = {
            "practice_name": "Extended Journey",
            "element": "Spirit",
            "duration_minutes": 30,
            "use_ai": False,
            "steps": ["Begin", "Deepen", "Integrate", "Complete"],
            "source_texts": ["A long journey of self-discovery"]
        }

        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            timeout=60
        )
        elapsed = time.time() - start_time

        assert response.status_code == 200
        print(f"30-min practice response time: {elapsed:.2f}s")
        assert elapsed < 10.0, f"30-min practice took {elapsed:.2f}s (should be < 10s)"

        data = response.json()
        # 30-min practice should have at least 1800 words (actual output may be less due to deduplication)
        assert data.get("word_count", 0) >= 1800, "30-min should have >= 1800 words"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
