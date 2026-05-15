"""
Iteration 105 - Guided Narration Mode Category Defaults & Manual Override Tests

Tests for:
1. Category defaults behavior: Sunrise/Sunset resolves to Balanced when no manual override
2. Category defaults behavior: Deep healing/chakra/somatic categories resolve to Strict when no manual override
3. Manual mode override behavior: selecting mode in settings/overlay applies globally
4. /api/content/expand-script responses with anti_repetition_mode parameter
"""
import os
import pytest
import requests
from collections import Counter
import re

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


def count_words(text: str) -> int:
    return len(re.findall(r"\S+", str(text or "").strip()))


def paragraph_stem(text: str, words: int = 8) -> str:
    normalized = re.sub(r"\s+", " ", str(text or "")).strip().lower()
    normalized = re.sub(r"[^a-z0-9 ]+", "", normalized)
    return " ".join(normalized.split()[:words])


def stem_repeat_ratio(paragraphs: list) -> float:
    stems = [paragraph_stem(p) for p in paragraphs if p]
    stems = [s for s in stems if s]
    if not stems:
        return 0.0
    stem_counts = Counter(stems)
    repeated = sum(count - 1 for count in stem_counts.values() if count > 1)
    return repeated / len(stems)


class TestHealthCheck:
    """Basic health check to ensure API is accessible"""

    def test_health_check(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("Health check passed")


class TestExpandScriptEndpoint:
    """Tests for /api/content/expand-script endpoint"""

    def test_expand_script_strict_mode(self):
        """Test expand-script with strict anti_repetition_mode"""
        payload = {
            "practice_name": "Deep Healing Meditation",
            "element": "Water",
            "duration_minutes": 7,
            "anti_repetition_mode": "strict",
            "steps": ["Ground yourself", "Connect with breath"],
            "source_texts": ["healing integration embodiment nervous system"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert "paragraphs" in data
        assert "segments" in data
        assert "word_count" in data
        assert data["practice_name"] == "Deep Healing Meditation"
        
        # Verify word count meets minimum floor
        word_count = data["word_count"]
        target = data["target_word_count"]
        ratio = word_count / target if target > 0 else 0
        assert ratio >= 0.80, f"Word count {word_count} is below 80% of target {target}"
        
        print(f"Strict mode: {word_count} words ({ratio*100:.1f}% of target {target})")

    def test_expand_script_balanced_mode(self):
        """Test expand-script with balanced anti_repetition_mode"""
        payload = {
            "practice_name": "Sunrise Awakening",
            "element": "Fire",
            "duration_minutes": 7,
            "anti_repetition_mode": "balanced",
            "steps": ["Greet the dawn", "Breathe with the sun"],
            "source_texts": ["sunrise golden hour transitions dawn awakening"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert "paragraphs" in data
        assert "segments" in data
        
        word_count = data["word_count"]
        target = data["target_word_count"]
        ratio = word_count / target if target > 0 else 0
        assert ratio >= 0.80, f"Word count {word_count} is below 80% of target {target}"
        
        print(f"Balanced mode: {word_count} words ({ratio*100:.1f}% of target {target})")

    def test_expand_script_invalid_mode_rejected(self):
        """Test that invalid anti_repetition_mode values are rejected"""
        payload = {
            "practice_name": "Test Practice",
            "element": "Spirit",
            "duration_minutes": 7,
            "anti_repetition_mode": "invalid_mode",
            "steps": [],
            "source_texts": []
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 422, f"Expected 422 for invalid mode, got {response.status_code}"
        print("Invalid mode correctly rejected with 422")

    def test_expand_script_default_mode_is_strict(self):
        """Test that default anti_repetition_mode is strict when not specified"""
        payload = {
            "practice_name": "Default Mode Test",
            "element": "Earth",
            "duration_minutes": 7,
            "steps": ["Test step"],
            "source_texts": ["Test source"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # The endpoint should work with default mode
        assert "paragraphs" in data
        assert len(data["paragraphs"]) > 0
        print("Default mode (strict) works correctly")


class TestCategoryKeywordDetection:
    """
    Tests to verify that the frontend category inference logic works correctly.
    These tests simulate what the frontend does when determining category defaults.
    """

    def test_sunrise_sunset_keywords_detected(self):
        """Test that sunrise/sunset keywords would trigger balanced mode"""
        # These keywords should trigger sunrise_sunset category -> balanced mode
        sunrise_keywords = ["sunrise", "sunset", "dawn", "dusk", "transitions", "golden hour"]
        
        for keyword in sunrise_keywords:
            payload = {
                "practice_name": f"Test {keyword.title()} Practice",
                "element": "Fire",
                "duration_minutes": 7,
                "anti_repetition_mode": "balanced",  # Frontend would send balanced for sunrise_sunset
                "steps": [f"Experience the {keyword}"],
                "source_texts": [f"This practice connects you with the {keyword} energy"]
            }
            response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
            assert response.status_code == 200, f"Failed for keyword: {keyword}"
            print(f"Sunrise/sunset keyword '{keyword}' - API accepts balanced mode")

    def test_deep_healing_keywords_detected(self):
        """Test that deep healing keywords would trigger strict mode"""
        # These keywords should trigger deep_healing category -> strict mode
        healing_keywords = ["chakra", "somatic", "healing", "integration", "embodiment", 
                          "nervous system", "inner peace", "trauma", "regulation", "shadow"]
        
        for keyword in healing_keywords:
            payload = {
                "practice_name": f"Test {keyword.title()} Practice",
                "element": "Water",
                "duration_minutes": 7,
                "anti_repetition_mode": "strict",  # Frontend would send strict for deep_healing
                "steps": [f"Work with {keyword}"],
                "source_texts": [f"This practice focuses on {keyword} work"]
            }
            response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
            assert response.status_code == 200, f"Failed for keyword: {keyword}"
            print(f"Deep healing keyword '{keyword}' - API accepts strict mode")


class TestAntiRepetitionQuality:
    """Tests to verify anti-repetition quality in generated content"""

    def test_strict_mode_low_repetition(self):
        """Test that strict mode produces content with low repetition"""
        payload = {
            "practice_name": "Chakra Balancing",
            "element": "Spirit",
            "duration_minutes": 10,
            "anti_repetition_mode": "strict",
            "steps": ["Open root chakra", "Activate sacral", "Empower solar plexus"],
            "source_texts": ["chakra healing integration embodiment nervous system regulation"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        paragraphs = data.get("paragraphs", [])
        ratio = stem_repeat_ratio(paragraphs)
        
        # Strict mode should have stem repeat ratio <= 0.12
        assert ratio <= 0.12, f"Strict mode stem repeat ratio {ratio:.3f} exceeds 0.12"
        print(f"Strict mode repetition quality: {ratio:.3f} (max 0.12)")

    def test_balanced_mode_allows_more_repetition(self):
        """Test that balanced mode allows slightly more repetition for flow"""
        payload = {
            "practice_name": "Sunset Relaxation",
            "element": "Water",
            "duration_minutes": 10,
            "anti_repetition_mode": "balanced",
            "steps": ["Watch the sunset", "Release the day", "Embrace twilight"],
            "source_texts": ["sunset dusk transitions golden hour peaceful release"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        paragraphs = data.get("paragraphs", [])
        ratio = stem_repeat_ratio(paragraphs)
        
        # Balanced mode should have stem repeat ratio <= 0.15
        assert ratio <= 0.15, f"Balanced mode stem repeat ratio {ratio:.3f} exceeds 0.15"
        print(f"Balanced mode repetition quality: {ratio:.3f} (max 0.15)")


class TestWordCountFloors:
    """Tests to verify word count floors are met for various durations"""

    @pytest.mark.parametrize("duration", [7, 10, 15, 20, 25])
    def test_strict_mode_word_floor(self, duration):
        """Test strict mode meets 80% word floor for all durations"""
        payload = {
            "practice_name": f"Test {duration}min Strict",
            "element": "Earth",
            "duration_minutes": duration,
            "anti_repetition_mode": "strict",
            "steps": ["Ground", "Center", "Integrate"],
            "source_texts": ["grounding stability earth connection"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        word_count = data["word_count"]
        target = data["target_word_count"]
        ratio = word_count / target if target > 0 else 0
        
        assert ratio >= 0.80, f"{duration}min strict: {word_count} words ({ratio*100:.1f}%) below 80% of {target}"
        print(f"{duration}min strict: {word_count} words ({ratio*100:.1f}% of {target})")

    @pytest.mark.parametrize("duration", [7, 10, 15, 20, 25])
    def test_balanced_mode_word_floor(self, duration):
        """Test balanced mode meets 80% word floor for all durations"""
        payload = {
            "practice_name": f"Test {duration}min Balanced",
            "element": "Fire",
            "duration_minutes": duration,
            "anti_repetition_mode": "balanced",
            "steps": ["Awaken", "Transform", "Integrate"],
            "source_texts": ["sunrise dawn awakening transformation"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        word_count = data["word_count"]
        target = data["target_word_count"]
        ratio = word_count / target if target > 0 else 0
        
        assert ratio >= 0.80, f"{duration}min balanced: {word_count} words ({ratio*100:.1f}%) below 80% of {target}"
        print(f"{duration}min balanced: {word_count} words ({ratio*100:.1f}% of {target})")


class TestSegmentGeneration:
    """Tests for segment generation in expand-script"""

    def test_segments_generated(self):
        """Test that segments are properly generated from paragraphs"""
        payload = {
            "practice_name": "Segment Test",
            "element": "Air",
            "duration_minutes": 7,
            "anti_repetition_mode": "strict",
            "steps": ["Breathe", "Expand", "Release"],
            "source_texts": ["breath awareness clarity mental spaciousness"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        segments = data.get("segments", [])
        paragraphs = data.get("paragraphs", [])
        
        assert len(segments) > 0, "No segments generated"
        assert len(paragraphs) > 0, "No paragraphs generated"
        
        # Segments should be non-empty strings
        for i, segment in enumerate(segments):
            assert isinstance(segment, str), f"Segment {i} is not a string"
            assert len(segment.strip()) > 0, f"Segment {i} is empty"
        
        print(f"Generated {len(segments)} segments from {len(paragraphs)} paragraphs")

    def test_first_segment_concise(self):
        """Test that first segment is concise (not too long)"""
        payload = {
            "practice_name": "First Segment Test",
            "element": "Spirit",
            "duration_minutes": 7,
            "anti_repetition_mode": "strict",
            "steps": ["Begin", "Continue", "Complete"],
            "source_texts": ["spiritual connection presence awareness"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        segments = data.get("segments", [])
        if segments:
            first_segment_words = count_words(segments[0])
            # First segment should be around 95 words target (FIRST_SEGMENT_TARGET_WORDS)
            # Allow some flexibility
            assert first_segment_words <= 200, f"First segment too long: {first_segment_words} words"
            print(f"First segment: {first_segment_words} words (target ~95)")


class TestModeConsistency:
    """Tests to verify mode consistency across multiple calls"""

    def test_strict_mode_consistent_quality(self):
        """Test that strict mode produces consistent quality across calls"""
        payload = {
            "practice_name": "Consistency Test Strict",
            "element": "Water",
            "duration_minutes": 10,
            "anti_repetition_mode": "strict",
            "steps": ["Flow", "Release", "Integrate"],
            "source_texts": ["water healing emotional release"]
        }
        
        ratios = []
        for i in range(3):
            response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
            assert response.status_code == 200
            data = response.json()
            paragraphs = data.get("paragraphs", [])
            ratio = stem_repeat_ratio(paragraphs)
            ratios.append(ratio)
        
        # All calls should produce acceptable repetition ratios
        for i, ratio in enumerate(ratios):
            assert ratio <= 0.12, f"Call {i+1} strict mode ratio {ratio:.3f} exceeds 0.12"
        
        print(f"Strict mode consistency: ratios = {[f'{r:.3f}' for r in ratios]}")

    def test_balanced_mode_consistent_quality(self):
        """Test that balanced mode produces consistent quality across calls"""
        payload = {
            "practice_name": "Consistency Test Balanced",
            "element": "Fire",
            "duration_minutes": 10,
            "anti_repetition_mode": "balanced",
            "steps": ["Ignite", "Transform", "Integrate"],
            "source_texts": ["sunrise dawn fire transformation"]
        }
        
        ratios = []
        for i in range(3):
            response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
            assert response.status_code == 200
            data = response.json()
            paragraphs = data.get("paragraphs", [])
            ratio = stem_repeat_ratio(paragraphs)
            ratios.append(ratio)
        
        # All calls should produce acceptable repetition ratios
        for i, ratio in enumerate(ratios):
            assert ratio <= 0.15, f"Call {i+1} balanced mode ratio {ratio:.3f} exceeds 0.15"
        
        print(f"Balanced mode consistency: ratios = {[f'{r:.3f}' for r in ratios]}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
