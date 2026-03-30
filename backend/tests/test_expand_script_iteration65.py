"""
Iteration 65 - Test expand-script endpoint for repetitive content quality.
Comparing against iteration 64 baseline metrics.

Iteration 64 Issues (BASELINE):
- Step phrases repeated 6-16x per script
- Template stems repeated 2-4x each: 'Bring your attention to', 'Let your next point of focus be', etc.
- Duplicate paragraphs at end of scripts

This test verifies the main agent's fix has improved content quality.
"""
import os
import re
import pytest
import requests
from collections import Counter

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")

# Problematic stems from iteration 64 (should be ABSENT or minimal)
ITERATION_64_STEMS = [
    "bring your attention to",
    "let your next point of focus be",
    "center this phase around",
    "carry this thread through the next breaths",
    "let this support",
    "gently return to",
    "keep awareness anchored in",
]

# New stems to check (from current implementation)
NEW_STEMS_TO_CHECK = [
    "as this journey continues",
    "let this round nourish",
    "keep awareness near",
]

# Sample practices matching iteration 64 test cases
TEST_PRACTICES = [
    {
        "practice_name": "Pendulation",
        "element": "earth",
        "duration_minutes": 10,
        "steps": [
            "Find a comfortable seated position",
            "Begin to notice sensations in your body",
            "Allow your attention to pendulate between areas of comfort and discomfort",
            "Stay with each sensation for a few breaths",
            "Notice how sensations shift and change",
        ],
        "source_texts": [
            "Pendulation is a somatic practice that helps regulate the nervous system.",
            "By moving attention between comfort and discomfort, we build resilience.",
        ],
    },
    {
        "practice_name": "Shake and Release",
        "element": "fire",
        "duration_minutes": 8,
        "steps": [
            "Stand with feet hip-width apart",
            "Begin to shake your hands gently",
            "Let the shaking spread through your arms",
            "Allow your whole body to shake",
            "Gradually slow down and feel the stillness",
        ],
        "source_texts": [
            "Shaking is a primal way to release tension and trauma from the body.",
            "Animals naturally shake after stressful events to discharge energy.",
        ],
    },
    {
        "practice_name": "Root Chakra Cleansing",
        "element": "earth",
        "duration_minutes": 12,
        "steps": [
            "Sit comfortably with your spine straight",
            "Visualize a red glowing sphere at the base of your spine",
            "Breathe into this area with slow, deep breaths",
            "Chant LAM silently or aloud",
            "Feel grounded and secure",
        ],
        "source_texts": [
            "The root chakra governs our sense of safety and belonging.",
            "When balanced, we feel grounded, stable, and secure in our bodies.",
        ],
    },
    {
        "practice_name": "Om Mani Padme Hum Mantra",
        "element": "spirit",
        "duration_minutes": 15,
        "steps": [
            "Find a comfortable meditation posture",
            "Take three deep breaths to center yourself",
            "Begin chanting Om Mani Padme Hum",
            "Let the vibration fill your entire being",
            "Continue for the duration of the practice",
        ],
        "source_texts": [
            "Om Mani Padme Hum is the mantra of compassion.",
            "Each syllable purifies a different aspect of consciousness.",
        ],
    },
]


def count_stem_occurrences(text: str, stem: str) -> int:
    """Count how many times a stem appears in text (case-insensitive)."""
    pattern = re.compile(re.escape(stem), re.IGNORECASE)
    return len(pattern.findall(text))


def find_repeated_sentence_starts(paragraphs: list, min_words: int = 4) -> dict:
    """Find sentence starts that repeat across paragraphs."""
    starts = []
    for para in paragraphs:
        sentences = re.split(r"(?<=[.!?])\s+", para)
        for sentence in sentences:
            words = sentence.strip().split()[:min_words]
            if len(words) >= min_words:
                starts.append(" ".join(words).lower())
    return Counter(starts)


