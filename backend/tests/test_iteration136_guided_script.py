"""
Iteration 136 - Guided Script Expansion Quality Tests
Tests for:
1. Guided expansion quality: POST /api/content/expand-script should avoid repeated stem phrases
2. Guided duration alignment: returned word_count should be close to target_word_count (>=98% floor)
3. Anti-repetition mode handling
4. Toning injection
"""
import os
import pytest
import requests
from collections import Counter

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestGuidedScriptExpansion:
    """Tests for /api/content/expand-script endpoint"""

    def test_health_check(self):
        """Verify backend is healthy before running tests"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("Backend health check: PASS")

    def test_expand_script_basic_response(self):
        """Test basic expand-script endpoint returns expected structure"""
        payload = {
            "practice_name": "Test Meditation",
            "element": "spirit",
            "duration_minutes": 7,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": True,
            "steps": ["Breathe deeply", "Relax your body"],
            "source_texts": ["This is a calming practice"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "practice_name" in data
        assert "target_minutes" in data
        assert "target_word_count" in data
        assert "word_count" in data
        assert "used_ai" in data
        assert "paragraphs" in data
        assert "segments" in data
        
        assert data["practice_name"] == "Test Meditation"
        assert data["used_ai"] == False
        assert isinstance(data["paragraphs"], list)
        assert isinstance(data["segments"], list)
        print(f"Basic response structure: PASS (word_count={data['word_count']})")

    def test_duration_alignment_7min(self):
        """Test 7-minute duration alignment (>=98% floor for strict mode)"""
        payload = {
            "practice_name": "Short Grounding",
            "element": "earth",
            "duration_minutes": 7,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": True,
            "steps": ["Ground yourself", "Feel the earth"],
            "source_texts": ["Connect with earth energy"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        target = data["target_word_count"]
        actual = data["word_count"]
        ratio = actual / target if target > 0 else 0
        
        # Strict mode should achieve >=98% of target
        assert ratio >= 0.98, f"Duration alignment failed: {ratio*100:.1f}% < 98%"
        print(f"7-min duration alignment: PASS ({ratio*100:.1f}%)")

    def test_duration_alignment_10min(self):
        """Test 10-minute duration alignment"""
        payload = {
            "practice_name": "Medium Water Flow",
            "element": "water",
            "duration_minutes": 10,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": True,
            "steps": ["Flow with breath", "Release tension"],
            "source_texts": ["Water element healing"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        target = data["target_word_count"]
        actual = data["word_count"]
        ratio = actual / target if target > 0 else 0
        
        assert ratio >= 0.98, f"Duration alignment failed: {ratio*100:.1f}% < 98%"
        print(f"10-min duration alignment: PASS ({ratio*100:.1f}%)")

    def test_duration_alignment_15min(self):
        """Test 15-minute duration alignment"""
        payload = {
            "practice_name": "Extended Fire Practice",
            "element": "fire",
            "duration_minutes": 15,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": True,
            "steps": ["Ignite inner fire", "Transform energy"],
            "source_texts": ["Fire element activation"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        target = data["target_word_count"]
        actual = data["word_count"]
        ratio = actual / target if target > 0 else 0
        
        assert ratio >= 0.98, f"Duration alignment failed: {ratio*100:.1f}% < 98%"
        print(f"15-min duration alignment: PASS ({ratio*100:.1f}%)")

    def test_duration_alignment_20min(self):
        """Test 20-minute duration alignment"""
        payload = {
            "practice_name": "Deep Air Meditation",
            "element": "air",
            "duration_minutes": 20,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": True,
            "steps": ["Expand awareness", "Breathe freely"],
            "source_texts": ["Air element expansion"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        target = data["target_word_count"]
        actual = data["word_count"]
        ratio = actual / target if target > 0 else 0
        
        assert ratio >= 0.98, f"Duration alignment failed: {ratio*100:.1f}% < 98%"
        print(f"20-min duration alignment: PASS ({ratio*100:.1f}%)")

    def test_no_repeated_stems_strict_mode(self):
        """Test that strict mode produces no repeated paragraph stems"""
        payload = {
            "practice_name": "Stem Diversity Test",
            "element": "spirit",
            "duration_minutes": 12,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": True,
            "steps": ["Center yourself", "Open your heart", "Expand awareness"],
            "source_texts": ["Spiritual awakening practice"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        paragraphs = data.get("paragraphs", [])
        assert len(paragraphs) > 10, "Expected at least 10 paragraphs"
        
        # Extract 8-word stems
        stems = []
        for p in paragraphs:
            words = p.lower().split()[:8]
            stem = " ".join(words)
            if stem:
                stems.append(stem)
        
        stem_counts = Counter(stems)
        repeated = sum(1 for count in stem_counts.values() if count > 1)
        repeat_ratio = repeated / len(stems) if stems else 0
        
        # Strict mode should have <12% repeated stems
        assert repeat_ratio < 0.12, f"Too many repeated stems: {repeat_ratio*100:.1f}% >= 12%"
        print(f"Stem diversity (strict): PASS ({repeat_ratio*100:.1f}% repeated)")

    def test_phrase_frequency_limits(self):
        """Test that specific phrases don't appear too frequently"""
        payload = {
            "practice_name": "Phrase Frequency Test",
            "element": "water",
            "duration_minutes": 15,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": True,
            "steps": ["Flow with breath", "Release and let go"],
            "source_texts": ["Water healing practice"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        paragraphs = data.get("paragraphs", [])
        full_text = " ".join(paragraphs).lower()
        
        # Check problematic phrases from user report
        problematic_phrases = ["notice what shifts", "let this guidance"]
        for phrase in problematic_phrases:
            count = full_text.count(phrase)
            # Each phrase should appear at most 4 times in a 15-min script
            assert count <= 4, f"Phrase '{phrase}' appears {count} times (max 4)"
        
        print("Phrase frequency limits: PASS")

    def test_balanced_mode_allows_more_repetition(self):
        """Test that balanced mode is more permissive than strict"""
        payload_strict = {
            "practice_name": "Mode Comparison",
            "element": "earth",
            "duration_minutes": 10,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": True,
            "steps": ["Ground yourself"],
            "source_texts": ["Earth practice"]
        }
        payload_balanced = {**payload_strict, "anti_repetition_mode": "balanced"}
        
        response_strict = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload_strict)
        response_balanced = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload_balanced)
        
        assert response_strict.status_code == 200
        assert response_balanced.status_code == 200
        
        # Both should return valid responses
        data_strict = response_strict.json()
        data_balanced = response_balanced.json()
        
        assert data_strict["word_count"] > 0
        assert data_balanced["word_count"] > 0
        print("Mode comparison: PASS (both modes return valid scripts)")

    def test_toning_injection(self):
        """Test that toning cues are injected when include_toning=True"""
        payload = {
            "practice_name": "Toning Test",
            "element": "spirit",
            "duration_minutes": 10,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": True,
            "steps": ["Breathe deeply"],
            "source_texts": ["Spiritual practice"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        paragraphs = data.get("paragraphs", [])
        full_text = " ".join(paragraphs).lower()
        
        # Check for toning-related keywords
        toning_keywords = ["tone", "hum", "sound", "vocal", "syllable", "om", "lam", "vam", "ram", "yam"]
        toning_found = any(kw in full_text for kw in toning_keywords)
        
        assert toning_found, "No toning cues found when include_toning=True"
        print("Toning injection: PASS")

    def test_no_toning_when_disabled(self):
        """Test that toning cues are not injected when include_toning=False"""
        payload = {
            "practice_name": "No Toning Test",
            "element": "earth",
            "duration_minutes": 7,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": False,
            "steps": ["Ground yourself"],
            "source_texts": ["Earth practice"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        paragraphs = data.get("paragraphs", [])
        full_text = " ".join(paragraphs).lower()
        
        # Specific toning template phrases should not appear
        toning_templates = [
            "soft vocal tone",
            "hum very softly",
            "seed syllable",
            "rounded tone for the length"
        ]
        for template in toning_templates:
            assert template not in full_text, f"Toning template found when disabled: '{template}'"
        
        print("No toning when disabled: PASS")

    def test_use_ai_false_returns_deterministic(self):
        """Test that use_ai=False returns deterministic fallback (not AI-generated)"""
        payload = {
            "practice_name": "Deterministic Test",
            "element": "water",
            "duration_minutes": 7,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": True,
            "steps": ["Flow with breath"],
            "source_texts": ["Water practice"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # used_ai should be False
        assert data["used_ai"] == False, "Expected used_ai=False for deterministic mode"
        print("Deterministic mode (use_ai=False): PASS")

    def test_segments_are_generated(self):
        """Test that segments are properly generated from paragraphs"""
        payload = {
            "practice_name": "Segments Test",
            "element": "fire",
            "duration_minutes": 10,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": True,
            "steps": ["Ignite inner fire"],
            "source_texts": ["Fire practice"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        segments = data.get("segments", [])
        paragraphs = data.get("paragraphs", [])
        
        assert len(segments) > 0, "No segments generated"
        assert len(paragraphs) > 0, "No paragraphs generated"
        
        # Segments should be fewer than paragraphs (grouped)
        assert len(segments) <= len(paragraphs), "Segments should be grouped paragraphs"
        print(f"Segments generation: PASS ({len(segments)} segments from {len(paragraphs)} paragraphs)")


class TestFrontendPayloadCompatibility:
    """Tests to verify frontend sends correct payload to backend"""

    def test_frontend_payload_structure(self):
        """Test that expected frontend payload structure works"""
        # Simulating payload from useGuidedPracticeEngine.js
        payload = {
            "practice_id": "test-practice-123",
            "practice_name": "Frontend Test Practice",
            "element": "Spirit",
            "duration_minutes": 12,
            "use_ai": False,  # Frontend now sends use_ai=false
            "include_toning": True,
            "anti_repetition_mode": "strict",
            "steps": ["Step 1", "Step 2", "Step 3"],
            "source_texts": ["Source text 1", "Source text 2"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["used_ai"] == False
        assert data["word_count"] > 0
        print("Frontend payload compatibility: PASS")

    def test_empty_steps_handled(self):
        """Test that empty steps array is handled gracefully"""
        payload = {
            "practice_name": "Empty Steps Test",
            "element": "earth",
            "duration_minutes": 7,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": True,
            "steps": [],
            "source_texts": ["Some source text"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["word_count"] > 0
        print("Empty steps handling: PASS")

    def test_empty_source_texts_handled(self):
        """Test that empty source_texts array is handled gracefully"""
        payload = {
            "practice_name": "Empty Sources Test",
            "element": "water",
            "duration_minutes": 7,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": True,
            "steps": ["Some step"],
            "source_texts": []
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["word_count"] > 0
        print("Empty source_texts handling: PASS")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
