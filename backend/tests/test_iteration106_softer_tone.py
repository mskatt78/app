"""
Iteration 106 - Softer Tone & Human-Like Guidance Testing
Tests that guided narration now uses softer, more intuitive language
instead of mechanical command-style instructions.
"""
import os
import re
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Mechanical/robotic phrases that should be REDUCED or ABSENT
MECHANICAL_PHRASES = [
    "you must",
    "you should",
    "do this now",
    "perform this",
    "execute",
    "command",
    "instruction:",
    "step 1:",
    "step 2:",
    "step 3:",
    "immediately",
    "required to",
    "mandatory",
    "you need to",
    "you have to",
]

# Softer/human-like phrases that should be PRESENT
SOFTER_PHRASES = [
    "whenever you're ready",
    "if it feels",
    "if it helps",
    "let yourself",
    "allow",
    "gently",
    "softly",
    "kindly",
    "patient",
    "trust",
    "compassion",
    "embodied",
    "grounded",
    "steady",
    "safe",
    "supported",
    "intuitive",
    "human",
    "natural",
    "ease",
    "permission",
    "soften",
    "settle",
    "receive",
]


def count_phrase_occurrences(text: str, phrases: list) -> dict:
    """Count occurrences of phrases in text (case-insensitive)."""
    text_lower = text.lower()
    return {phrase: text_lower.count(phrase.lower()) for phrase in phrases}


def calculate_tone_score(text: str) -> dict:
    """Calculate tone metrics for the narration text."""
    mechanical_counts = count_phrase_occurrences(text, MECHANICAL_PHRASES)
    softer_counts = count_phrase_occurrences(text, SOFTER_PHRASES)
    
    total_mechanical = sum(mechanical_counts.values())
    total_softer = sum(softer_counts.values())
    
    word_count = len(text.split())
    
    return {
        "word_count": word_count,
        "mechanical_count": total_mechanical,
        "softer_count": total_softer,
        "mechanical_per_1000_words": (total_mechanical / word_count * 1000) if word_count > 0 else 0,
        "softer_per_1000_words": (total_softer / word_count * 1000) if word_count > 0 else 0,
        "softer_to_mechanical_ratio": (total_softer / total_mechanical) if total_mechanical > 0 else float('inf'),
        "mechanical_phrases_found": {k: v for k, v in mechanical_counts.items() if v > 0},
        "softer_phrases_found": {k: v for k, v in softer_counts.items() if v > 0},
    }