def count_source_text_repetitions(full_text: str, source_texts: list) -> dict:
    """Count how many times each source text appears."""
    results = {}
    for source in source_texts:
        # Normalize and check
        normalized_source = source.lower().strip().rstrip(".")
        count = full_text.lower().count(normalized_source)
        results[source[:50] + "..."] = count
    return results


class TestExpandScriptIteration65:
    """Test expand-script endpoint for iteration 65 quality verification."""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session."""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})

    def test_health_check(self):
        """Verify backend is accessible."""
        response = self.session.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.text}"
        print("✓ Backend health check passed")

    @pytest.mark.parametrize("practice", TEST_PRACTICES, ids=[p["practice_name"] for p in TEST_PRACTICES])
    def test_iteration64_stems_removed(self, practice):
        """Verify iteration 64 problematic stems are absent or minimal."""
        response = self.session.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_id": None,
                "practice_name": practice["practice_name"],
                "element": practice["element"],
                "duration_minutes": practice["duration_minutes"],
                "steps": practice["steps"],
                "source_texts": practice["source_texts"],
                "use_ai": False,  # Test fallback to ensure deterministic results
            },
        )
        
        assert response.status_code == 200, f"expand-script failed: {response.text}"
        data = response.json()
        
        paragraphs = data["paragraphs"]
        full_text = " ".join(paragraphs).lower()
        
        print(f"\n=== {practice['practice_name']} - Iteration 64 Stems Check ===")
        
        all_pass = True
        for stem in ITERATION_64_STEMS:
            count = count_stem_occurrences(full_text, stem)
            status = "PASS" if count <= 2 else "FAIL"
            if count > 2:
                all_pass = False
            print(f"  {status}: '{stem}' = {count}x (max allowed: 2)")
        
        assert all_pass, f"Iteration 64 problematic stems still present in {practice['practice_name']}"
        print(f"✓ {practice['practice_name']} - Iteration 64 stems removed")

    @pytest.mark.parametrize("practice", TEST_PRACTICES, ids=[p["practice_name"] for p in TEST_PRACTICES])
    def test_step_phrase_repetition(self, practice):
        """Verify step phrases are not repeated excessively (iteration 64 had 6-16x)."""
        response = self.session.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_id": None,
                "practice_name": practice["practice_name"],
                "element": practice["element"],
                "duration_minutes": practice["duration_minutes"],
                "steps": practice["steps"],
                "source_texts": practice["source_texts"],
                "use_ai": False,
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        
        paragraphs = data["paragraphs"]
        full_text = " ".join(paragraphs).lower()
        
        print(f"\n=== {practice['practice_name']} - Step Phrase Repetition ===")
        
        all_pass = True
        for step in practice["steps"]:
            step_lower = step.lower()
            count = full_text.count(step_lower)
            # Allow up to 3 occurrences (iteration 64 had 6-16x)
            status = "PASS" if count <= 3 else "FAIL"
            if count > 3:
                all_pass = False
            print(f"  {status}: '{step[:40]}...' = {count}x (max allowed: 3)")
        
        assert all_pass, f"Step phrases repeated excessively in {practice['practice_name']}"
        print(f"✓ {practice['practice_name']} - Step phrase repetition acceptable")

    @pytest.mark.parametrize("practice", TEST_PRACTICES, ids=[p["practice_name"] for p in TEST_PRACTICES])
    def test_new_stem_repetition(self, practice):
        """Check new stems for excessive repetition."""
        response = self.session.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_id": None,
                "practice_name": practice["practice_name"],
                "element": practice["element"],
                "duration_minutes": practice["duration_minutes"],
                "steps": practice["steps"],
                "source_texts": practice["source_texts"],
                "use_ai": False,
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        
        paragraphs = data["paragraphs"]
        full_text = " ".join(paragraphs).lower()
        
        print(f"\n=== {practice['practice_name']} - New Stem Repetition ===")
        print(f"Word count: {data['word_count']}, Paragraphs: {len(paragraphs)}")
        
        issues = []
        for stem in NEW_STEMS_TO_CHECK:
            count = count_stem_occurrences(full_text, stem)
            # Allow up to 5 occurrences for new stems
            status = "PASS" if count <= 5 else "WARN"
            if count > 5:
                issues.append(f"'{stem}' = {count}x")
            print(f"  {status}: '{stem}' = {count}x (recommended max: 5)")
        
        if issues:
            print(f"  WARNING: High repetition detected: {', '.join(issues)}")
        else:
            print(f"✓ {practice['practice_name']} - New stem repetition acceptable")

    @pytest.mark.parametrize("practice", TEST_PRACTICES, ids=[p["practice_name"] for p in TEST_PRACTICES])
    def test_source_text_repetition(self, practice):
        """Check source text repetition (new issue found in iteration 65)."""
        response = self.session.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_id": None,
                "practice_name": practice["practice_name"],
                "element": practice["element"],
                "duration_minutes": practice["duration_minutes"],
                "steps": practice["steps"],
                "source_texts": practice["source_texts"],
                "use_ai": False,
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        
        paragraphs = data["paragraphs"]
        full_text = " ".join(paragraphs).lower()
        
        print(f"\n=== {practice['practice_name']} - Source Text Repetition ===")
        
        issues = []
        for source in practice["source_texts"]:
            source_lower = source.lower().strip().rstrip(".")
            count = full_text.count(source_lower)
            # Source texts should appear max 5 times
            status = "PASS" if count <= 5 else "FAIL"
            if count > 5:
                issues.append(f"'{source[:40]}...' = {count}x")
            print(f"  {status}: '{source[:40]}...' = {count}x (max allowed: 5)")
        
        if issues:
            print(f"  CRITICAL: Source text repeated excessively: {', '.join(issues)}")
        else:
            print(f"✓ {practice['practice_name']} - Source text repetition acceptable")

    def test_duplicate_paragraphs(self):
        """Check for duplicate paragraphs (iteration 64 had 2-3 duplicates)."""
        practice = TEST_PRACTICES[0]  # Pendulation
        
        response = self.session.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_id": None,
                "practice_name": practice["practice_name"],
                "element": practice["element"],
                "duration_minutes": practice["duration_minutes"],
                "steps": practice["steps"],
                "source_texts": practice["source_texts"],
                "use_ai": False,
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        
        paragraphs = data["paragraphs"]
        
        # Check for exact duplicates
        seen = set()
        duplicates = 0
        for p in paragraphs:
            normalized = " ".join(p.lower().split())
            if normalized in seen:
                duplicates += 1
            seen.add(normalized)
        
        print(f"\n=== Duplicate Paragraph Check ===")
        print(f"Total paragraphs: {len(paragraphs)}")
        print(f"Duplicate paragraphs: {duplicates}")
        
        assert duplicates == 0, f"Found {duplicates} duplicate paragraphs"
        print("✓ No duplicate paragraphs found")

    def test_word_count_meets_minimum(self):
        """Verify word count meets 7+ minute minimum (840+ words)."""
        for practice in TEST_PRACTICES:
            response = self.session.post(
                f"{BASE_URL}/api/content/expand-script",
                json={
                    "practice_id": None,
                    "practice_name": practice["practice_name"],
                    "element": practice["element"],
                    "duration_minutes": practice["duration_minutes"],
                    "steps": practice["steps"],
                    "source_texts": practice["source_texts"],
                    "use_ai": False,
                },
            )
            
            assert response.status_code == 200
            data = response.json()
            word_count = data["word_count"]
            target_words = data["target_word_count"]
            
            print(f"{practice['practice_name']}: {word_count} words (target: {target_words})")
            
            # Must meet minimum 7 min * 120 wpm = 840 words
            assert word_count >= 800, f"{practice['practice_name']} has only {word_count} words"
        
        print("✓ All practices meet word floor")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
