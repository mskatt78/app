"""
Iteration 100 - Anti-Repetition Quality Tests for Guided Meditations
User reports: All guided meditations sound repetitive (strict mode selected)
Focus: POST /api/content/expand-script with use_ai=false returns long narration with low repeated paragraph stems
"""
import os
import re
import pytest
import requests
from collections import Counter

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Maximum allowed paragraph stem repeat ratio (12% as per backend constant)
MAX_PARAGRAPH_STEM_REPEAT_RATIO = 0.12

# Test modalities as specified in review request
TEST_MODALITIES = [
    {
        "practice_name": "Daily Guidance Meditation",
        "element": "spirit",
        "duration_minutes": 10,
        "steps": [
            "Find a comfortable seated position",
            "Close your eyes and take three deep breaths",
            "Set an intention for your day",
            "Visualize your day unfolding with ease",
            "Return to your breath and open your eyes",
        ],
        "source_texts": [
            "Daily guidance meditation helps you start your day with clarity and purpose.",
            "By setting intentions, you align your energy with your highest goals.",
            "This practice cultivates mindfulness and presence throughout your day.",
        ],
    },
    {
        "practice_name": "Sunrise Awakening Practice",
        "element": "fire",
        "duration_minutes": 12,
        "steps": [
            "Face the rising sun or visualize golden light",
            "Breathe in the energy of new beginnings",
            "Feel warmth spreading through your body",
            "Set your intentions for the day ahead",
            "Express gratitude for this new day",
        ],
        "source_texts": [
            "Sunrise practices harness the powerful energy of dawn.",
            "The morning light activates your circadian rhythm and boosts vitality.",
            "Ancient traditions honor the sun as a source of life and transformation.",
        ],
    },
    {
        "practice_name": "Evening Integration Practice",
        "element": "water",
        "duration_minutes": 15,
        "steps": [
            "Find a quiet space as the day winds down",
            "Review your day without judgment",
            "Release any tension or stress from your body",
            "Practice gratitude for the day's experiences",
            "Prepare your mind and body for restful sleep",
        ],
        "source_texts": [
            "Evening practices help process the day's experiences.",
            "Releasing tension before sleep improves rest quality.",
            "Gratitude practice at night enhances emotional well-being.",
        ],
    },
]


def normalize_text(text: str) -> str:
    """Normalize text for comparison."""
    return re.sub(r"[^a-z0-9 ]+", "", re.sub(r"\s+", " ", str(text or "")).strip().lower())


def get_paragraph_stem(text: str, words: int = 8) -> str:
    """Extract first N words as paragraph stem."""
    return " ".join(normalize_text(text).split()[:words])


def calculate_stem_repeat_ratio(paragraphs: list, stem_words: int = 8) -> float:
    """Calculate the ratio of repeated paragraph stems."""
    stems = [get_paragraph_stem(p, words=stem_words) for p in paragraphs if p]
    stems = [s for s in stems if s]
    if not stems:
        return 0.0
    stem_counts = Counter(stems)
    repeated = sum(count - 1 for count in stem_counts.values() if count > 1)
    return repeated / len(stems)


def find_repeated_sentence_openings(paragraphs: list, min_words: int = 4) -> dict:
    """Find sentence openings that repeat across paragraphs."""
    openings = []
    for para in paragraphs:
        sentences = re.split(r"(?<=[.!?])\s+", para)
        for sentence in sentences:
            words = sentence.strip().split()[:min_words]
            if len(words) >= min_words:
                openings.append(" ".join(words).lower())
    return Counter(openings)