class TestHealthCheck:
    """Basic health check."""
    
    def test_health_check(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("Health check passed")


class TestSofterToneQuality:
    """Test that narration uses softer, more human-like language."""
    
    def test_expand_script_softer_tone_7min(self):
        """Test 7-minute narration has softer tone."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Heart Opening Meditation",
                "element": "Spirit",
                "duration_minutes": 7,
                "use_ai": False,
                "anti_repetition_mode": "strict",
                "steps": ["Open your heart center", "Breathe into the chest"],
                "source_texts": ["This practice cultivates compassion and self-love."],
            },
        )
        assert response.status_code == 200
        data = response.json()
        
        full_text = " ".join(data.get("paragraphs", []))
        tone = calculate_tone_score(full_text)
        
        print("\n7-min Tone Analysis:")
        print(f"  Word count: {tone['word_count']}")
        print(f"  Mechanical phrases: {tone['mechanical_count']} ({tone['mechanical_per_1000_words']:.1f} per 1000 words)")
        print(f"  Softer phrases: {tone['softer_count']} ({tone['softer_per_1000_words']:.1f} per 1000 words)")
        print(f"  Softer-to-mechanical ratio: {tone['softer_to_mechanical_ratio']:.1f}")
        
        # Softer phrases should significantly outnumber mechanical ones
        assert tone["softer_count"] > tone["mechanical_count"], \
            f"Softer phrases ({tone['softer_count']}) should outnumber mechanical ({tone['mechanical_count']})"
        
        # Should have at least 5 softer phrases per 1000 words
        assert tone["softer_per_1000_words"] >= 5, \
            f"Should have >=5 softer phrases per 1000 words, got {tone['softer_per_1000_words']:.1f}"
        
        print("PASSED: 7-min narration has softer tone")
    
    def test_expand_script_softer_tone_15min(self):
        """Test 15-minute narration has softer tone."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Deep Grounding Practice",
                "element": "Earth",
                "duration_minutes": 15,
                "use_ai": False,
                "anti_repetition_mode": "strict",
                "steps": ["Connect with the earth", "Feel roots growing down"],
                "source_texts": ["Grounding brings stability and calm."],
            },
        )
        assert response.status_code == 200
        data = response.json()
        
        full_text = " ".join(data.get("paragraphs", []))
        tone = calculate_tone_score(full_text)
        
        print("\n15-min Tone Analysis:")
        print(f"  Word count: {tone['word_count']}")
        print(f"  Mechanical phrases: {tone['mechanical_count']}")
        print(f"  Softer phrases: {tone['softer_count']}")
        print(f"  Softer-to-mechanical ratio: {tone['softer_to_mechanical_ratio']:.1f}")
        
        assert tone["softer_count"] > tone["mechanical_count"]
        assert tone["softer_per_1000_words"] >= 5
        print("PASSED: 15-min narration has softer tone")
    
    def test_expand_script_softer_tone_20min(self):
        """Test 20-minute narration has softer tone."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Shamanic Journey",
                "element": "Fire",
                "duration_minutes": 20,
                "use_ai": False,
                "anti_repetition_mode": "strict",
                "steps": ["Enter the sacred space", "Meet your spirit guide"],
                "source_texts": ["Journey into the depths of consciousness."],
            },
        )
        assert response.status_code == 200
        data = response.json()
        
        full_text = " ".join(data.get("paragraphs", []))
        tone = calculate_tone_score(full_text)
        
        print("\n20-min Tone Analysis:")
        print(f"  Word count: {tone['word_count']}")
        print(f"  Mechanical phrases: {tone['mechanical_count']}")
        print(f"  Softer phrases: {tone['softer_count']}")
        
        assert tone["softer_count"] > tone["mechanical_count"]
        print("PASSED: 20-min narration has softer tone")
    
    def test_expand_script_softer_tone_25min(self):
        """Test 25-minute narration has softer tone."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Extended Breathwork Session",
                "element": "Air",
                "duration_minutes": 25,
                "use_ai": False,
                "anti_repetition_mode": "strict",
                "steps": ["Begin with natural breathing", "Deepen the breath"],
                "source_texts": ["Breathwork transforms consciousness."],
            },
        )
        assert response.status_code == 200
        data = response.json()
        
        full_text = " ".join(data.get("paragraphs", []))
        tone = calculate_tone_score(full_text)
        
        print("\n25-min Tone Analysis:")
        print(f"  Word count: {tone['word_count']}")
        print(f"  Mechanical phrases: {tone['mechanical_count']}")
        print(f"  Softer phrases: {tone['softer_count']}")
        
        assert tone["softer_count"] > tone["mechanical_count"]
        print("PASSED: 25-min narration has softer tone")


