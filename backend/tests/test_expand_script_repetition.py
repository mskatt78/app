"""
Test expand-script endpoint for repetitive template stems.
Bug: Guided script is repeating template lines throughout the session.
Specific stems to check:
- 'Stay with <practice> now and allow this phase to deepen'
- 'Return to this emphasis'
- 'For this round of'
- 'Keep this thread alive as you continue'
"""
import os
import re
import pytest
import requests
from collections import Counter

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Repetitive stems that should NOT appear multiple times
PROBLEMATIC_STEMS = [
    "stay with",
    "return to this emphasis",
    "for this round of",
    "keep this thread alive",
    "allow this phase to deepen",
]

# Sample practices to test
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


class TestExpandScriptRepetition:
    """Test expand-script endpoint for repetitive content."""

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
    def test_expand_script_no_problematic_stems(self, practice):
        """Test that expand-script output doesn't contain excessive repetitive stems."""
        response = self.session.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_id": None,
                "practice_name": practice["practice_name"],
                "element": practice["element"],
                "duration_minutes": practice["duration_minutes"],
                "steps": practice["steps"],
                "source_texts": practice["source_texts"],
                "use_ai": True,
            },
        )
        
        assert response.status_code == 200, f"expand-script failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "paragraphs" in data, "Response missing 'paragraphs'"
        assert "segments" in data, "Response missing 'segments'"
        assert "word_count" in data, "Response missing 'word_count'"
        
        paragraphs = data["paragraphs"]
        full_text = " ".join(paragraphs)
        word_count = data["word_count"]
        
        print(f"\n=== {practice['practice_name']} ===")
        print(f"Word count: {word_count}")
        print(f"Paragraph count: {len(paragraphs)}")
        print(f"Used AI: {data.get('used_ai', False)}")
        
        # Check for problematic stems
        stem_issues = []
        for stem in PROBLEMATIC_STEMS:
            count = count_stem_occurrences(full_text, stem)
            if count > 2:  # Allow up to 2 occurrences
                stem_issues.append(f"'{stem}' appears {count} times (max allowed: 2)")
            print(f"  Stem '{stem}': {count} occurrences")
        
        # Check for repeated sentence starts
        repeated_starts = find_repeated_sentence_starts(paragraphs)
        high_repeats = {k: v for k, v in repeated_starts.items() if v > 3}
        if high_repeats:
            print(f"  Repeated sentence starts (>3): {high_repeats}")
        
        # Assert no excessive repetition
        assert len(stem_issues) == 0, f"Excessive repetition found:\n" + "\n".join(stem_issues)
        
        # Verify minimum word count (7 min * 120 wpm = 840 words)
        assert word_count >= 800, f"Word count {word_count} below minimum 800"
        
        print(f"✓ {practice['practice_name']} passed repetition check")

    def test_expand_script_coherent_narrative(self):
        """Test that script reads as coherent long-form narrative."""
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
                "use_ai": True,
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        paragraphs = data["paragraphs"]
        
        # Check paragraph variety - no two consecutive paragraphs should start the same
        prev_start = ""
        consecutive_same_starts = 0
        for para in paragraphs:
            words = para.strip().split()[:3]
            current_start = " ".join(words).lower() if len(words) >= 3 else ""
            if current_start == prev_start and current_start:
                consecutive_same_starts += 1
            prev_start = current_start
        
        assert consecutive_same_starts <= 1, f"Found {consecutive_same_starts} consecutive paragraphs with same start"
        
        # Check that paragraphs have reasonable length variety
        lengths = [len(p.split()) for p in paragraphs]
        avg_length = sum(lengths) / len(lengths) if lengths else 0
        print(f"Average paragraph length: {avg_length:.1f} words")
        print(f"Paragraph length range: {min(lengths)} - {max(lengths)} words")
        
        # Verify segments are properly formed
        segments = data["segments"]
        assert len(segments) >= 3, f"Expected at least 3 segments, got {len(segments)}"
        
        print("✓ Coherent narrative check passed")

    def test_expand_script_word_floor(self):
        """Test that script meets 7+ minute word floor (840+ words)."""
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
                    "use_ai": True,
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

    def test_expand_script_sample_output(self):
        """Print sample output for manual review of coherence."""
        practice = TEST_PRACTICES[0]  # Pendulation
        
        response = self.session.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_id": None,
                "practice_name": practice["practice_name"],
                "element": practice["element"],
                "duration_minutes": 10,
                "steps": practice["steps"],
                "source_texts": practice["source_texts"],
                "use_ai": True,
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        
        print("\n" + "=" * 60)
        print(f"SAMPLE OUTPUT: {practice['practice_name']}")
        print(f"Word count: {data['word_count']}, Used AI: {data.get('used_ai', False)}")
        print("=" * 60)
        
        # Print first 5 paragraphs for review
        for i, para in enumerate(data["paragraphs"][:5]):
            print(f"\n[Paragraph {i+1}]")
            print(para[:300] + "..." if len(para) > 300 else para)
        
        print("\n" + "=" * 60)
        print("✓ Sample output printed for manual review")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