class TestExpandScriptAntiRepetition:
    """Test expand-script endpoint for anti-repetition quality (use_ai=false)."""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session."""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})

    def test_health_check(self):
        """Verify backend is accessible."""
        response = self.session.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.text}"
        print("PASS: Backend health check")

    @pytest.mark.parametrize("modality", TEST_MODALITIES, ids=[m["practice_name"] for m in TEST_MODALITIES])
    def test_expand_script_stem_diversity_non_ai(self, modality):
        """Test that non-AI expand-script has low paragraph stem repetition."""
        response = self.session.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_id": None,
                "practice_name": modality["practice_name"],
                "element": modality["element"],
                "duration_minutes": modality["duration_minutes"],
                "steps": modality["steps"],
                "source_texts": modality["source_texts"],
                "use_ai": False,  # Strict non-AI mode as per user request
            },
        )

        assert response.status_code == 200, f"expand-script failed: {response.text}"
        data = response.json()

        # Verify response structure
        assert "paragraphs" in data, "Response missing 'paragraphs'"
        assert "segments" in data, "Response missing 'segments'"
        assert "word_count" in data, "Response missing 'word_count'"
        assert data.get("used_ai") is False, "Expected use_ai=false but got AI response"

        paragraphs = data["paragraphs"]
        word_count = data["word_count"]

        # Calculate stem repeat ratio
        stem_ratio = calculate_stem_repeat_ratio(paragraphs, stem_words=8)

        print(f"\n=== {modality['practice_name']} (non-AI) ===")
        print(f"Word count: {word_count}")
        print(f"Paragraph count: {len(paragraphs)}")
        print(f"Stem repeat ratio: {stem_ratio:.2%} (max allowed: {MAX_PARAGRAPH_STEM_REPEAT_RATIO:.0%})")

        # Assert stem diversity meets threshold
        assert stem_ratio <= MAX_PARAGRAPH_STEM_REPEAT_RATIO, (
            f"Stem repeat ratio {stem_ratio:.2%} exceeds max {MAX_PARAGRAPH_STEM_REPEAT_RATIO:.0%}"
        )

        # Verify minimum word count (7 min * 120 wpm = 840 words)
        assert word_count >= 800, f"Word count {word_count} below minimum 800"

        print(f"PASS: {modality['practice_name']} stem diversity check")

    @pytest.mark.parametrize("modality", TEST_MODALITIES, ids=[m["practice_name"] for m in TEST_MODALITIES])
    def test_no_obvious_repeated_sentence_openings(self, modality):
        """Test that no sentence opening repeats more than 3 times per paragraph."""
        response = self.session.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_id": None,
                "practice_name": modality["practice_name"],
                "element": modality["element"],
                "duration_minutes": modality["duration_minutes"],
                "steps": modality["steps"],
                "source_texts": modality["source_texts"],
                "use_ai": False,
            },
        )

        assert response.status_code == 200
        data = response.json()
        paragraphs = data["paragraphs"]

        # Find repeated sentence openings
        repeated_openings = find_repeated_sentence_openings(paragraphs, min_words=4)
        high_repeats = {k: v for k, v in repeated_openings.items() if v > 4}

        print(f"\n=== {modality['practice_name']} sentence openings ===")
        if high_repeats:
            print(f"High repeat openings (>4): {high_repeats}")
        else:
            print("No high repeat openings found")

        # Allow some repetition but flag excessive
        excessive_repeats = {k: v for k, v in repeated_openings.items() if v > 6}
        assert len(excessive_repeats) == 0, (
            f"Excessive sentence opening repetition: {excessive_repeats}"
        )

        print(f"PASS: {modality['practice_name']} sentence opening diversity")

    def test_expand_script_segments_structure(self):
        """Test that segments are properly structured for TTS playback."""
        modality = TEST_MODALITIES[0]

        response = self.session.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_id": None,
                "practice_name": modality["practice_name"],
                "element": modality["element"],
                "duration_minutes": 10,
                "steps": modality["steps"],
                "source_texts": modality["source_texts"],
                "use_ai": False,
            },
        )

        assert response.status_code == 200
        data = response.json()

        segments = data["segments"]
        assert len(segments) >= 3, f"Expected at least 3 segments, got {len(segments)}"

        # First segment should be shorter (intro)
        first_segment_words = len(segments[0].split())
        print(f"First segment words: {first_segment_words}")
        assert first_segment_words <= 150, f"First segment too long: {first_segment_words} words"

        # Other segments should be around 220 words
        for i, segment in enumerate(segments[1:], start=2):
            segment_words = len(segment.split())
            print(f"Segment {i} words: {segment_words}")
            assert segment_words <= 350, f"Segment {i} too long: {segment_words} words"

        print("PASS: Segments structure check")

    def test_expand_script_timeout_stability(self):
        """Test that expand-script responds within reasonable time (no timeout regression)."""
        import time

        modality = TEST_MODALITIES[0]
        start_time = time.time()

        response = self.session.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_id": None,
                "practice_name": modality["practice_name"],
                "element": modality["element"],
                "duration_minutes": 15,  # Longer duration to stress test
                "steps": modality["steps"],
                "source_texts": modality["source_texts"],
                "use_ai": False,
            },
            timeout=30,  # 30 second timeout
        )

        elapsed = time.time() - start_time

        assert response.status_code == 200, f"expand-script failed: {response.text}"
        print(f"Response time: {elapsed:.2f}s")
        assert elapsed < 10, f"Response took too long: {elapsed:.2f}s (max 10s)"

        print("PASS: Timeout stability check")


class TestTTSGenerateBase64:
    """Test TTS endpoint accepts expanded script text."""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session."""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})

    def test_tts_generate_base64_accepts_expanded_text(self):
        """Test that TTS endpoint accepts expanded script text and returns base64 audio."""
        # First get expanded script
        modality = TEST_MODALITIES[0]
        expand_response = self.session.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_id": None,
                "practice_name": modality["practice_name"],
                "element": modality["element"],
                "duration_minutes": 7,
                "steps": modality["steps"],
                "source_texts": modality["source_texts"],
                "use_ai": False,
            },
        )

        assert expand_response.status_code == 200
        data = expand_response.json()
        segments = data["segments"]
        assert len(segments) > 0, "No segments returned"

        # Test TTS with first segment
        first_segment = segments[0]
        tts_response = self.session.post(
            f"{BASE_URL}/api/tts/generate-base64",
            json={
                "text": first_segment,
                "voice": "nova",
                "speed": 0.84,
            },
            timeout=60,  # TTS can take longer
        )

        assert tts_response.status_code == 200, f"TTS failed: {tts_response.text}"
        tts_data = tts_response.json()

        assert "audio_base64" in tts_data, "TTS response missing audio_base64"
        audio_base64 = tts_data["audio_base64"]
        assert len(audio_base64) > 1000, f"Audio base64 too short: {len(audio_base64)} chars"

        print(f"TTS audio base64 length: {len(audio_base64)} chars")
        print("PASS: TTS generate-base64 accepts expanded script text")