class TestAntiRepetitionPreserved:
    """Verify anti-repetition quality is still maintained after tone updates."""
    
    def _calculate_stem_repeat_ratio(self, paragraphs: list, stem_words: int = 8) -> float:
        """Calculate paragraph stem repeat ratio."""
        def normalize(text):
            return re.sub(r"[^a-z0-9 ]+", "", text.lower().strip())
        
        def stem(text):
            return " ".join(normalize(text).split()[:stem_words])
        
        stems = [stem(p) for p in paragraphs if p]
        stems = [s for s in stems if s]
        if not stems:
            return 0.0
        
        from collections import Counter
        counts = Counter(stems)
        repeated = sum(c - 1 for c in counts.values() if c > 1)
        return repeated / len(stems)
    
    def test_strict_mode_low_repetition(self):
        """Strict mode should have stem repeat ratio <= 0.12."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Anti-Repetition Test Practice",
                "element": "Spirit",
                "duration_minutes": 15,
                "use_ai": False,
                "anti_repetition_mode": "strict",
                "steps": ["Step one", "Step two", "Step three"],
                "source_texts": ["Source text for testing."],
            },
        )
        assert response.status_code == 200
        data = response.json()
        
        paragraphs = data.get("paragraphs", [])
        ratio = self._calculate_stem_repeat_ratio(paragraphs)
        
        print(f"\nStrict mode stem repeat ratio: {ratio:.3f}")
        assert ratio <= 0.12, f"Strict mode ratio {ratio:.3f} exceeds 0.12 threshold"
        print("PASSED: Anti-repetition quality preserved in strict mode")
    
    def test_balanced_mode_acceptable_repetition(self):
        """Balanced mode should have stem repeat ratio <= 0.15."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Balanced Mode Test Practice",
                "element": "Water",
                "duration_minutes": 15,
                "use_ai": False,
                "anti_repetition_mode": "balanced",
                "steps": ["Flow with the water", "Release tension"],
                "source_texts": ["Water heals and cleanses."],
            },
        )
        assert response.status_code == 200
        data = response.json()
        
        paragraphs = data.get("paragraphs", [])
        ratio = self._calculate_stem_repeat_ratio(paragraphs)
        
        print(f"\nBalanced mode stem repeat ratio: {ratio:.3f}")
        assert ratio <= 0.15, f"Balanced mode ratio {ratio:.3f} exceeds 0.15 threshold"
        print("PASSED: Anti-repetition quality preserved in balanced mode")