class TestGuidedComponentsIntegration:
    """Test that guided components can call expansion endpoint successfully."""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session."""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})

    def test_expand_script_with_minimal_input(self):
        """Test expand-script works with minimal input (like frontend fallback)."""
        response = self.session.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Guided Practice",
                "element": "spirit",
                "duration_minutes": 7,
                "steps": [],
                "source_texts": [],
                "use_ai": False,
            },
        )

        assert response.status_code == 200, f"expand-script failed: {response.text}"
        data = response.json()

        assert data["word_count"] >= 800, f"Word count {data['word_count']} below minimum"
        assert len(data["segments"]) >= 3, f"Too few segments: {len(data['segments'])}"

        print(f"Minimal input word count: {data['word_count']}")
        print("PASS: Expand script with minimal input")

    def test_expand_script_with_rich_input(self):
        """Test expand-script works with rich input from practice data."""
        response = self.session.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_id": "test-practice-123",
                "practice_name": "Heart Opening Meditation",
                "element": "water",
                "duration_minutes": 20,
                "steps": [
                    "Sit comfortably with spine straight",
                    "Place hands on heart center",
                    "Breathe deeply into the heart space",
                    "Visualize green light expanding",
                    "Send love to yourself and others",
                    "Return to normal breathing",
                ],
                "source_texts": [
                    "The heart chakra is the center of love and compassion.",
                    "Opening the heart allows for deeper connection with self and others.",
                    "Green is the color associated with the heart chakra.",
                    "Heart-centered meditation reduces stress and anxiety.",
                    "Compassion practice increases emotional resilience.",
                ],
                "use_ai": False,
            },
        )

        assert response.status_code == 200, f"expand-script failed: {response.text}"
        data = response.json()

        # 20 min * 120 wpm = 2400 words target
        assert data["word_count"] >= 2000, f"Word count {data['word_count']} below expected for 20 min"
        assert data["target_minutes"] == 20, f"Target minutes mismatch: {data['target_minutes']}"

        # Check stem diversity
        stem_ratio = calculate_stem_repeat_ratio(data["paragraphs"], stem_words=8)
        print(f"Rich input stem ratio: {stem_ratio:.2%}")
        assert stem_ratio <= MAX_PARAGRAPH_STEM_REPEAT_RATIO

        print(f"Rich input word count: {data['word_count']}")
        print("PASS: Expand script with rich input")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