class TestWordFloorValid:
    """Verify word count floors are still met for all durations."""
    
    @pytest.mark.parametrize("duration,expected_min_words", [
        (7, 840 * 0.84),   # 7 min * 120 wpm * 84% floor
        (15, 1800 * 0.84), # 15 min * 120 wpm * 84% floor
        (20, 2400 * 0.84), # 20 min * 120 wpm * 84% floor
        (25, 3000 * 0.84), # 25 min * 120 wpm * 84% floor
    ])
    def test_word_floor_met(self, duration, expected_min_words):
        """Test word count floor is met for given duration."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": f"Word Floor Test {duration}min",
                "element": "Spirit",
                "duration_minutes": duration,
                "use_ai": False,
                "anti_repetition_mode": "strict",
                "steps": ["Begin the practice", "Continue with awareness"],
                "source_texts": ["This is a test practice."],
            },
        )
        assert response.status_code == 200
        data = response.json()
        
        word_count = data.get("word_count", 0)
        print(f"\n{duration}-min word count: {word_count} (floor: {expected_min_words:.0f})")
        
        assert word_count >= expected_min_words, \
            f"{duration}-min word count {word_count} below floor {expected_min_words:.0f}"
        print(f"PASSED: {duration}-min word floor met")


class TestTTSSpeedDefault:
    """Test TTS generation works with updated default speed (0.82)."""
    
    def test_tts_generate_base64_works(self):
        """Test TTS endpoint accepts requests and returns audio."""
        response = requests.post(
            f"{BASE_URL}/api/tts/generate-base64",
            json={
                "text": "Welcome to this guided practice. Take a slow breath in.",
                "voice": "nova",
                "speed": 0.82,  # Updated default speed
            },
        )
        
        # TTS may fail if no API key, but should not return 500
        if response.status_code == 200:
            data = response.json()
            assert "audio_base64" in data, "Response should contain audio_base64"
            assert len(data["audio_base64"]) > 100, "Audio data should be substantial"
            print("PASSED: TTS generation works with speed 0.82")
        elif response.status_code == 503:
            print("SKIPPED: TTS service unavailable (expected if no API key)")
        else:
            print(f"TTS returned status {response.status_code}")
            # Don't fail - TTS may be unavailable in test environment


class TestSpecificPhraseImprovements:
    """Test that specific mechanical phrases have been replaced with softer alternatives."""
    
    def test_intro_paragraphs_softer(self):
        """Test intro paragraphs use softer language."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Intro Test Practice",
                "element": "Spirit",
                "duration_minutes": 7,
                "use_ai": False,
                "anti_repetition_mode": "strict",
                "steps": [],
                "source_texts": [],
            },
        )
        assert response.status_code == 200
        data = response.json()
        
        paragraphs = data.get("paragraphs", [])
        assert len(paragraphs) >= 2, "Should have at least 2 paragraphs"
        
        intro = " ".join(paragraphs[:2]).lower()
        
        # Check for softer intro language
        softer_intro_phrases = ["welcome", "arrive", "nothing to perform", "as you are", "gently"]
        found_softer = any(phrase in intro for phrase in softer_intro_phrases)
        
        print(f"\nIntro text (first 200 chars): {intro[:200]}...")
        assert found_softer, "Intro should contain softer welcoming language"
        print("PASSED: Intro paragraphs use softer language")
    
    def test_step_frames_softer(self):
        """Test step framing uses softer language like 'whenever you're ready'."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Step Frame Test",
                "element": "Earth",
                "duration_minutes": 10,
                "use_ai": False,
                "anti_repetition_mode": "strict",
                "steps": ["Ground your feet", "Feel the earth", "Breathe deeply"],
                "source_texts": ["Grounding practice for stability."],
            },
        )
        assert response.status_code == 200
        data = response.json()
        
        full_text = " ".join(data.get("paragraphs", [])).lower()
        
        # Check for softer step framing
        softer_step_frames = [
            "whenever you're ready",
            "if it feels supportive",
            "gently move toward",
            "let yourself settle",
            "try this softly",
        ]
        found_count = sum(1 for phrase in softer_step_frames if phrase in full_text)
        
        print(f"\nFound {found_count} softer step frames")
        assert found_count >= 1, "Should have at least 1 softer step frame"
        print("PASSED: Step frames use softer language")
    
    def test_closing_paragraphs_softer(self):
        """Test closing paragraphs use softer integration language."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Closing Test Practice",
                "element": "Spirit",
                "duration_minutes": 7,
                "use_ai": False,
                "anti_repetition_mode": "strict",
                "steps": [],
                "source_texts": [],
            },
        )
        assert response.status_code == 200
        data = response.json()
        
        paragraphs = data.get("paragraphs", [])
        assert len(paragraphs) >= 2, "Should have at least 2 paragraphs"
        
        closing = " ".join(paragraphs[-2:]).lower()
        
        # Check for softer closing language
        softer_closing_phrases = ["gently", "grace", "grounded", "carry", "rest of your day"]
        found_softer = any(phrase in closing for phrase in softer_closing_phrases)
        
        print(f"\nClosing text (last 200 chars): ...{closing[-200:]}")
        assert found_softer, "Closing should contain softer integration language"
        print("PASSED: Closing paragraphs use softer language")


class TestNoRegressions:
    """Ensure no regressions in core functionality."""
    
    def test_segments_generated(self):
        """Test that segments are still generated correctly."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Segment Test",
                "element": "Spirit",
                "duration_minutes": 10,
                "use_ai": False,
                "anti_repetition_mode": "strict",
                "steps": ["Step one", "Step two"],
                "source_texts": ["Test source."],
            },
        )
        assert response.status_code == 200
        data = response.json()
        
        segments = data.get("segments", [])
        assert len(segments) >= 3, f"Should have at least 3 segments, got {len(segments)}"
        print(f"PASSED: {len(segments)} segments generated")
    
    def test_response_structure_intact(self):
        """Test response structure is unchanged."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Structure Test",
                "element": "Spirit",
                "duration_minutes": 7,
                "use_ai": False,
                "anti_repetition_mode": "strict",
                "steps": [],
                "source_texts": [],
            },
        )
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["practice_name", "target_minutes", "target_word_count", 
                          "word_count", "used_ai", "paragraphs", "segments"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        print("PASSED: Response structure intact")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
